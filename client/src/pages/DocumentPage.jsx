import { useState, useEffect } from "react";
import DocumentNode from "../components/DocumentNode";
import QRCodeWithTimer from "../components/QRCodeWithTimer";
import useAuth from "../contexts/UseAuth";
import { Navigate } from "react-router-dom";
import FeedbackModal from "../components/FeedbackModal";
import ConfirmationModal from "../components/ConfirmationModal";
import EditUploadModal from "../components/EditUploadModal";
import PasswordConfirmModal from "../components/PasswordConfirmModal";
import {
  fetchDocumentsByStatus,
  deleteDocument,
  updateDocument,
} from "../components/utils";
import Header from "../components/Header";
import Footer from "../components/Footer";

function InfoTooltip({ text }) {
  return (
    <span className="ml-1 text-xs text-green-300 cursor-pointer" title={text}>
      <svg width="14" height="14" fill="currentColor" className="inline">
        <circle cx="7" cy="7" r="7" fill="rgba(34, 197, 94, 0.2)" />
        <text x="7" y="11" textAnchor="middle" fontSize="10" fill="#86efac">
          i
        </text>
      </svg>
    </span>
  );
}

export default function DocumentPage() {
  const { user, loading: authLoading } = useAuth();
  const [approvedDocuments, setApprovedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [shareToken, setShareToken] = useState(null);
  const [forceSelectionMode, setForceSelectionMode] = useState(false);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [showSharePasswordModal, setShowSharePasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await fetchDocumentsByStatus("verified");
        setApprovedDocuments(data);
        setLoading(false);
      } catch {
        setError("Failed to fetch documents");
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    window.__setForceSelectionMode = setForceSelectionMode;
    return () => {
      delete window.__setForceSelectionMode;
    };
  }, []);

  const handleSelect = (id) => {
    setSelectedIds((prevSelected) => {
      let newSelected;
      if (prevSelected.includes(id)) {
        newSelected = prevSelected.filter((item) => item !== id);
      } else {
        newSelected = [...prevSelected, id];
      }
      if (forceSelectionMode && newSelected.length === 0) {
        setForceSelectionMode(false);
      }
      return newSelected;
    });
  };

  const handleDelete = (doc) => {
    setDeleteTarget(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setShowDeleteModal(false);
    try {
      const res = await deleteDocument(deleteTarget.id);
      if (res.ok) {
        setFeedback({
          show: true,
          message: "Document deleted successfully.",
          isSuccess: true,
        });
        setApprovedDocuments((docs) =>
          docs.filter((d) => d.id !== deleteTarget.id)
        );
        setSelectedIds((ids) => ids.filter((id) => id !== deleteTarget.id));
        window.location.reload();
      } else {
        setFeedback({
          show: true,
          message: res.message || "Failed to delete document.",
          isSuccess: false,
        });
      }
    } catch (err) {
      setFeedback({
        show: true,
        message: err.message || "Failed to delete document.",
        isSuccess: false,
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = (doc) => {
    setEditTarget(doc);
    setShowEditModal(true);
    setEditUploading(false);
  };

  const handleEditUploadSubmit = async (file) => {
    setEditUploading(true);
    try {
      const response = await updateDocument(
        editTarget.id,
        file,
        editTarget.file_type
      );
      if (response.ok) {
        setShowEditModal(false);
        setApprovedDocuments((docs) =>
          docs.map((d) =>
            d.id === editTarget.id
              ? { ...d, updated_at: new Date().toISOString() }
              : d
          )
        );
        setFeedback({
          show: true,
          message: "Document updated successfully.",
          isSuccess: true,
        });
        window.location.reload();
      } else {
        setShowEditModal(false);
        const errorData = await response.json();
        setFeedback({
          show: true,
          message: errorData.message || "Failed to update document.",
          isSuccess: false,
        });
      }
    } catch (error) {
      setFeedback({
        show: true,
        message: error.message || "Failed to update document.",
        isSuccess: false,
      });
    } finally {
      setEditUploading(false);
    }
  };
  const handleShareClick = () => {
    setShowSharePasswordModal(true);
    setPasswordError(null);
  };

  const handleSharePasswordConfirm = (pw) => {
    handleShareWithPassword(pw);
  };
  const handleShareWithPassword = async (pw) => {
    if (selectedIds.length === 0) {
      setPasswordError("Please select at least one document to share.");
      return;
    }

    try {
      const { shareDocuments } = await import("../components/utils");
      const token = await shareDocuments(selectedIds, pw);
      setShowSharePasswordModal(false);
      setShareToken(token);
      setSelectedIds([]);
      setForceSelectionMode(false);
    } catch (err) {
      setPasswordError(err.message || "Error sharing documents.");
    }
  };

  if (authLoading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "user") return <Navigate to="/" replace />;
  if (loading) return <p>Loading documents...</p>;
  if (error) return <p>{error}</p>;
  const selectionMode = forceSelectionMode || selectedIds.length > 0;
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Header />
      <div className="flex flex-col items-center px-4 py-8 mx-auto text-white font-[Lexend] pt-[10vh] min-h-screen w-full max-w-7xl">
        <h1 className="mb-4 text-3xl font-light text-white">Documents</h1>
        <p className="text-white/80 text-sm mb-4 text-center max-w-lg font-light">
          View, share, and manage your verified documents. Select multiple
          documents to share them securely with others.
        </p>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="selectionMode"
            checked={forceSelectionMode}
            onChange={(e) => setForceSelectionMode(e.target.checked)}
            className="mr-2 accent-green-300"
          />
          <label
            htmlFor="selectionMode"
            className="text-white font-light flex items-center"
          >
            Selection Mode
            <InfoTooltip text="Enable to select multiple documents for sharing." />
          </label>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 font-light text-white transition bg-gradient-to-r from-green-600 to-green-500 rounded-xl hover:from-green-500 hover:to-green-400 hover:scale-105 mb-4 shadow-xl"
          onClick={() => (window.location.href = "/document/upload")}
        >
          <img src="/upload-white.png" alt="Upload" className="w-5 h-5" />{" "}
          Upload Document
        </button>
        <div className="w-full max-w-6xl flex flex-row justify-between items-center mb-2">
          <span className="text-white/80 text-sm font-light">
            {approvedDocuments.length} Document
            {approvedDocuments.length !== 1 ? "s" : ""} found
          </span>
          {selectionMode && (
            <button
              className="flex items-center gap-2 px-6 py-3 font-light text-white transition bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-400 hover:scale-105 mb-2 shadow-xl"
              onClick={handleShareClick}
            >
              <img src="/qr-white.png" alt="Share" className="w-5 h-5" /> Share
              Selected ({selectedIds.length})
            </button>
          )}
        </div>
        {approvedDocuments.length > 0 ? (
          <div className="w-full columns-1 sm:columns-2 lg:columns-4 [perspective:10000px]">
            {approvedDocuments.map((doc) => (
              <div key={doc.id} className="break-inside-avoid mb-4">
                <DocumentNode
                  document={doc}
                  isSelected={selectedIds.includes(doc.id)}
                  selectionMode={selectionMode}
                  onSelect={handleSelect}
                  onDelete={() => handleDelete(doc)}
                  onEdit={() => handleEdit(doc)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-8">
            <img
              src="/empty-white.png"
              alt="No documents"
              className="w-20 h-20 mb-2 opacity-60"
            />
            <p className="text-white text-lg mb-2 font-light">
              No documents found.
            </p>
            <button
              className="flex items-center gap-2 px-6 py-3 font-light text-white transition bg-gradient-to-r from-green-600 to-green-500 rounded-xl hover:from-green-500 hover:to-green-400 hover:scale-105 shadow-xl"
              onClick={() => (window.location.href = "/document/upload")}
            >
              <img src="/upload-white.png" alt="Upload" className="w-5 h-5" />{" "}
              Upload your first document
            </button>
          </div>
        )}
        <QRCodeWithTimer
          show={!!shareToken}
          onClose={() => setShareToken(null)}
          token={shareToken}
          purpose="documents"
        />
        <ConfirmationModal
          show={showDeleteModal}
          title="Delete Document"
          message={`Are you sure you want to delete '${deleteTarget?.filename}'? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
        <EditUploadModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditTarget(null);
          }}
          onSubmit={handleEditUploadSubmit}
          loading={editUploading}
        />
        <FeedbackModal
          show={feedback.show}
          title={feedback.isSuccess ? "Success" : "Error"}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />{" "}
        <PasswordConfirmModal
          show={showSharePasswordModal}
          loading={false}
          error={passwordError}
          onConfirm={handleSharePasswordConfirm}
          onCancel={() => setShowSharePasswordModal(false)}
        />{" "}
      </div>
      <Footer />
    </div>
  );
}
