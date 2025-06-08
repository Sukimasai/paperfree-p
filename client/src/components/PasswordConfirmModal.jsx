import { useState, useEffect } from "react";
import PasswordInput from "./PasswordInput";

export default function PasswordConfirmModal({
  show,
  loading = false,
  error = "",
  onConfirm,
  onCancel,
  title = "Confirm password",
  message = "Please enter your password to confirm sharing.",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!show) setPassword("");
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {" "}
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl shadow-2xl z-60 min-w-[350px] max-w-md mx-4">
        <h2 className="text-xl md:text-2xl font-light mb-4 text-white tracking-tight font-[Lexend]">
          {title}
        </h2>
        <p className="text-white/70 mb-6 font-light leading-relaxed font-[Lexend]">
          {message}
        </p>

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 mb-6"
          placeholder="Enter your password"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && password)
              onConfirm(e.target.value);
          }}
        />

        <div className="flex gap-3 justify-end">
          {" "}
          <button
            onClick={() => {
              setPassword("");
              onCancel();
            }}
            className="px-6 py-3 bg-slate-600/50 text-white/90 rounded-xl hover:bg-slate-600 transition-all duration-300 font-light border border-slate-600/50 font-[Lexend]"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(password)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-500 hover:to-blue-500 hover:scale-105 transition-all duration-300 font-light shadow-lg border border-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-[Lexend]"
            disabled={loading || !password}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-sm font-[Lexend] font-light">
              {error}
            </p>
          </div>
        )}
      </div>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onCancel}
      ></div>
    </div>
  );
}
