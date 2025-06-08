import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import RequestNode from "../components/RequestNode";
import RequestDetail from "../components/RequestDetail";
import QRCodeWithTimer from "../components/QRCodeWithTimer";
import ConfirmationModal from "../components/ConfirmationModal";
import PasswordConfirmModal from "../components/PasswordConfirmModal";
import FeedbackModal from "../components/FeedbackModal";
import useAuth from "../contexts/UseAuth";
import { fetchRequestsByStatus, shareRequest } from "../components/utils";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RequestPage() {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRT, setSelectedRT] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQRToken] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });

  useEffect(() => {
    const fetchRequestsData = async () => {
      try {
        const data = await fetchRequestsByStatus("approved", user);
        setRequests(data);
      } catch (err) {
        console.errror(err);
      }
    };
    fetchRequestsData();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "user") return <Navigate to="/" replace />;

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.nomor_surat?.toLowerCase().includes(search.toLowerCase()) ||
      req.tujuan_surat?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
    setShowPasswordModal(true);
    setShareError(null);
    setSelectedRequest(request);
    setSelectedRT(rtName);
    setSelectedKelurahan(kelurahanName);
  };

  const handlePasswordConfirm = (pw) => {
    setShowPasswordModal(false);
    handleShareWithPassword(pw);
  };
  const handleShareWithPassword = async (pw) => {
    setShareLoading(true);
    setShareError(null);
    try {
      const token = await shareRequest(selectedRequest.id, pw);
      setQRToken(token);
      setShowQRModal(true);
    } catch (err) {
      setShareError(err.message);
      setShowPasswordModal(true);
    } finally {
      setShareLoading(false);
    }
  };
  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />
        <div className="flex flex-col items-center px-4 py-8 mx-auto text-white font-[Lexend] pt-[10vh] min-h-screen w-full max-w-7xl">
          <h1 className="text-3xl font-light mb-4 text-white">Requests</h1>
          <p className="text-white/90 text-sm mb-6 text-center max-w-lg font-light">
            View, share, and manage your approved cover letter requests here.
          </p>
          <button
            className="mb-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105 w-[80vw] md:w-auto"
            onClick={() => (window.location.href = "/requests/upload")}
          >
            Request Cover Letter
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 w-[80vw] max-w-3xl px-2 justify-center items-center">
            <input
              type="text"
              placeholder="Search by number or tujuan surat..."
              className="px-4 py-3 rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent w-full md:w-1/2 bg-slate-800/40 text-white placeholder-white/60 font-[Lexend] font-light"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {requests.length > 0 ? (
            <div className="items-center w-full max-w-7xl gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <RequestNode
                    key={request.id}
                    request={request}
                    isAdmin={false}
                    user={user}
                    onShowDetail={handleShowDetail}
                    onShowConfirm={handleShowConfirm}
                    onShareRequest={handleShareRequest}
                    onDeleteSuccess={(message) => {
                      setFeedback({
                        show: true,
                        message: message || "Request deleted successfully.",
                        isSuccess: true,
                      });
                      setRequests((reqs) =>
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-12 col-start-2">
                  <img
                    src="/request-white.png"
                    alt="No requests"
                    className="w-24 h-24 mb-4 opacity-60"
                  />
                  <p className="text-white/80 text-lg font-light font-[Lexend]">
                    No requests found for your search.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-12">
              <img
                src="/request-white.png"
                alt="No requests"
                className="w-24 h-24 mb-4 opacity-60"
              />
              <p className="text-white/80 text-lg font-light font-[Lexend] mb-4">
                No requests found.
              </p>
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => (window.location.href = "/requests/upload")}
              >
                Make a Request
              </button>
            </div>
          )}
          {showDetail && selectedRequest && (
            <RequestDetail
              request={selectedRequest}
              onClose={() => setShowDetail(false)}
              rtName={selectedRT}
              kelurahanName={selectedKelurahan}
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
          {showPasswordModal && (
            <PasswordConfirmModal
              show={showPasswordModal}
              loading={shareLoading}
              error={shareError}
              onConfirm={handlePasswordConfirm}
              onCancel={() => setShowPasswordModal(false)}
            />
          )}
          <FeedbackModal
            show={feedback.show}
            message={feedback.message}
            isSuccess={feedback.isSuccess}
            onClose={() => setFeedback({ ...feedback, show: false })}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
