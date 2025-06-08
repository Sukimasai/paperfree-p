import { useContext, useState, useEffect } from "react";
import AuthContext from "../contexts/AuthContextInstance.js";
import { Navigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";
import FeedbackModal from "../components/FeedbackModal";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { logoutUser } from "../components/utils";

export default function Logout() {
  const { user, loading } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackIsSuccess, setFeedbackIsSuccess] = useState(true);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logoutUser();
      setShowModal(false);
      setFeedbackMessage("Logged out successfully!");
      setFeedbackIsSuccess(true);
      setShowFeedback(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch {
      setLogoutError("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <p className="text-white font-[Lexend] font-light">Loading...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen font-[Lexend] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-[10vh]">
        <h1 className="font-[Lexend] text-2xl text-white font-light mb-4">
          Logout
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Logout
        </button>{" "}
        <ConfirmationModal
          show={showModal}
          message="Are you sure to log out?"
          onConfirm={handleLogout}
          onCancel={() => !isLoggingOut && setShowModal(false)}
          confirmText={isLoggingOut ? "Logging out..." : "Confirm"}
          loading={isLoggingOut}
          error={logoutError}
        />
        <FeedbackModal
          show={showFeedback}
          message={feedbackMessage}
          isSuccess={feedbackIsSuccess}
          onClose={() => setShowFeedback(false)}
          duration={1200}
        />
      </div>
      <Footer />
    </>
  );
}
