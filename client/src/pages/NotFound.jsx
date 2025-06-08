import { Navigate } from "react-router-dom";
import useAuth from "../contexts/UseAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function NotFound() {
  const { loading } = useAuth();
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-backgroud font-[Raleway]">
        <h1 className="mb-4 text-3xl font-bold text-text">404 Not Found</h1>
        <p className="text-lg text-text">
          The page you are looking for does not exist.
        </p>
        <a href="/" className="mt-4 text-blue-500 hover:underline">
          Go back to Home
        </a>
      </div>
      <Footer />
    </>
  );
}
