import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function FeedbackModal({
  show,
  message,
  isSuccess,
  onClose,
  duration = 1500,
}) {
  const timerRef = useRef();
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (show && duration > 0) {
      timerRef.current = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timerRef.current);
    }
  }, [show, duration, onClose]);

  useEffect(() => {
    if (show && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 0.5, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 font-[Lexend]">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl p-8 w-96 text-center z-20 flex flex-col items-center"
      >
        {isSuccess ? (
          <svg
            className="w-12 h-12 text-green-300 mb-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-12 h-12 text-red-300 mb-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        <span
          className={`font-light text-lg ${
            isSuccess ? "text-green-300" : "text-red-300"
          }`}
        >
          {message}
        </span>
      </div>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
        onClick={onClose}
      ></div>
    </div>
  );
}
