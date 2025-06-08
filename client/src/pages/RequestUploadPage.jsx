import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../contexts/UseAuth";
import FeedbackModal from "../components/FeedbackModal";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchLocationsByType, submitRequest } from "../components/utils";

export default function RequestUploadPage() {
  const { user, loading } = useAuth();

  const [type, setType] = useState("RT");
  const [tujuanSurat, setTujuanSurat] = useState("");

  const [provinsi, setProvinsi] = useState([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState("");

  const [kabupaten, setKabupaten] = useState([]);
  const [selectedKabupaten, setSelectedKabupaten] = useState("");

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState("");

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState("");

  const [rt, setRT] = useState([]);
  const [selectedRT, setSelectedRT] = useState("");

  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });

  useEffect(() => {
    async function fetchProvinsi() {
      try {
        const data = await fetchLocationsByType("provinsi");
        setProvinsi(Array.isArray(data) ? data : []);
        setSelectedProvinsi("");
      } catch (err) {
        console.error(err);
        setProvinsi([]);
      }
    }
    fetchProvinsi();
  }, []);

  useEffect(() => {
    async function fetchKabupaten() {
      if (selectedProvinsi) {
        try {
          const data = await fetchLocationsByType(
            "kabupaten_kota",
            selectedProvinsi
          );
          setKabupaten(Array.isArray(data) ? data : []);
          setSelectedKabupaten("");
        } catch (err) {
          console.error(err);
          setKabupaten([]);
        }
      } else {
        setKabupaten([]);
        setSelectedKabupaten("");
      }
    }
    fetchKabupaten();
  }, [selectedProvinsi]);

  useEffect(() => {
    async function fetchKecamatan() {
      if (selectedKabupaten) {
        try {
          const data = await fetchLocationsByType(
            "kecamatan",
            selectedKabupaten
          );
          setKecamatan(Array.isArray(data) ? data : []);
          setSelectedKecamatan("");
        } catch (err) {
          console.error(err);
          setKecamatan([]);
        }
      } else {
        setKecamatan([]);
        setSelectedKecamatan("");
      }
    }
    fetchKecamatan();
  }, [selectedKabupaten]);

  useEffect(() => {
    async function fetchKelurahan() {
      if (selectedKecamatan) {
        try {
          const data = await fetchLocationsByType(
            "kelurahan",
            selectedKecamatan
          );
          setKelurahan(Array.isArray(data) ? data : []);
          setSelectedKelurahan("");
        } catch (err) {
          console.error(err);
          setKelurahan([]);
        }
      } else {
        setKelurahan([]);
        setSelectedKelurahan("");
      }
    }
    fetchKelurahan();
  }, [selectedKecamatan]);

  useEffect(() => {
    async function fetchRT() {
      if (type === "RT" && selectedKelurahan) {
        try {
          const data = await fetchLocationsByType("rt", selectedKelurahan);
          setRT(Array.isArray(data) ? data : []);
          setSelectedRT("");
        } catch (err) {
          console.error(err);
          setRT([]);
        }
      } else {
        setRT([]);
        setSelectedRT("");
      }
    }
    fetchRT();
  }, [type, selectedKelurahan]);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleTujuanSuratChange = (event) => {
    setTujuanSurat(event.target.value);
  };

  const handleProvinsiChange = (event) => {
    setSelectedProvinsi(event.target.value);
  };

  const handleKabupatenChange = (event) => {
    setSelectedKabupaten(event.target.value);
  };

  const handleKecamatanChange = (event) => {
    setSelectedKecamatan(event.target.value);
  };

  const handleKelurahanChange = (event) => {
    setSelectedKelurahan(event.target.value);
  };

  const handleRTChange = (event) => {
    setSelectedRT(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitRequest(
        tujuanSurat,
        type,
        type === "RT" ? selectedRT : null,
        type === "Kelurahan" ? selectedKelurahan : null
      );

      setFeedback({
        show: true,
        message: "Request submitted successfully!",
        isSuccess: true,
      });
      setTimeout(() => {
        setFeedback({ show: false, message: "", isSuccess: true });
        setTimeout(() => (window.location.href = "/requests/upload"), 800);
      }, 1500);
    } catch (error) {
      setFeedback({
        show: true,
        message: error.message,
        isSuccess: false,
      });
      setTimeout(
        () => setFeedback({ show: false, message: "", isSuccess: false }),
        1500
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen font-[Lexend] pt-[8vh] px-4 py-8">
          <FeedbackModal
            show={feedback.show}
            message={feedback.message}
            isSuccess={feedback.isSuccess}
            onClose={() => setFeedback({ ...feedback, show: false })}
          />
          <h1 className="text-3xl font-light mb-4 text-white">
            Request Cover Letter
          </h1>
          <p className="text-white/90 text-sm mb-6 text-center max-w-lg font-light">
            Fill out the form below to request a new cover letter from your local authorities.
          </p>
          <div className="p-8 rounded-2xl w-full max-w-3xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-white">
                Purpose of the Letter
              </label>
              <select
                className="block w-full p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={type}
                onChange={handleTypeChange}
                required
              >
                <option value="RT">RT</option>
                <option value="Kelurahan">Kelurahan</option>
              </select>
              
              <label className="block mb-2 text-sm font-medium text-white">
                Provinsi
              </label>
              <select
                className="block w-full p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                value={selectedProvinsi}
                onChange={handleProvinsiChange}
                required
              >
                <option value="">-- Select Provinsi --</option>
                {provinsi.map((prov) => (
                  <option key={prov.provinsi_id} value={prov.provinsi_id}>
                    {prov.name}
                  </option>
                ))}
              </select>

              {selectedProvinsi && (
                <>
                  <label className="block mb-2 text-sm font-medium text-white">
                    Kabupaten/Kota
                  </label>
                  <select
                    className="block w-full p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    value={selectedKabupaten}
                    onChange={handleKabupatenChange}
                    required
                  >
                    <option value="">-- Select Kabupaten/Kota --</option>
                    {kabupaten.map((kab) => (
                      <option
                        key={kab.kabupaten_kota_id}
                        value={kab.kabupaten_kota_id}
                      >
                        {kab.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {selectedKabupaten && (
                <>
                  <label className="block mb-2 text-sm font-medium text-white">
                    Kecamatan
                  </label>
                  <select
                    className="block w-full p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    value={selectedKecamatan}
                    onChange={handleKecamatanChange}
                    required
                  >
                    <option value="">-- Select Kecamatan --</option>
                    {kecamatan.map((kec) => (
                      <option key={kec.kecamatan_id} value={kec.kecamatan_id}>
                        {kec.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {selectedKecamatan && (
                <>
                  <label className="block mb-2 text-sm font-medium text-white">
                    Kelurahan/Desa
                  </label>
                  <select
                    className="block w-full p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    value={selectedKelurahan}
                    onChange={handleKelurahanChange}
                    required
                  >
                    <option value="">-- Select Kelurahan/Desa --</option>
                    {kelurahan.map((kel) => (
                      <option
                        key={kel.kelurahan_desa_id}
                        value={kel.kelurahan_desa_id}
                      >
                        {kel.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {type === "RT" && selectedKelurahan && rt.length > 0 && (
                <>
                  <label className="block mb-2 text-sm font-medium text-white">
                    RT
                  </label>
                  <select
                    className="block w-full p-3 mb-4 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    value={selectedRT}
                    onChange={handleRTChange}
                  >
                    <option value="">-- Select RT --</option>
                    {rt.map((r) => (
                      <option key={r.rt_id} value={r.rt_id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label className="block mb-2 text-sm font-medium text-white">
                Additional Details
              </label>
              <input
                type="text"
                className="block w-full p-3 mb-6 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-white/60"
                value={tujuanSurat}
                onChange={handleTujuanSuratChange}
                placeholder="Enter additional details for your request..."
                required
              />
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-[Lexend] font-light shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}