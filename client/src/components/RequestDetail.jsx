import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import gsap from "gsap";
import { fetchUserFullName } from "./utils";

export default function RequestDetail({
  request,
  onClose,
  rtName,
  kelurahanName,
}) {
  const [fullName, setFullName] = useState("");
  const detailRef = useRef(null);
  useEffect(() => {
    async function loadFullName() {
      const name = await fetchUserFullName(request.user_id);
      setFullName(name);
    }
    loadFullName();
  }, [request.user_id, request.request_type]);
  useEffect(() => {
    if (detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  const createdAt = request.created_at
    ? dayjs(request.created_at).format("DD/MM/YYYY")
    : "-";

  let areaName = "-";
  if (request.request_type === "RT") {
    areaName = rtName || request.rt_name || "-";
  } else if (
    request.request_type === "kelurahan" ||
    request.request_type === "Kelurahan"
  ) {
    areaName = kelurahanName || request.kelurahan_name || "-";
  }
  return (
    <div
      ref={detailRef}
      className="fixed inset-0 flex items-center justify-center z-100"
    >
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl shadow-2xl text-white relative z-20 w-[80vw] max-w-2xl font-[Lexend]">
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-light hover:scale-110 transition-all duration-300"
          onClick={onClose}
        >
          <img src="/close.png" alt="Close" className="w-6 h-6 filter invert" />
        </button>
        <h2 className="text-3xl font-light mb-6 text-white">Request Details</h2>
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left">
            <tbody>
              <tr>
                <td className="font-light text-green-300 pr-4 align-top py-3 whitespace-nowrap">
                  ID
                </td>
                <td className="py-3 break-all text-white/90 font-light">
                  {request.id}
                </td>
              </tr>
              <tr>
                <td className="font-light text-green-300 pr-4 align-top py-3 whitespace-nowrap">
                  Full Name
                </td>
                <td className="py-3 break-all text-white/90 font-light">
                  {fullName}
                </td>
              </tr>
              <tr>
                <td className="font-light text-green-300 pr-4 align-top py-3 whitespace-nowrap">
                  Letter Number
                </td>
                <td className="py-3 break-all text-white/90 font-light">
                  {request.nomor_surat}
                </td>
              </tr>
              <tr>
                <td className="font-light text-green-300 pr-4 align-top py-3 whitespace-nowrap">
                  Purpose of Letter
                </td>
                <td className="py-3 break-all text-white/90 font-light">
                  {request.tujuan_surat}
                </td>
              </tr>
              <tr>
                <td className="font-light text-green-300 pr-4 align-top py-3 whitespace-nowrap">
                  {request.request_type === "RT"
                    ? "RT Name"
                    : request.request_type === "Kelurahan"
                    ? "Kelurahan Name"
                    : "Area"}
                </td>
                <td className="py-3 break-all text-white/90 font-light">
                  {areaName}
                </td>
              </tr>
              <tr>
                <td className="font-light text-green-300 pr-4 align-top py-3 whitespace-nowrap">
                  Created At
                </td>
                <td className="py-3 break-all text-white/90 font-light">
                  {createdAt}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center mt-6">
          <span
            className={`px-4 py-2 rounded-xl font-light border ${
              request.status === "approved"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : request.status === "pending"
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                : request.status === "rejected"
                ? "bg-red-500/20 text-red-300 border-red-500/30"
                : "bg-gray-500/20 text-gray-300 border-gray-500/30"
            }`}
          >
            {request.status
              ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
              : "Unknown"}
          </span>
        </div>
      </div>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
        onClick={onClose}
      ></div>
    </div>
  );
}
