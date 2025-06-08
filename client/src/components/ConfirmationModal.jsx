import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ConfirmationModal({
  show,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  loading = false,
  error = "",
  children,
}) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (show && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 0.5, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          ref={modalRef}
          className="bg-slate-800/90 backdrop-blur-lg border border-white/10 p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-xl text-center opacity-100 z-50 pointer-events-auto relative"
        >
          <button
            className="absolute top-3 right-3 text-white/70 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-200"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            <img
              src="/close.png"
              alt="Close"
              className="w-4 h-4 filter brightness-0 invert"
            />
          </button>
          <h2 className="text-xl font-light mb-6 text-white font-[Lexend]">
            Confirm Action
          </h2>{" "}
          <p className="mb-6 text-white/80 font-[Lexend] font-light">
            {message}
          </p>
          {error && (
            <div className="text-red-300 mb-4 p-3 bg-red-500/20 rounded-lg border border-red-300/20">
              {error}
            </div>
          )}
          {children}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-slate-600/50 text-white/80 rounded-xl hover:bg-slate-600/70 transition-all duration-200 font-[Lexend] font-light border border-white/10"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-400 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100 shadow-xl font-[Lexend] font-light"
              disabled={loading}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            onCancel();
          }
        }}
      ></div>
    </>
  );
}
