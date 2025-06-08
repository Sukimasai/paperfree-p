import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import gsap from "gsap";
import { getRequest } from "./utils";

export default function QRCodeWithTimer({
  token,
  purpose,
  show = false,
  onClose,
}) {
  const [seconds, setSeconds] = useState(60);
  const [shareData, setShareData] = useState(null);
  const [error, setError] = useState(null);
  const qrContainerRef = useRef(null);
  const clientUrl = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

  useEffect(() => {
    if (token && show && qrContainerRef.current) {
      gsap.fromTo(
        qrContainerRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [token, show]);

  useEffect(() => {
    if (!token || !purpose) return;
    async function fetchShareData() {
      try {
        const res = await getRequest(purpose, token);
        if (!res.ok) throw new Error("Failed to fetch share info");
        const data = await res.json();
        setShareData(data);
      } catch (err) {
        setError("Failed to fetch share info: " + err.message);
      }
    }
    fetchShareData();
  }, [token, purpose]);

  useEffect(() => {
    if (!show || !token) return;
    setSeconds(60);
  }, [show, token]);

  useEffect(() => {
    if (!show || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, show]);

  if (!show || !token) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-90 qrCodeModal">
      <div
        className="bg-slate-800/90 backdrop-blur-lg border border-white/10 p-8 rounded-xl shadow-2xl max-w-sm text-center z-90 relative flex flex-col items-center justify-center"
        ref={qrContainerRef}
      >
        <button
          className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
          onClick={onClose}
          aria-label="Close"
        >
          <img
            src="/close.png"
            alt="Close"
            className="w-4 h-4 filter brightness-0 invert"
          />
        </button>
        <h3 className="mb-4 text-white font-light font-[Lexend] text-lg">
          {purpose === "request" ? "Share this request" : "Share this document"}
        </h3>
        <div className="flex justify-center items-center w-full my-6 p-4 bg-white rounded-xl">
          <QRCodeSVG
            value={
              purpose === "request"
                ? `${clientUrl}/request-share/${token}`
                : `${clientUrl}/shares/${token}`
            }
            size={180}
          />
        </div>
        <a
          href={
            purpose === "request"
              ? `${clientUrl}/request-share/${token}`
              : `${clientUrl}/shares/${token}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-green-300 break-all underline hover:text-green-200 transition text-sm font-light font-[Lexend]"
        >
          Open link
        </a>
        <span className="mt-3 text-sm text-white/80 font-light font-[Lexend] block">
          QR expires in: {seconds}s
        </span>
        <p className="text-xs text-white/60 mt-2 font-[Lexend] font-light">
          QR expires in 1 minute, link expires in 7 days after first scan.
        </p>
        {error && (
          <span className="text-red-300 text-xs mt-2 p-2 bg-red-500/20 rounded-lg font-[Lexend] font-light">
            {error}
          </span>
        )}
        {shareData && shareData.expired && (
          <span className="text-red-300 text-xs mt-2 p-2 bg-red-500/20 rounded-lg font-[Lexend] font-light">
            Share expired
          </span>
        )}
      </div>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>
    </div>
  );
}
