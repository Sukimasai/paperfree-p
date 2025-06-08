import { useState, useEffect } from "react";
import RequestNode from "../components/RequestNode";
import useAuth from "../contexts/UseAuth";
import { Navigate } from "react-router-dom";
import RequestDetail from "../components/RequestDetail";
import ConfirmationModal from "../components/ConfirmationModal";
import FeedbackModal from "../components/FeedbackModal";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RequestsPendingPage() {
  const { user, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRT, setSelectedRT] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let endpoint = `${apiUrl}/api/requests`;
    if (user.role === "rt_admin") {
      endpoint = `${apiUrl}/api/rt-admin/requests`;
    } else if (user.role === "kelurahan_admin") {
      endpoint = `${apiUrl}/api/kelurahan-admin/requests`;
    }

    async function fetchRequests() {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Error fetching requests: " + response.status);
        }
        const data = await response.json();
        setRequests(data);
      } catch {
        setError("Error fetching requests");
      }
    }

    fetchRequests();
  }, [user, loading, apiUrl]);

  const handleShowDetail = (request, rtName, kelurahanName) => {
    setSelectedRequest(request);
    setSelectedRT(rtName);
    setSelectedKelurahan(kelurahanName);
    setShowDetail(true);
  };

  const handleApprove = async (request) => {
    try {
      let url;
      if (user.role === "rt_admin") {
        url = `${apiUrl}/api/rt-admin/requests/approve/${request.id}`;
      } else if (user.role === "kelurahan_admin") {
        url = `${apiUrl}/api/kelurahan-admin/requests/approve/${request.id}`;
      } else {
        throw new Error(
          "Unauthorized: Only RT or Kelurahan admin can approve."
        );
      }
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to approve request");
      setFeedback({
        show: true,
        message: "Request approved successfully!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        window.location.reload();
      }, 1200);
    } catch (error) {
      setFeedback({
        show: true,
        message: error.message || "Approve failed.",
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1200
      );
    }
  };

  const handleReject = async (request) => {
    try {
      let url;
      if (user.role === "rt_admin") {
        url = `${apiUrl}/api/rt-admin/requests/reject/${request.id}`;
      } else if (user.role === "kelurahan_admin") {
        url = `${apiUrl}/api/kelurahan-admin/requests/reject/${request.id}`;
      } else {
        throw new Error("Unauthorized: Only RT or Kelurahan admin can reject.");
      }
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to reject request");
      setFeedback({
        show: true,
        message: "Request rejected successfully!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        window.location.reload();
      }, 1200);
    } catch (error) {
      setFeedback({
        show: true,
        message: error.message || "Reject failed.",
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1200
      );
    }
  };
  const [pendingAction, setPendingAction] = useState(null);

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
        <h1 className="text-3xl font-light text-white mb-4">
          Pending Requests
        </h1>
        <p className="text-white/80 text-sm mb-4 text-center max-w-lg font-light">
          Manage requests from users
        </p>
        {error && <p className="text-red-300 font-light">{error}</p>}
        {requests.length > 0 ? (
          <div className="flex flex-col items-center w-full max-w-7xl gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
            {" "}
            {requests.map((request) => (
              <RequestNode
                key={request.id}
                request={request}
                isAdmin={true}
                onShowDetail={handleShowDetail}
                onShowConfirm={(type, action) => {
                  setConfirmType(type);
                  setPendingAction(() => action);
                  setShowConfirmModal(true);
                }}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center w-full min-h-[40vh] overflow-hidden">
            <img
              src="/request-white.png"
              alt="No pending requests"
              className="w-16 h-16 mb-2 opacity-60"
            />
            <p className="text-white/60 text-base font-[Lexend] font-light">
              There are no pending requests.
            </p>
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
        {showConfirmModal && (
          <ConfirmationModal
            show={showConfirmModal}
            message={
              confirmType === "approve"
                ? `Approve ${
                    pendingAction && selectedRequest?.nomor_surat
                      ? selectedRequest.nomor_surat
                      : "this request"
                  }?`
                : confirmType === "reject"
                ? `Reject ${
                    pendingAction && selectedRequest?.nomor_surat
                      ? selectedRequest.nomor_surat
                      : "this request"
                  }?`
                : ""
            }
            onConfirm={pendingAction}
            onCancel={() => setShowConfirmModal(false)}
            confirmText="Confirm"
            cancelText="Cancel"
          />
        )}
        <FeedbackModal
          show={feedback.show}
          message={feedback.message}
          isSuccess={feedback.isSuccess}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
      </div>
      <Footer />
    </div>
  );
}
