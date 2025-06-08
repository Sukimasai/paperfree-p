import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AdminDocumentNode from "../components/AdminDocumentNode";
import ConfirmationModal from "../components/ConfirmationModal";
import FeedbackModal from "../components/FeedbackModal";
import useAuth from "../contexts/UseAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  fetchPendingDocuments,
  verifyDocument,
  rejectDocument,
} from "../components/utils";

export default function PendingPage() {
  const { user, loading } = useAuth();
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const documents = await fetchPendingDocuments();
        setPendingDocuments(documents);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleVerify = (documentId) => {
    setPendingDocuments((prevDocs) =>
      prevDocs.filter((doc) => doc._id !== documentId)
    );
  };

  const handleReject = (documentId) => {
    setPendingDocuments((prevDocs) =>
      prevDocs.filter((doc) => doc._id !== documentId)
    );
  };

  const handleConfirm = async () => {
    if (!selectedDocument) return;
    try {
      if (confirmType === "verify") {
        await verifyDocument(selectedDocument.id);
        handleVerify(selectedDocument.id);
        setFeedback({
          show: true,
          message: "Document verified successfully!",
          isSuccess: true,
        });
      } else if (confirmType === "reject") {
        await rejectDocument(selectedDocument.id);
        handleReject(selectedDocument.id);
        setFeedback({
          show: true,
          message: "Document rejected successfully!",
          isSuccess: true,
        });
      }
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        window.location.reload();
      }, 1200);
    } catch (err) {
      setFeedback({
        show: true,
        message: err.message || "Action failed.",
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1200
      );
    }
    setShowConfirmModal(false);
    setSelectedDocument(null);
    setConfirmType("");
  };

  const openConfirmModal = (type, document) => {
    setConfirmType(type);
    setSelectedDocument(document);
    setShowConfirmModal(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <p className="text-white font-[Lexend] font-light">Loading...</p>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 min-h-screen">
      <Header />
      <div className="flex flex-col items-center px-4 py-8 mx-auto text-white font-[Lexend] pt-[10vh] min-h-screen w-full max-w-7xl">
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
        <h2 className="mb-4 text-3xl font-light text-white">
          Pending Documents
        </h2>
        <p className="text-white/80 text-sm mb-4 text-center max-w-lg font-light">
          Review and verify or reject documents submitted by users. Click on a
          document to see more details.
        </p>{" "}
        {pendingDocuments.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center w-full min-h-[40vh]">
            <img
              src="/empty-white.png"
              alt="No pending"
              className="w-16 h-16 mb-2 opacity-60"
            />
            <p className="text-white/60 text-base font-[Lexend] font-light">
              There are no pending documents.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-7xl columns-1 md:columns-2 gap-6 rounded-lg p-4">
            {pendingDocuments.map((document) => (
              <div
                className="mb-4 break-inside-avoid transition hover:scale-[1.02] hover:shadow-xl rounded-lg"
                key={document.id}
              >
                <AdminDocumentNode
                  document={document}
                  onVerify={() => openConfirmModal("verify", document)}
                  onReject={() => openConfirmModal("reject", document)}
                />
              </div>
            ))}
          </div>
        )}
        <ConfirmationModal
          show={showConfirmModal}
          message={
            confirmType === "verify"
              ? `Verify ${selectedDocument?.filename || "this document"}?`
              : confirmType === "reject"
              ? `Reject ${selectedDocument?.filename || "this document"}?`
              : ""
          }
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmModal(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </div>
      <Footer />
    </div>
  );
}
