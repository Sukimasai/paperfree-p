import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function EditUploadModal({ show, onClose, onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
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

  const handleFileChange = async (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    await onSubmit(file);
  };

  if (!show) return null;

  return (
    <>
      {" "}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            onClose();
          }
        }}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          ref={modalRef}
          className="bg-slate-800/90 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-sm md:max-w-md relative z-50 pointer-events-auto"
        >
          <button
            className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all duration-200"
            onClick={onClose}
            disabled={loading}
          >
            <img
              src="/close.png"
              alt="Close"
              className="w-4 h-4 filter brightness-0 invert"
            />
          </button>
          <h2 className="text-xl font-light mb-6 text-white font-[Lexend]">
            Change Document File
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600/50 rounded-xl w-48 h-48 mx-auto cursor-pointer hover:border-green-300/50 transition-all duration-300 relative bg-slate-700/30 backdrop-blur-sm">
              {file ? (
                file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="object-cover w-full h-full rounded-xl"
                  />
                ) : (
                  <span className="text-white/80 text-center px-4 font-[Lexend] font-light">
                    {file.name}
                  </span>
                )
              ) : (
                <span className="text-white/60 text-center font-[Lexend] font-light">
                  Click to select file
                </span>
              )}
              <input
                type="file"
                accept="*"
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            {error && (
              <div className="text-red-300 text-sm p-3 bg-red-500/20 rounded-lg border border-red-300/20 font-[Lexend] font-light">
                {error}
              </div>
            )}
          </form>
          <button
            className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-500 hover:to-green-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-xl font-[Lexend] font-light"
            onClick={handleSubmit}
            disabled={loading || !file}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
}
