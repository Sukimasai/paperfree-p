import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rtAdminRoutes from "./routes/rtAdminRoutes.js";
import kelurahanAdminRoutes from "./routes/kelurahanAdminRoutes.js";
import requestsRoutes from "./routes/requestRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import auth from "./middleware/auth.js";
import cookieParserMiddleware from "./middleware/cookieParser.js";
import locationRoutes from "./routes/locationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import setAnonymousContext from "./middleware/setAnonymousContext.js";

dotenv.config();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  "https://paperfree-omega.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-API-Key",
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);

app.options("*", (req, res) => {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Origin"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");
    return res.status(200).end();
  }
  
  return res.status(403).end();
});

app.use(express.json());
app.use(cookieParserMiddleware);

// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key, X-Requested-With, Accept, Origin"
    );
  }
  
  next();
});

app.use("/api/auth", setAnonymousContext, authRoutes);
app.use("/api/documents", auth, documentRoutes);
app.use("/api/shares", setAnonymousContext, shareRoutes);
app.use("/api/admin", auth, adminRoutes);
app.use("/api/rt-admin", auth, rtAdminRoutes);
app.use("/api/kelurahan-admin", auth, kelurahanAdminRoutes);
app.use("/api/users", setAnonymousContext, userRoutes);
app.use("/api/locations", setAnonymousContext, locationRoutes);
app.use("/api/requests", auth, requestsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({
      message: err.message || "Internal server error",
      detail: err.message,
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
