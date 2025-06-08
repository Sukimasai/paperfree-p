import { useRef, useEffect } from "react";
import { gsap } from "gsap";

const fileTypes = [
  "KTP",
  "KK",
  "SIM",
  "SKCK",
  "Ijazah",
  "Akte Kelahiran",
  "NPWP",
  "Kartu Keluarga",
  "Surat Nikah",
  "Surat Cerai",
  "Pas Foto",
  "CV",
  "Sertifikat",
  "Surat Kematian",
  "Surat Pindah",
  "Surat Pengantar",
];

export default function ScrollSection() {
  const marqueeRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const totalWidth = content.scrollWidth / 2;

    gsap.killTweensOf(content);

    gsap.to(content, {
      x: `-=${totalWidth}`,
      duration: 30,
      ease: "linear",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const val = parseFloat(x);
          return (val % -totalWidth) + "px";
        },
      },
    });
  }, []);

  const fileTypeItems = fileTypes.map((type, i) => [
    <span
      key={`dot-${i}`}
      className="dot text-green-300 text-2xl md:text-3xl mx-2 select-none"
      aria-hidden="true"
    >
      •
    </span>,
    <span
      key={`filetype-label-${i}`}
      className="file-type font-semibold whitespace-nowrap mx-1 text-gray-300 text-base md:text-lg lg:text-xl"
      style={{ textShadow: "0 2px 8px #0006", fontWeight: 600 }}
    >
      {type}
    </span>,
  ]);

  return (
    <div className="w-full max-w-[100vw] flex flex-col items-center">
      <div
        ref={marqueeRef}
        className="relative w-full overflow-hidden border-green-700 border-t-2 border-b-2 shadow-lg"
      >
        <div
          ref={contentRef}
          className="flex items-center whitespace-nowrap font-semibold gap-6 px-4 py-3"
        >
          {[...fileTypeItems.flat(), ...fileTypeItems.flat()]}
        </div>
      </div>
    </div>
  );
}
