export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-t from-slate-950 to-slate-900 text-white pt-16 pb-8 font-[Lexend] border-t border-slate-700/50">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-3">
            <img
              src="/logo-white.png"
              alt="PaperFree Logo"
              className="w-10 h-10"
            />
            <span className="text-2xl font-light tracking-wide text-white">
              PaperFree
            </span>
          </div>

          <nav className="flex flex-wrap gap-8 text-sm">
            <a
              href="/"
              className="hover:text-green-300 transition-colors duration-300 font-light hover:underline decoration-green-300"
            >
              Home
            </a>
            <a
              href="/login"
              className="hover:text-green-300 transition-colors duration-300 font-light hover:underline decoration-green-300"
            >
              Login
            </a>
            <a
              href="/register"
              className="hover:text-green-300 transition-colors duration-300 font-light hover:underline decoration-green-300"
            >
              Register
            </a>
            <a
              href="/profile"
              className="hover:text-green-300 transition-colors duration-300 font-light hover:underline decoration-green-300"
            >
              Profile
            </a>
            <a
              href="mailto:reagan.wibowo@binus.ac.id"
              className="hover:text-green-300 transition-colors duration-300 font-light hover:underline decoration-green-300"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-700/30 text-center">
          <span className="text-sm text-white/60 font-light">
            &copy; {new Date().getFullYear()} PaperFree. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
