import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useAuth from "../contexts/UseAuth";
import DocumentNode from "../components/DocumentNode";
import RequestNode from "../components/RequestNode";
import RequestDetail from "../components/RequestDetail";
import ConfirmationModal from "../components/ConfirmationModal";
import QRCodeWithTimer from "../components/QRCodeWithTimer";
import PasswordConfirmModal from "../components/PasswordConfirmModal";
import FeedbackModal from "../components/FeedbackModal";
import EditUploadModal from "../components/EditUploadModal";
import AdminRecentActivity from "../components/AdminRecentActivity";
import UnverifiedCard from "../components/UnverifiedDocumentCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  fetchStatsByRole,
  fetchRecentDocsAndReqs,
  fetchLocationName,
  shareRequest,
  deleteDocument,
  updateDocument,
  verifyPassword,
} from "../components/utils";

const statusDot = (color) => (
  <span
    style={{
      display: "inline-block",
      width: 12,
      height: 12,
      borderRadius: "50%",
      marginRight: 8,
      backgroundColor: color,
      verticalAlign: "middle",
    }}
  ></span>
);

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentReqs, setRecentReqs] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRT, setSelectedRT] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQRToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editUploading, setEditUploading] = useState(false);

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

  const handleShareRequest = (request, rtName, kelurahanName) => {
    setSelectedRequest(request);
    setSelectedRT(rtName);
    setSelectedKelurahan(kelurahanName);
    setShareError(null);
    setShowPasswordModal(true);
  };
  const handleDeleteDocument = (doc) => {
    setDeleteTarget(doc);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    if (!user || loading) return;
    fetchStatsByRole(user)
      .then(setStats)
      .catch(() => {
        setError("Failed to fetch statistics");
      });
  }, [user, loading]);

  useEffect(() => {
    if (!user || loading) return;
    fetchRecentDocsAndReqs(user).then(({ docs, reqs }) => {
      setRecentDocs(docs.slice(0, 3));
      setRecentReqs(reqs.slice(0, 3));
    });
  }, [user, loading]);

  useEffect(() => {
    if (!user || loading) return;
    fetchLocationName(user).then(setLocationName);
  }, [user, loading]);

  const confirmShareDirect = async (pw) => {
    setShareLoading(true);
    setShareError(null);
    try {
      await verifyPassword(pw);
      const token = await shareRequest(selectedRequest.id, pw);
      setShowPasswordModal(false);
      setQRToken(token);
      setShowQRModal(true);
    } catch (err) {
      setShareError(err.message);
    } finally {
      setShareLoading(false);
    }
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
        setRecentDocs((docs) => docs.filter((d) => d.id !== deleteTarget.id));
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

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Header />
      <div className="flex flex-col items-center px-4 py-8 mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-[Lexend] pt-[10vh] min-h-screen w-full">
        <h1 className="mb-4 text-3xl font-light text-white">
          Welcome{user.full_name ? `, ${user.full_name}` : ""}!
        </h1>
        {user &&
          (user.role === "rt_admin" || user.role === "kelurahan_admin") &&
          locationName && (
            <div className="text-lg text-green-300 font-light mb-2">
              {user.role === "rt_admin" ? "RT: " : "Kelurahan: "}
              {locationName}
            </div>
          )}
        {user && user.role === "user" && (
          <div className="w-full max-w-7xl mt-8 flex flex-col items-center">
            {" "}
            <div className="flex flex-row gap-2 my-4 w-full max-w-xs mx-auto justify-center md:max-w-2xl lg:max-w-3xl">
              <button
                onClick={() => navigate("/document/upload")}
                className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:from-slate-700/90 hover:to-slate-800/90 hover:border-green-400/30 text-white rounded-xl p-3 shadow-xl transition-all duration-300 hover:scale-105 min-w-[70px] min-h-[70px] max-w-[120px] max-h-[120px] md:min-w-[120px] md:min-h-[90px] md:max-w-[200px] md:max-h-[140px] lg:min-w-[160px] lg:min-h-[110px] lg:max-w-[260px] lg:max-h-[160px]"
                style={{ aspectRatio: "1.8/1" }}
              >
                <img
                  src="/upload-white.png"
                  alt="Upload"
                  className="w-7 h-7 mb-2 md:w-10 md:h-10 lg:w-12 lg:h-12"
                />
                <span className="text-xs md:text-base lg:text-lg font-light">
                  Upload
                </span>
              </button>
              <button
                onClick={() => navigate("/requests/upload")}
                className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:from-slate-700/90 hover:to-slate-800/90 hover:border-green-400/30 text-white rounded-xl p-3 shadow-xl transition-all duration-300 hover:scale-105 min-w-[70px] min-h-[70px] max-w-[120px] max-h-[120px] md:min-w-[120px] md:min-h-[90px] md:max-w-[200px] md:max-h-[140px] lg:min-w-[160px] lg:min-h-[110px] lg:max-w-[260px] lg:max-h-[160px]"
                style={{ aspectRatio: "1.8/1" }}
              >
                <img
                  src="/request-white.png"
                  alt="Request"
                  className="w-7 h-7 mb-2 md:w-10 md:h-10 lg:w-12 lg:h-12"
                />
                <span className="text-xs md:text-base lg:text-lg font-light">
                  Request
                </span>
              </button>
              <button
                onClick={() => navigate("/history")}
                className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 hover:from-slate-700/90 hover:to-slate-800/90 hover:border-green-400/30 text-white rounded-xl p-3 shadow-xl transition-all duration-300 hover:scale-105 min-w-[70px] min-h-[70px] max-w-[120px] max-h-[120px] md:min-w-[120px] md:min-h-[90px] md:max-w-[200px] md:max-h-[140px] lg:min-w-[160px] lg:min-h-[110px] lg:max-w-[260px] lg:max-h-[160px]"
                style={{ aspectRatio: "1.8/1" }}
              >
                <img
                  src="/history-white.png"
                  alt="History"
                  className="w-7 h-7 mb-2 md:w-10 md:h-10 lg:w-12 lg:h-12"
                />
                <span className="text-xs md:text-base lg:text-lg font-light">
                  History
                </span>
              </button>
            </div>{" "}
            <div className="w-full max-w-7xl flex flex-col gap-6">
              {error && <p className="text-red-300 font-light">{error}</p>}
              {!stats && !error && (
                <p className="text-white font-light">Loading...</p>
              )}
              {user && stats && (
                <div className="flex flex-col gap-4">
                  {user.role === "user" && (
                    <>
                      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center text-lg text-white font-light">
                          {statusDot("#FFD600")} Pending Documents:
                          <span className="ml-2 font-medium text-green-300">
                            {stats.pendingDocs}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-white font-light">
                          {statusDot("#FF5252")} Rejected Documents:
                          <span className="ml-2 font-medium text-green-300">
                            {stats.rejectedDocs}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-white font-light">
                          {statusDot("#00C853")} Verified Documents:
                          <span className="ml-2 font-medium text-green-300">
                            {stats.verifiedDocs}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center text-lg text-white font-light mt-2">
                          {statusDot("#FFD600")} Pending Requests:
                          <span className="ml-2 font-medium text-green-300">
                            {stats.pendingReqs}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-white font-light">
                          {statusDot("#FF5252")} Rejected Requests:
                          <span className="ml-2 font-medium text-green-300">
                            {stats.rejectedReqs}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-white font-light">
                          {statusDot("#00C853")} Approved Requests:
                          <span className="ml-2 font-medium text-green-300">
                            {stats.approvedReqs}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {user && user.role === "user" && (
              <div className="w-full max-w-7xl mt-8 flex flex-col items-center">
                <h2 className="text-xl font-light text-white mb-2 flex items-center gap-2">
                  <img
                    src="/history-white.png"
                    alt="Recent"
                    className="w-6 h-6"
                  />{" "}
                  Recent Documents
                </h2>
                {recentDocs.length > 0 ? (
                  <div className="w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                    {recentDocs.map((doc) => (
                      <div className="mb-4 break-inside-avoid" key={doc.id}>
                        <DocumentNode
                          document={doc}
                          onDelete={() => handleDeleteDocument(doc)}
                          onEdit={() => {
                            setEditTarget(doc);
                            setShowEditModal(true);
                            setEditUploading(false);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white font-light">No recent documents.</p>
                )}
                <h2 className="text-xl font-light text-white mt-6 mb-2 flex items-center gap-2">
                  <img
                    src="/request-white.png"
                    alt="Recent"
                    className="w-6 h-6"
                  />{" "}
                  Recent Requests
                </h2>
                {recentReqs.length > 0 ? (
                  <div className="w-full mx-auto columns-1 sm:columns-2 lg:columns-3 gap-4 justify-center">
                    {" "}
                    {recentReqs.map((req) => (
                      <div className="mb-4 break-inside-avoid" key={req.id}>
                        <RequestNode
                          request={req}
                          isAdmin={false}
                          isHome={true}
                          onShowDetail={handleShowDetail}
                          onShowConfirm={handleShowConfirm}
                          onShareRequest={handleShareRequest}
                          onDeleteSuccess={(message) => {
                            setFeedback({
                              show: true,
                              message:
                                message || "Request deleted successfully.",
                              isSuccess: true,
                            });
                            setRecentReqs((reqs) =>
                              reqs.filter((r) => r.id !== req.id)
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
                  <p className="text-white font-light">No recent requests.</p>
                )}
              </div>
            )}
          </div>
        )}
        {user &&
          (user.role === "admin" ||
            user.role === "rt_admin" ||
            user.role === "kelurahan_admin") && (
            <div className="w-full max-w-3xl mx-auto mb-8 mt-4 flex flex-col justify-center items-center">
              {user.role === "admin" && (
                <UnverifiedCard
                  count={stats?.unverified}
                  onClick={() => navigate("/admin/pending")}
                  type="document"
                  role="admin"
                />
              )}
              {user.role === "rt_admin" && (
                <UnverifiedCard
                  count={stats?.unapproved}
                  onClick={() => navigate("/rt-admin/pending")}
                  type="request"
                  role="rt_admin"
                />
              )}
              {user.role === "kelurahan_admin" && (
                <UnverifiedCard
                  count={stats?.unapproved}
                  onClick={() => navigate("/kelurahan-admin/pending")}
                  type="request"
                  role="kelurahan_admin"
                />
              )}
            </div>
          )}{" "}
        {user && !(user.role == "user") && (
          <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-light text-white mb-4 flex items-center gap-2">
              <img src="/history-white.png" alt="Recent" className="w-6 h-6" />{" "}
              Recent Activity
            </h2>
            <AdminRecentActivity user={user} />
          </div>
        )}
        {user && showDetail && selectedRequest && (
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
        {showQRModal && qrToken && (
          <QRCodeWithTimer
            token={qrToken}
            purpose="request"
            show={showQRModal}
            onClose={() => setShowQRModal(false)}
          />
        )}
        {showPasswordModal && (
          <PasswordConfirmModal
            show={showPasswordModal}
            loading={shareLoading}
            error={shareError}
            onConfirm={(pw) => {
              confirmShareDirect(pw);
            }}
            onCancel={() => {
              setShowPasswordModal(false);
            }}
          />
        )}
        <EditUploadModal
          show={!!editTarget && showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditTarget(null);
          }}
          onSubmit={async (file) => {
            setEditUploading(true);
            try {
              const response = await updateDocument(
                editTarget.id,
                file,
                editTarget.file_type
              );
              if (response.ok) {
                setShowEditModal(false);
                setRecentDocs((docs) =>
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
          }}
          loading={editUploading}
        />{" "}
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
        <ConfirmationModal
          show={showDeleteModal}
          title="Delete Document"
          message={`Are you sure you want to delete '${deleteTarget?.filename}'? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
      <Footer />
    </>
  );
}
