import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import useAuth from "../contexts/UseAuth";
import { Navigate } from "react-router-dom";

export default function AdminDocumentNode({ document, onVerify, onReject }) {
  const { user, loading } = useAuth();
  const [documentImage, setDocumentImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(true);
  useEffect(() => {
    if (document.storage_path) {
      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(document.storage_path);
      if (data && data.publicUrl) {
        setDocumentImage(data.publicUrl);
      }
    }
  }, [document.storage_path]);
  const handleContainerClick = async () => {
    const isPdf = document.filename.toLowerCase().endsWith(".pdf");
    let fileUrl = null;

    if (isPdf) {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(document.storage_path, 3600);
      if (!error && data) {
        fileUrl = data.signedUrl;
      }
    } else {
      fileUrl = documentImage;
      if (!fileUrl) {
        const { data, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(document.storage_path, 3600);
        if (!error && data) {
          fileUrl = data.signedUrl;
        }
      }
    }

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div
      className="bg-slate-800/40 backdrop-blur-lg border border-white/10 rounded-xl p-6 flex flex-row gap-4 cursor-pointer hover:scale-105 transition-all duration-300 ease-out hover:shadow-2xl hover:bg-slate-800/60 shadow-xl"
      onClick={handleContainerClick}
    >
      <div className="flex-1 flex flex-col justify-between gap-4">
        <h3 className="text-lg text-white font-lexend font-light leading-relaxed">
          {document.filename}
        </h3>
        <div className="flex flex-row gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerify();
            }}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-lexend font-light shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Verify
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-lexend font-light shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Reject
          </button>
        </div>
      </div>
      {documentImage &&
        imageLoaded &&
        !document.filename.toLowerCase().endsWith(".pdf") && (
          <div className="flex-shrink-0">
            <img
              src={documentImage}
              alt={document.filename}
              className="max-h-[100px] w-auto rounded-lg border border-white/10 shadow-lg"
              onError={() => setImageLoaded(false)}
            />
          </div>
        )}
    </div>
  );
}
