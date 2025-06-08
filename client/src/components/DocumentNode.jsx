import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";
import gsap from "gsap";
import useAuth from "../contexts/UseAuth";

export default function DocumentNode({
  document,
  onSelect,
  selectionMode,
  documentMIME,
  isSelected = false,
  downloadUrl = null,
  isShare = false,
  onDelete,
  onEdit,
}) {
  const documentId = document?.id;
  const documentTitle = document?.filename;
  const documentType = document?.file_type;
  const documentDate = document?.created_at;
  const documentStatus = document?.verification_status;
  const storagePath = document?.storage_path;

  const { loading } = useAuth();
  const [documentImage, setDocumentImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("2 / 1");
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const boundingRef = useRef(null);
  const nodeRef = useRef(null);
  const longPressTimer = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (storagePath) {
      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(storagePath);
      if (data && data.publicUrl) {
        setDocumentImage(data.publicUrl);
      }
    }
  }, [storagePath]);

  useEffect(() => {
    if (documentImage) {
      const img = new Image();
      img.src = documentImage;
      img.onload = () => {
        const ratio = `${img.width} / ${img.height}`;
        setAspectRatio(ratio);
      };
    }
  }, [documentImage]);

  const handleMouseDown = () => {
    if (!selectionMode && window && window.__setForceSelectionMode) {
      setLongPressTriggered(false);
      longPressTimer.current = setTimeout(() => {
        if (window.__setForceSelectionMode) {
          window.__setForceSelectionMode(true);
        }
        setLongPressTriggered(true);
        if (onSelect) {
          onSelect(documentId);
        }
      }, 500);
    }
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (selectionMode && onSelect && !longPressTriggered) {
      onSelect(documentId);
    }
    setLongPressTriggered(false);
  };

  const fileNameWithExt = (() => {
    let name = documentTitle || "downloaded_file";

    const mimeMapping = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "application/pdf": ".pdf",
    };

    let ext = "";
    if (documentMIME) {
      ext = mimeMapping[documentMIME];
      if (!ext) {
        ext = documentMIME.startsWith(".") ? documentMIME : "." + documentMIME;
      }
    }

    if (!name.includes(".")) {
      name += ext;
    }
    return name;
  })();

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      if (!downloadUrl || typeof downloadUrl !== "string") {
        throw new Error("No valid download URL");
      }
      const url =
        downloadUrl + (downloadUrl.includes("?") ? "&" : "?") + "download=1";
      if (
        typeof window !== "undefined" &&
        typeof window.document !== "undefined"
      ) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Download failed");
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = blobUrl;
        a.download = fileNameWithExt;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        alert("Download is only supported in a web browser environment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  let typePrint = documentType;
  switch (documentType) {
    case "SIMA":
      typePrint = "SIM A";
      break;
    case "SIMB":
      typePrint = "SIM B";
      break;
    case "SIMB1":
      typePrint = "SIM B1";
      break;
    case "SIMB2":
      typePrint = "SIM B2";
      break;
    case "SIMC":
      typePrint = "SIM C";
      break;
    case "SIMC1":
      typePrint = "SIM C1";
      break;
    case "SIMC2":
      typePrint = "SIM C2";
      break;
    case "SIMC3":
      typePrint = "SIM C3";
      break;
    case "SIMD":
      typePrint = "SIM D";
      break;
    case "AktaKelahiran":
      typePrint = "Akta Kelahiran";
      break;
    case "SuratNikah":
      typePrint = "Surat Nikah";
      break;
    case "SuratCerai":
      typePrint = "Surat Cerai";
      break;
    case "PasFoto":
      typePrint = "Pas Foto";
      break;
  }

  useEffect(() => {
    if (!nodeRef.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && nodeRef.current) {
      gsap.fromTo(
        nodeRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isVisible]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {" "}
      <div
        ref={nodeRef}
        className={`relative bg-slate-800/40 rounded-xl shadow-xl border border-white/10 flex flex-col mb-4 w-full max-w-xs mx-auto transition-all duration-300 hover:shadow-2xl hover:border-green-300/30 min-h-[220px] bg-cover bg-center transform-gpu${
          isSelected ? " ring-2 ring-green-300 ring-opacity-50" : ""
        }`}
        style={{
          visibility: isVisible ? "visible" : "hidden",
          backgroundImage: documentImage
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${documentImage})`
            : "none",
          aspectRatio: aspectRatio,
          willChange: "transform",
          transformStyle: "preserve-3d",
          transition:
            "transform 0.3s cubic-bezier(0.4,0,0.2,1), scale 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
        onClick={handleClick}
        onMouseLeave={(e) => {
          if (!boundingRef.current) return;
          e.currentTarget.style.setProperty(
            "transform",
            `rotateY(0deg) rotateX(0deg)`
          );
          e.currentTarget.style.setProperty("scale", "1");
          e.currentTarget.style.setProperty(
            "transition",
            "scale 0.18s cubic-bezier(0.4,0,0.2,1)"
          );
          boundingRef.current = null;
          clearLongPress();
        }}
        onMouseEnter={(e) => {
          boundingRef.current = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("scale", "1.05");
          e.currentTarget.style.setProperty(
            "transition",
            "scale 0.18s cubic-bezier(0.4,0,0.2,1)"
          );
        }}
        onMouseMove={(e) => {
          if (!boundingRef.current) return;
          const x = e.clientX - boundingRef.current.left;
          const y = e.clientY - boundingRef.current.top;
          const xPercent = x / boundingRef.current.width;
          const yPercent = y / boundingRef.current.height;
          const xRotation = (xPercent - 0.5) * 20;
          const yRotation = (0.5 - yPercent) * 20;
          e.currentTarget.style.setProperty(
            "transform",
            `rotateY(${xRotation}deg) rotateX(${yRotation}deg)`
          );
          clearLongPress();
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={clearLongPress}
        onTouchStart={handleMouseDown}
        onTouchEnd={clearLongPress}
      >
        {!isShare && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(document);
              }}
              className="absolute top-3 right-3 p-2 hover:opacity-75 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-300/20 transition-all duration-200 hover:bg-red-500/30 hover:scale-105"
            >
              <img src="/trash-white.png" alt="Delete" className="w-5 h-5" />
            </button>
            {documentStatus === "verified" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(document);
                }}
                className="absolute top-16 right-3 p-2 hover:opacity-75 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-300/20 transition-all duration-200 hover:bg-blue-500/30 hover:scale-105"
              >
                <img src="/edit-white.png" alt="Edit" className="w-5 h-5" />
              </button>
            )}
          </>
        )}
        {isShare && (
          <button
            onClick={handleDownload}
            className="absolute top-3 right-3 p-2 hover:opacity-75 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-300/20 transition-all duration-200 hover:bg-green-500/30 hover:scale-105"
          >
            <img src="/download-white.png" alt="Download" className="w-5 h-5" />
          </button>
        )}
        <div className="p-4 mt-auto bg-gradient-to-t from-slate-900/90 via-slate-800/70 to-transparent rounded-b-xl">
          <h1 className="mb-2 text-lg font-light text-white text-nowrap overflow-hidden text-ellipsis font-[Lexend]">
            {documentTitle}
          </h1>
          <p className="text-sm text-white/80 font-[Lexend] font-light">
            Type: {typePrint}
          </p>
          {!isShare && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-white/70 font-[Lexend] font-light">
                Uploaded: {new Date(documentDate).toLocaleDateString()}
              </p>
              <p
                className={`text-xs font-[Lexend] font-light ${
                  documentStatus === "verified"
                    ? "text-green-300"
                    : documentStatus === "pending"
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}
              >
                Status: {documentStatus}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
