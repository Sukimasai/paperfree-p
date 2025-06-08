import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import Blank from "./pages/Blank";
import DocumentPage from "./pages/DocumentPage";
import UploadPage from "./pages/UploadPage";
import LogOut from "./pages/Logout";
import Request from "./pages/RequestPage";
import History from "./pages/HistoryPage";
import GetShare from "./pages/GetSharePage";
import PendingPage from "./adminpages/PendingPage";
import RequestUploadPage from "./pages/RequestUploadPage";
import RequestsPendingPage from "./adminpages/RequestsPendingPage";
import Home from "./pages/HomePage";
import Profile from "./pages/ProfilePage";
import GetRequestSharePage from "./pages/GetRequestSharePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Blank />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/document" element={<DocumentPage />} />
        <Route path="/document/upload" element={<UploadPage />} />
        <Route path="/requests" element={<Request />} />
        <Route path="/requests/upload" element={<RequestUploadPage />} />
        <Route path="/history" element={<History />} />
        <Route path="/shares/:token" element={<GetShare />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/pending" element={<PendingPage />} />
        <Route path="/rt-admin/pending" element={<RequestsPendingPage />} />
        <Route
          path="/kelurahan-admin/pending"
          element={<RequestsPendingPage />}
        />
        <Route path="/logout" element={<LogOut />} />
        <Route path="/request-share/:token" element={<GetRequestSharePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
