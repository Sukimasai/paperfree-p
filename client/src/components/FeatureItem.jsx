import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function FeatureItem({ title, description, imageSrc }) {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (nodeRef.current) {
      gsap.fromTo(
        nodeRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 4, ease: "power2.out" }
      );
    }
  }, []);
  const handleHover = () => {
    gsap.to(nodeRef.current, {
      scale: 1.02,
      y: -8,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleHoverLeave = () => {
    gsap.to(nodeRef.current, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });
  };
  return (
    <div
      className="group relative flex flex-col items-center p-8 md:p-10 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:border-green-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10"
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverLeave}
      ref={nodeRef}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/20">
          <img
            src={imageSrc}
            alt={title}
            className="w-12 h-12 md:w-14 md:h-14"
          />
        </div>

        <h3 className="text-xl md:text-2xl font-medium mb-4 text-white group-hover:text-green-300 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm md:text-base leading-relaxed text-white/70 group-hover:text-white/90 transition-colors duration-300 font-light">
          {description}
        </p>
      </div>
    </div>
  );
}
