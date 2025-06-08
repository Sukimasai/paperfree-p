import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import RequestNode from "../components/RequestNode";
import DocumentNode from "../components/DocumentNode";
import useAuth from "../contexts/UseAuth";
import FeedbackModal from "../components/FeedbackModal";
import ConfirmationModal from "../components/ConfirmationModal";
import RequestDetail from "../components/RequestDetail";
import {
  fetchDocumentsByStatus,
  fetchRequestsByStatus,
  deleteDocument,
  deleteMultipleDocuments,
  deleteMultipleRequests,
} from "../components/utils";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [rejectedDocuments, setRejectedDocuments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteRequestsConfirmation, setDeleteRequestsConfirmation] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRT, setSelectedRT] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await fetchDocumentsByStatus("pending");
        setPendingDocuments(data);
        setLoading(false);
      } catch {
        setError("Failed to fetch pending documents");
        setLoading(false);
      }
    }
    async function fetchRejectedDocuments() {
      try {
        const data = await fetchDocumentsByStatus("rejected");
        setRejectedDocuments(data);
        setLoading(false);
      } catch {
        setError("Failed to fetch rejected documents");
        setLoading(false);
      }
    }
    fetchDocuments();
    fetchRejectedDocuments();
  }, []);

  useEffect(() => {
    async function fetchPendingRequests() {
      try {
        const data = await fetchRequestsByStatus("pending", user);
        setPendingRequests(data);
      } catch {
        setError("Failed to fetch pending requests");
      }
    }
    async function fetchRejectedRequests() {
      try {
        const data = await fetchRequestsByStatus("rejected", user);
        setRejectedRequests(data);
      } catch {
        setError("Failed to fetch rejected requests");
      }
    }
    fetchPendingRequests();
    fetchRejectedRequests();
  }, [user]);

  const handleDeleteClick = () => {
    setDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(false);
  };

  const handleDeleteAll = async () => {
    const allDocs = [...pendingDocuments, ...rejectedDocuments];
    if (allDocs.length === 0) return;
    try {
      await deleteMultipleDocuments(allDocs.map((doc) => doc.id));
      setPendingDocuments([]);
      setRejectedDocuments([]);
      setFeedback({
        show: true,
        message: "All documents deleted successfully!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        setTimeout(() => window.location.reload(), 800);
      }, 1500);
    } catch (error) {
      setFeedback({
        show: true,
        message: `Delete all failed: ${error.message}`,
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1500
      );
    }
    setDeleteConfirmation(false);
  };
  const handleDeleteAllRequests = async () => {
    const allRequests = [...pendingRequests, ...rejectedRequests];
    if (allRequests.length === 0) return;
    try {
      await deleteMultipleRequests(allRequests.map((req) => req.id));
      setPendingRequests([]);
      setRejectedRequests([]);
      setFeedback({
        show: true,
        message: "All requests deleted successfully!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
      }, 1500);
    } catch (error) {
      setFeedback({
        show: true,
        message: `Delete all failed: ${error.message || "Unknown error"}`,
        isSuccess: false,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: false });
      }, 1500);
    }
    setDeleteRequestsConfirmation(false);
  };

  const handleShowDetail = (request, rtName, kelurahanName) => {
    setSelectedRequest(request);
    setSelectedRT(rtName);
    setSelectedKelurahan(kelurahanName);
    setShowDetail(true);
  };

  const handleShowConfirm = (type, handler) => {
    setShowConfirmModal(true);
    setConfirmModalProps({
      message:
        type === "delete"
          ? "Delete this request?"
          : `Are you sure you want to ${type} this request?`,
      onConfirm: async () => {
        setShowConfirmModal(false);
        await handler();
      },
      onCancel: () => setShowConfirmModal(false),
      confirmText: type === "delete" ? "Confirm" : "Yes",
      cancelText: type === "delete" ? "Cancel" : "No",
    });
  };

  const handleDeleteDocument = (doc) => {
    setDeleteTarget(doc);
    setShowDeleteModal(true);
  };

  const confirmDeleteDocument = async () => {
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
        setPendingDocuments((docs) =>
          docs.filter((d) => d.id !== deleteTarget.id)
        );
        setRejectedDocuments((docs) =>
          docs.filter((d) => d.id !== deleteTarget.id)
        );
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

  const handleShareRequest = () => {};
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <p className="text-white font-[Lexend] font-light">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "user") return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <p className="text-white font-[Lexend] font-light">
          Loading documents...
        </p>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="flex flex-col items-center px-4 py-8 mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-[Lexend] pt-[10vh] min-h-screen w-full">
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
        <h1 className="mb-4 text-3xl font-light text-white">History</h1>
        <p className="text-white/80 text-sm mb-4 text-center max-w-lg font-light">
          View your document and request history. You can delete all pending or
          rejected items if you wish.
        </p>
        {error && <p className="text-red-300 mb-2 font-light">{error}</p>}{" "}
        {(pendingDocuments.length > 0 || rejectedDocuments.length > 0) && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={handleDeleteClick}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105 w-60"
            >
              Delete All Documents
            </button>
          </div>
        )}
        {(pendingRequests.length > 0 || rejectedRequests.length > 0) && (
          <button
            onClick={() => setDeleteRequestsConfirmation(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105 mb-6 w-60"
          >
            Delete All Requests
          </button>
        )}
        {pendingDocuments.length > 0 || rejectedDocuments.length > 0 ? (
          <div className="px-2 flex flex-col items-center justify-center w-full">
            <h2 className="text-xl font-light mb-2 text-white">
              Pending Documents
            </h2>
            {pendingDocuments.length > 0 ? (
              <div className="w-full max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 mb-8 rounded-lg p-4">
                {pendingDocuments.map((doc) => (
                  <div key={doc.id} className="mb-4 break-inside-avoid">
                    <DocumentNode
                      document={doc}
                      onDelete={() => handleDeleteDocument(doc)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 mb-4 font-light">
                No pending documents.
              </p>
            )}
            <h2 className="text-xl text-white font-light mb-2">
              Rejected Documents
            </h2>
            {rejectedDocuments.length > 0 ? (
              <div className="w-full max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 rounded-lg p-4">
                {rejectedDocuments.map((doc) => (
                  <div key={doc.id} className="mb-4 break-inside-avoid">
                    <DocumentNode
                      document={doc}
                      onDelete={() => handleDeleteDocument(doc)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 mb-4 font-light">
                No rejected documents.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-8">
            <img
              src="/history-white.png"
              alt="No documents"
              className="w-16 h-16 mb-2 opacity-60"
            />
            <h2 className="text-xl text-white font-light mb-2">Documents</h2>
            <p className="text-white/60 font-light">No documents found.</p>
          </div>
        )}{" "}
        {pendingRequests.length > 0 || rejectedRequests.length > 0 ? (
          <div className="px-2 flex flex-col items-center justify-center mt-8 w-full">
            <h2 className="text-xl text-white font-light mb-2">
              Pending Requests
            </h2>{" "}
            {pendingRequests.length > 0 ? (
              <div className="w-full max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 mb-8 rounded-lg p-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="mb-4 break-inside-avoid">
                    <RequestNode
                      request={request}
                      isAdmin={false}
                      onShowDetail={handleShowDetail}
                      onShowConfirm={handleShowConfirm}
                      onShareRequest={handleShareRequest}
                      onDeleteSuccess={(message) => {
                        setFeedback({
                          show: true,
                          message: message || "Request deleted successfully.",
                          isSuccess: true,
                        });
                        setPendingRequests((reqs) =>
                          reqs.filter((r) => r.id !== request.id)
                        );
                      }}
                      onDeleteError={(message) =>
                        setFeedback({
                          show: true,
                          message: message || "Failed to delete request.",
                          isSuccess: false,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 mb-4 font-light">
                No pending requests.
              </p>
            )}
            <h2 className="text-xl text-white font-light mb-2">
              Rejected Requests
            </h2>{" "}
            {rejectedRequests.length > 0 ? (
              <div className="w-full max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 rounded-lg p-4">
                {rejectedRequests.map((request) => (
                  <div key={request.id} className="mb-4 break-inside-avoid">
                    <RequestNode
                      request={request}
                      isAdmin={false}
                      onShowDetail={handleShowDetail}
                      onShowConfirm={handleShowConfirm}
                      onShareRequest={handleShareRequest}
                      onDeleteSuccess={(message) => {
                        setFeedback({
                          show: true,
                          message: message || "Request deleted successfully.",
                          isSuccess: true,
                        });
                        setRejectedRequests((reqs) =>
                          reqs.filter((r) => r.id !== request.id)
                        );
                      }}
                      onDeleteError={(message) =>
                        setFeedback({
                          show: true,
                          message: message || "Failed to delete request.",
                          isSuccess: false,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 mb-4 font-light">
                No rejected requests.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-8">
            <img
              src="/request-white.png"
              alt="No requests"
              className="w-16 h-16 mb-2 opacity-60"
            />
            <h2 className="text-xl text-white font-light mb-2">Requests</h2>
            <p className="text-white/60 font-light">No requests found.</p>
          </div>
        )}
        <ConfirmationModal
          show={deleteConfirmation}
          message="Are you sure you want to delete all files?"
          onConfirm={handleDeleteAll}
          onCancel={handleCancelDelete}
          confirmText="Confirm"
          cancelText="Cancel"
        />
        <ConfirmationModal
          show={deleteRequestsConfirmation}
          message="Are you sure you want to delete all requests?"
          onConfirm={handleDeleteAllRequests}
          onCancel={() => setDeleteRequestsConfirmation(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
        {showDetail && selectedRequest && (
          <RequestDetail
            request={selectedRequest}
            onClose={() => setShowDetail(false)}
            rtName={selectedRT}
            kelurahanName={selectedKelurahan}
          />
        )}
        {showConfirmModal && (
          <ConfirmationModal
            show={showConfirmModal}
            message={confirmModalProps.message}
            onConfirm={confirmModalProps.onConfirm}
            onCancel={confirmModalProps.onCancel}
            confirmText={confirmModalProps.confirmText}
            cancelText={confirmModalProps.cancelText}
          />
        )}
        <ConfirmationModal
          show={showDeleteModal}
          message={`Are you sure you want to delete '${deleteTarget?.filename}'? This action cannot be undone.`}
          onConfirm={confirmDeleteDocument}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </div>
      <Footer />
    </>
  );
}
