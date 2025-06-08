import { useEffect, useRef, useState } from "react";
import NavigationBar from "./NavigationBar";
import useAuth from "../contexts/UseAuth";
import gsap from "gsap";

export default function Header() {
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const [_isVisible, setIsVisible] = useState(true);
  const { user, loading } = useAuth();
  const isLandingPage = window.location.pathname.includes("landing");

  useEffect(() => {
    if (!isLandingPage) return;

    const hero = document.querySelector("section.relative");
    if (!hero || !headerRef.current) return;

    const header = headerRef.current;
    const logo = logoRef.current;

    if (logo) {
      gsap.set(logo, { autoAlpha: 0 });
    }
    gsap.set(header, { backgroundColor: "transparent" });

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          if (logo) {
            gsap.to(logo, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
          }
          gsap.to(header, {
            backgroundColor: "transparent",
            duration: 0.5,
            ease: "power2.out",
          });
          setIsVisible(false);
        } else {
          if (logo) {
            gsap.to(logo, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
          }
          gsap.to(header, {
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            duration: 0.5,
            ease: "power2.out",
          });
          setIsVisible(true);
        }
      },
      { threshold: [0.5] }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isLandingPage]);
  return (
    <header
      ref={headerRef}
      className="h-[8vh] flex items-center justify-between pl-8 pr-4 md:pl-16 md:pr-6 lg:pl-24 lg:pr-8 font-[Lexend] font-light text-white fixed top-0 w-full z-30 transition-all duration-500"
      style={{
        pointerEvents: undefined,
        backgroundColor: isLandingPage
          ? "transparent"
          : "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        ref={logoRef}
        className={`flex items-center ${isLandingPage ? "opacity-0" : ""}`}
      >
        <img src="/logo-white.png" alt="Logo" className="w-10 h-10 mr-3" />
        <a href="/" className="text-2xl md:text-3xl font-light tracking-wide">
          PaperFree
        </a>
      </div>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : !user ? (
        <a
          href="/login"
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-600/80 to-blue-600/80 text-white hover:from-green-500 hover:to-blue-500 hover:scale-105 border border-green-500/20"
        >
          Login
        </a>
      ) : (
        <NavigationBar />
      )}
    </header>
  );
}
