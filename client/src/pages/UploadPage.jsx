import { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../contexts/UseAuth";
import FeedbackModal from "../components/FeedbackModal";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { uploadDocument } from "../components/utils";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("KTP");
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const { user, loading } = useAuth();
  const fileInputRef = useRef();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setErrorMessage("");
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleTypeChange = (e) => {
    setFileType(e.target.value);
  };
  const handleUpload = async () => {
    setUploading(true);
    setErrorMessage("");

    try {
      await uploadDocument(file, fileType);

      setFeedback({
        show: true,
        message: "File uploaded successfully!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        setTimeout(() => window.location.reload(), 800);
      }, 1500);
    } catch (error) {
      setFeedback({
        show: true,
        message: error.message,
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1500
      );
      setUploading(false);
    }
  };
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen font-[Lexend] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
        <h1 className="font-[Lexend] text-2xl text-white font-light mb-4">
          Upload Document
        </h1>
        <form className="flex flex-col items-center w-full max-w-4xl">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl w-60 h-60 md:w-80 md:h-80 lg:w-[28rem] lg:h-[28rem] mx-auto cursor-pointer hover:border-green-400 transition-all duration-300 relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm mb-4 hover:scale-105">
            {file ? (
              file.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-cover w-full h-full rounded-xl"
                />
              ) : (
                <span className="text-white text-center px-2 font-light">
                  {file.name}
                </span>
              )
            ) : (
              <span className="text-white/60 text-center font-light">
                Click to select file
              </span>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*,application/pdf"
            />
          </label>
          <label
            className="block mb-2 text-sm font-medium text-white"
            htmlFor="type"
          >
            Choose file type:
          </label>{" "}
          <select
            id="type"
            name="type"
            className="w-60 md:w-80 lg:w-[28rem] p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            onChange={handleTypeChange}
            value={fileType}
          >
            <option value="KTP">KTP</option>
            <option value="KK">KK</option>
            <option value="SIMA">SIM A</option>
            <option value="SIMB">SIM B</option>
            <option value="SIMB1">SIM B1</option>
            <option value="SIMB2">SIM B2</option>
            <option value="SIMC">SIM C</option>
            <option value="SIMC1">SIM C1</option>
            <option value="SIMC2">SIM C2</option>
            <option value="SIMC3">SIM C3</option>
            <option value="SIMD">SIM D</option>
            <option value="SKCK">SKCK</option>
            <option value="Ijazah">Ijazah</option>
            <option value="AktaKelahiran">Akta Kelahiran</option>
            <option value="Paspor">Paspor</option>
            <option value="SuratNikah">Surat Nikah</option>
            <option value="SuratCerai">Surat Cerai</option>
            <option value="PasFoto">Pas Foto</option>
            <option value="CV">CV</option>
            <option value="NPWP">NPWP</option>
            <option value="SuratKematian">Surat Kematian</option>
            <option value="SuratPindah">Surat Pindah</option>
          </select>{" "}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`px-6 py-3 font-semibold text-white transition bg-green-700 rounded-md hover:bg-green-600 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            } w-60 md:w-80 lg:w-[28rem]`}
          >
            {uploading ? (
              <div className="flex items-center gap-2 justify-center">
                <span>Uploading...</span>
                <div className="w-5 h-5 border-2 border-t-2 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
              </div>
            ) : (
              "Upload"
            )}
          </button>
          {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}
