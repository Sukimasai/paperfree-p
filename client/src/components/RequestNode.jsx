import { useState, useEffect, useRef } from "react";
import useAuth from "../contexts/UseAuth";
import gsap from "gsap";
import {
  fetchUserFullName,
  fetchRTName,
  fetchKelurahanName,
  deleteRequest,
} from "./utils";

const rtCache = {};
const kelurahanCache = {};
const userCache = {};

export default function RequestNode({
  request,
  isAdmin,
  onShowDetail,
  onShowConfirm,
  onShareRequest,
  onApprove,
  onReject,
  onDeleteSuccess,
  onDeleteError,
  isShare = false,
}) {
  const { user } = useAuth();
  const [rtName, setRTName] = useState("");
  const [kelurahanName, setKelurahanName] = useState("");
  const [userName, setUserName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const nodeRef = useRef(null);
  useEffect(() => {
    async function loadLocationAndUserData() {
      if (request.rt_id) {
        if (rtCache[request.rt_id]) {
          setRTName(rtCache[request.rt_id]);
        } else {
          const rtName = await fetchRTName(request.rt_id);
          if (rtName) {
            rtCache[request.rt_id] = rtName;
            setRTName(rtName);
          }
        }
      }

      let kelurahanId = request.kelurahan_id;
      if (!kelurahanId && request.rt_id) {
        kelurahanId = request.rt_id.slice(0, 12);
      }
      if (kelurahanId) {
        if (kelurahanCache[kelurahanId]) {
          setKelurahanName(kelurahanCache[kelurahanId]);
        } else {
          const kelurahanName = await fetchKelurahanName(
            request.kelurahan_id,
            request.rt_id
          );
          if (kelurahanName) {
            kelurahanCache[kelurahanId] = kelurahanName;
            setKelurahanName(kelurahanName);
          }
        }
      }

      if (request.user_id) {
        if (userCache[request.user_id]) {
          setUserName(userCache[request.user_id]);
        } else {
          const fullName = await fetchUserFullName(request.user_id);
          userCache[request.user_id] = fullName;
          setUserName(fullName);
        }
      }
    }

    loadLocationAndUserData();
  }, [request]);

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

  const confirmDelete = async () => {
    try {
      await deleteRequest(request.id);
      if (onDeleteSuccess) {
        onDeleteSuccess("Request deleted successfully.");
      } else {
        window.location.reload();
      }
    } catch (err) {
      if (onDeleteError) {
        onDeleteError(err.message || "Failed to delete request.");
      } else {
        window.location.reload();
      }
    }
  };

  const canShare =
    user && user.id === request.user_id && request.status === "approved";
  return (
    <div
      ref={nodeRef}
      className="relative bg-slate-800/40 border border-white/10 rounded-xl p-6 shadow-xl flex flex-col mb-4 w-full max-w-sm mx-auto z-20 hover:scale-105 transition-all duration-300 ease-out hover:shadow-2xl hover:bg-slate-800/60"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      {" "}
      <h2 className="text-xl font-[Lexend] font-light mb-3 text-nowrap text-white">
        {request.nomor_surat}
      </h2>
      <div className="space-y-2 mb-4">
        <p className="text-white/90 font-[Lexend] font-light">
          <span className="text-green-300">Full Name:</span> {userName}
        </p>

        {request.rt_id ? (
          <p className="text-white/90 font-[Lexend] font-light">
            <span className="text-green-300">Location:</span>{" "}
            {rtName ? rtName : "RT not loaded"},{" "}
            {kelurahanName ? kelurahanName : "Kelurahan not loaded"}
          </p>
        ) : request.kelurahan_id ? (
          <p className="text-white/90 font-[Lexend] font-light">
            <span className="text-green-300">Location:</span>{" "}
            {kelurahanName ? kelurahanName : "Kelurahan not loaded"}
          </p>
        ) : null}

        <p className="text-white/90 font-[Lexend] font-light">
          <span className="text-green-300">Purpose:</span>{" "}
          {request.tujuan_surat}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-green-300 font-[Lexend] font-light">
            Status:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-[Lexend] font-light ${
              request.status === "approved"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : request.status === "rejected"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
            }`}
          >
            {request.status}
          </span>{" "}
        </div>
      </div>
      <button
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
        onClick={() =>
          onShowDetail && onShowDetail(request, rtName, kelurahanName)
        }
      >
        View Details
      </button>{" "}
      {isAdmin && (
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() =>
              onShowConfirm &&
              onShowConfirm("approve", () => onApprove && onApprove(request))
            }
          >
            Approve
          </button>
          <button
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() =>
              onShowConfirm &&
              onShowConfirm("reject", () => onReject && onReject(request))
            }
          >
            Reject
          </button>
        </div>
      )}
      {!isAdmin && !isShare && (
        <>
          {" "}
          <button
            className="absolute top-3 right-3 p-2 hover:opacity-75 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-300/20 transition-all duration-200 hover:bg-red-500/30 hover:scale-105"
            onClick={() =>
              onShowConfirm && onShowConfirm("delete", confirmDelete)
            }
            title="Delete request"
            aria-label="Delete request"
          >
            <img src="/trash-white.png" alt="Delete" className="w-5 h-5" />
          </button>
          {canShare && (
            <button
              className="absolute top-16 right-3 p-2 hover:opacity-75 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-300/20 transition-all duration-200 hover:bg-green-500/30 hover:scale-105"
              onClick={() =>
                onShareRequest && onShareRequest(request, rtName, kelurahanName)
              }
              title="Share request"
              aria-label="Share request"
            >
              <img src="/qr-white.png" alt="Share" className="w-5 h-5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
