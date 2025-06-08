import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import PasswordInput from "../components/PasswordInput";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { registerUser } from "../components/utils";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const data = await registerUser(fullName, phone, password);
      if (data.error) {
        setError(data.error);
        return;
      }
      setFeedback({
        show: true,
        message: "Registration successful!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        setTimeout(
          () => navigate("/success", { state: { registerSuccess: true } }),
          800
        );
      }, 1500);
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 font-[Lexend] flex items-center justify-center px-8 py-24">
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-light mb-4 text-white tracking-tight">
              Join <span className="text-green-300 font-medium">PaperFree</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto mb-6"></div>
            <p className="text-white/70 font-light">Create your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 space-y-6"
          >
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Phone number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Confirm Password
              </label>
              <PasswordInput
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="block w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg hover:scale-105 hover:shadow-green-500/25 hover:from-green-500 hover:to-blue-500 transition-all duration-300 border border-green-500/20"
            >
              Create Account
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-center text-sm">{error}</p>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-white/70 font-light">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-green-300 hover:text-green-200 font-medium transition-colors duration-300 hover:underline decoration-green-300"
            >
              Log in here
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
