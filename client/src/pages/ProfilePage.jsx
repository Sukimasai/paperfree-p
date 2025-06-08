import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContextInstance.js";
import FeedbackModal from "../components/FeedbackModal";
import PasswordInput from "../components/PasswordInput";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { updateUserPhone } from "../components/utils";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <p className="text-white font-[Lexend] font-light">Loading...</p>
      </div>
    );
  if (!user) window.location.href = "/login";
  if (user.role !== "user") return <Navigate to="/" replace />;

  const handleEdit = () => {
    setEditMode(true);
    setError("");
    setSuccess("");
    setPhone(user.phone || "");
    setPassword("");
  };

  const handleCancel = () => {
    setEditMode(false);
    setError("");
    setSuccess("");
    setPhone(user.phone || "");
    setPassword("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await updateUserPhone(phone, password);
      setFeedback({
        show: true,
        message: "Phone number updated successfully.",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        setEditMode(false);
        refreshUser && refreshUser();
      }, 1500);
    } catch (error) {
      setFeedback({
        show: true,
        message: `Update phone failed: ${error.message}`,
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1500
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Header />
      <div className="flex flex-col items-center px-4 py-8 mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-[Lexend] pt-[10vh] min-h-screen w-full">
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
        <h1 className="mb-4 text-3xl font-light text-white">Profile</h1>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-6 bg-slate-800/40 border border-white/10 rounded-xl shadow-xl backdrop-blur-sm"
        >
          {" "}
          <div className="mb-4">
            <label className="block text-sm font-light text-green-300 font-[Lexend]">
              Full Name
            </label>
            <div className="block w-full p-2 mt-1 border border-white/20 rounded-md bg-slate-700/50 text-white font-[Lexend] font-light">
              {user.full_name}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-light text-green-300 font-[Lexend]">
              Role
            </label>
            <div className="block w-full p-2 mt-1 border border-white/20 rounded-md bg-slate-700/50 text-white font-[Lexend] font-light">
              {user.role}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-light text-green-300 font-[Lexend]">
              Phone Number
            </label>
            {editMode ? (
              <input
                type="text"
                className="block w-full p-2 mt-1 border border-white/20 rounded-md bg-slate-700/50 text-white font-[Lexend] font-light focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            ) : (
              <div className="block w-full p-2 mt-1 border border-white/20 rounded-md bg-slate-700/50 text-white font-[Lexend] font-light">
                {user.phone}
              </div>
            )}
          </div>{" "}
          {editMode && (
            <div className="mb-4">
              <label className="block text-sm font-light text-green-300 font-[Lexend]">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-2 mt-1 border border-white/20 rounded-md bg-slate-700/50 text-white font-[Lexend] font-light focus:ring-2 focus:ring-green-400 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          )}
          {error && (
            <div className="text-red-300 mb-2 text-center font-[Lexend] font-light">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-300 mb-2 text-center font-[Lexend] font-light">
              {success}
            </div>
          )}{" "}
          <div className="flex gap-4 justify-center mt-4">
            {editMode ? (
              <>
                <button
                  type="submit"
                  className="w-full py-3 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:transform-none"
                  disabled={isSubmitting || !phone || !password}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-3 text-white bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 disabled:transform-none"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Edit Phone Number
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
