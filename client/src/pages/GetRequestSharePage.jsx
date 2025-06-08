import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RequestNode from "../components/RequestNode";
import RequestDetail from "../components/RequestDetail";
import ConfirmationModal from "../components/ConfirmationModal";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { activateAndFetchShare } from "../components/utils";

export default function GetRequestSharePage() {
  const { token } = useParams();
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRT, setSelectedRT] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  useEffect(() => {
    async function handleActivateAndFetch() {
      if (!token) return;

      const result = await activateAndFetchShare(token, "request");
      setShare(result);
      setLoading(false);
    }

    handleActivateAndFetch();
  }, [token]);
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

  const handleShareRequest = () => {};

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <p className="text-white font-[Lexend] font-light">Loading...</p>
      </div>
    );
  return (
    <>
      <Header />
      <div className="flex flex-col items-center px-4 py-8 mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white font-[Lexend] pt-[10vh] min-h-screen w-full">
        <h2 className="mb-4 text-3xl font-light text-white">Shared Request</h2>
        <h3 className="text-white/80 text-sm mb-1 font-light">
          Share Token:{" "}
          <span className="font-medium break-all text-green-300">{token}</span>
        </h3>
        <h3 className="text-white/80 text-sm mb-4 font-light">
          Expired at:{" "}
          <span className="font-medium text-green-300">
            {share?.downloadExpiresAt
              ? new Date(share.downloadExpiresAt).toLocaleString()
              : "Not specified"}
          </span>
        </h3>{" "}
        {share ? (
          share.error ? (
            <p className="text-red-300 font-light">{share.error}</p>
          ) : (
            <div className="w-full max-w-6xl flex justify-center">
              <div className="break-inside-avoid w-full max-w-6xl">
                <RequestNode
                  request={share.request}
                  isAdmin={false}
                  isShare={true}
                  onShowDetail={handleShowDetail}
                  onShowConfirm={handleShowConfirm}
                  onShareRequest={handleShareRequest}
                />
              </div>
            </div>
          )
        ) : (
          <p className="text-red-300 font-light">Loading...</p>
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
            message={confirmModalProps.message}
            onConfirm={confirmModalProps.onConfirm}
            onCancel={confirmModalProps.onCancel}
            confirmText={confirmModalProps.confirmText}
            cancelText={confirmModalProps.cancelText}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
