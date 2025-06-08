import { useEffect, useRef } from "react";
import FeatureItem from "../components/FeatureItem";
import ScrollSection from "../components/ScrollSection";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Header from "../components/Header";
import Footer from "../components/Footer";

gsap.registerPlugin(ScrollToPlugin);

export default function LandingPage() {
  const sectionsRef = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    sectionsRef.current.forEach((section, i) => {
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          delay: 0.1 + i * 0.15,
          ease: "power2.out",
        }
      );
    });
    if (ctaRef.current) {
      gsap.to(ctaRef.current, {
        y: -8,
        repeat: -1,
        yoyo: true,
        duration: 1.25,
        ease: "power1.inOut",
        delay: 0.1 + sectionsRef.current.length * 0.15,
      });
    }
  }, []);

  const features = [
    {
      title: "Scan & Upload",
      description:
        "Scan your documents and upload them to the platform. Wait for the verification process. And then you have your documents!",
      imageSrc: "/scan-white.png",
    },
    {
      title: "Request",
      description:
        "Reuqest cover letter from your local government. You can request it from your smartphone, and the letter will be sent to you digitally.",
      imageSrc: "/request-white.png",
    },
    {
      title: "Share",
      description:
        "Select your documents, and share them with trusted parties. Time-limited access and QR code ensures the privacy of your documents.",
      imageSrc: "/qr-white.png",
    },
  ];

  return (
    <>
      <Header />
      <section className="relative w-full flex flex-row items-center justify-center min-h-screen h-screen max-h-none overflow-hidden p-0">
        <div className="flex flex-col md:flex-row w-full h-full">
          <div className="flex flex-col items-center md:items-start justify-center w-full md:w-1/2 h-1/2 md:h-full py-8 md:py-16 px-8 md:px-16 lg:px-24 bg-gradient-to-b md:bg-gradient-to-r from-slate-900/90 to-slate-800/80">
            <h1 className="text-6xl lg:text-9xl mb-4 tracking-tight text-white text-center md:text-left font-[Lexend] font-light">
              PaperFree
            </h1>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold mb-4 text-green-200 text-center md:text-left">
              Smart Sharing
              <br />
              Greener Future
            </h2>
            <p className="text-sm md:text-lg lg:text-xl max-w-lg mb-6 md:mb-8 text-white/90 text-center md:text-left">
              Easily upload, manage, and selectively share official documents
              with trusted parties, making your government-related matters
              easier and hassle-free.
            </p>
            <button
              className="px-6 md:px-8 py-3 md:py-4 font-bold text-white bg-gradient-to-r from-green-700/80 to-blue-700/80 rounded-xl shadow-lg text-base md:text-lg lg:text-xl tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-green-700 hover:to-blue-700"
              onClick={() => {
                const target = document.getElementById("why-paperfree-section");
                if (target) {
                  gsap.to(window, {
                    scrollTo: { y: target, offsetY: 60 },
                    duration: 0.9,
                    ease: "power2.inOut",
                  });
                }
              }}
            >
              Learn More
            </button>
          </div>

          <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
            <img
              src="/hero.jpg"
              alt="Hero"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>
      <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 font-[Lexend]">
        <section
          id="why-paperfree-section"
          className="relative py-20 md:py-24 lg:py-28 px-8 md:px-16 lg:px-24"
          ref={(el) => (sectionsRef.current[1] = el)}
        >
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-white tracking-tight">
                Why{" "}
                <span className="text-green-300 font-medium">PaperFree</span>?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto mb-8"></div>
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto text-white/80 font-light">
                With PaperFree, you don't have to bring copies of your documents
                every time you are taking care of official matters. Just scan,
                share, and download.{" "}
                <span className="text-green-300">
                  Less paper, save the earth.
                </span>
              </p>
            </div>
          </div>
        </section>
        <section
          className="relative py-20 md:py-24 lg:py-28 px-8 md:px-16 lg:px-24 bg-gradient-to-r from-slate-800/50 to-slate-700/30"
          ref={(el) => (sectionsRef.current[2] = el)}
        >
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-white tracking-tight">
                How does it{" "}
                <span className="text-green-300 font-medium">save earth</span>?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto mb-8"></div>{" "}
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto text-white/80 font-light">
                By reducing the need for physical copies of documents, PaperFree
                minimizes paper waste and the carbon footprint associated with
                printing and transporting documents. This contributes to a
                <span className="text-green-300"> more sustainable future</span>
                .
              </p>
            </div>
          </div>
        </section>
        <section
          className="relative py-20 md:py-24 lg:py-28 px-8 md:px-16 lg:px-24"
          ref={(el) => (sectionsRef.current[3] = el)}
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-white tracking-tight">
                Powerful{" "}
                <span className="text-green-300 font-medium">Features</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto mb-8"></div>
              <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto font-light">
                Everything you need to manage your documents digitally
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
              {features.map((feature) => (
                <FeatureItem
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  imageSrc={feature.imageSrc}
                />
              ))}
            </div>
          </div>
        </section>
        <section
          className="relative py-20 md:py-24 lg:py-28 px-8 md:px-16 lg:px-24 bg-gradient-to-r from-slate-800/50 to-slate-700/30"
          ref={(el) => (sectionsRef.current[4] = el)}
        >
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-white tracking-tight">
                Supported{" "}
                <span className="text-green-300 font-medium">Documents</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 mx-auto mb-8"></div>
              <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto font-light mb-12">
                Upload and manage all your important documents in one secure
                place
              </p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50">
              <ScrollSection />
            </div>
          </div>
        </section>
        <section className="relative py-24 md:py-32 lg:py-40 px-8 md:px-16 lg:px-24 text-center bg-gradient-to-t from-slate-950 to-slate-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-8 text-white tracking-tight leading-tight">
              Ready to simplify your
              <br />
              <span className="text-green-300 font-medium">
                document management
              </span>
              ?
            </h2>
            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto font-light">
              Join thousands who have already made their document handling
              paperless and efficient
            </p>
            <button
              ref={ctaRef}
              className="px-12 md:px-16 py-5 md:py-6 font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-2xl text-lg md:text-xl tracking-wide transition-all duration-500 hover:scale-105 hover:shadow-green-500/25 hover:from-green-500 hover:to-blue-500 border border-green-500/20"
              onClick={() => (window.location.href = "/login")}
            >
              Get Started Today
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
