import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DocumentNode from "../components/DocumentNode";
import useAuth from "../contexts/UseAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { activateAndFetchShare } from "../components/utils";

export default function GetSharePage() {
  const { loading } = useAuth();
  const [share, setShare] = useState(null);
  const { token } = useParams();

  useEffect(() => {
    async function handleActivateAndFetch() {
      if (!token) return;
      const result = await activateAndFetchShare(token, "documents");
      setShare(result);
    }

    handleActivateAndFetch();
  }, [token]);

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
        <h2 className="mb-4 text-3xl font-light text-white">Share Details</h2>
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
          <div className="w-full max-w-7xl columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {share.error ? (
              <p className="text-red-300 font-light">{share.error}</p>
            ) : (
              share.files?.map((doc) => (
                <div key={doc.id} className="break-inside-avoid mb-4">
                  <DocumentNode 
                    document={doc}
                    isShare={true}
                    downloadUrl={doc.downloadUrl}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="text-red-300 font-light">Loading...</p>
        )}
      </div>
      <Footer />
    </>
  );
}
