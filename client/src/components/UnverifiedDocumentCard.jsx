export default function UnverifiedCard({
  count = 0,
  onClick,
  type = "document",
  role = "admin",
}) {
  let icon = "/scan-white.png";
  let title = "Unverified Documents";
  let subtitle = "Documents awaiting admin verification";
  let button = "Verify Now";

  if (type === "request") {
    icon = "/request.png";
    title =
      role === "rt_admin"
        ? "Unapproved Requests"
        : role === "kelurahan_admin"
        ? "Unapproved Requests"
        : "Unapproved Requests";
    subtitle =
      role === "rt_admin"
        ? "Requests waiting for RT approval"
        : role === "kelurahan_admin"
        ? "Requests waiting for Kelurahan approval"
        : "Requests awaiting approval";
    button =
      role === "rt_admin"
        ? "Review Requests"
        : role === "kelurahan_admin"
        ? "Review Requests"
        : "Review Requests";
  }

  return (
    <div
      className="flex flex-col items-center bg-slate-800/40 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 hover:scale-105 hover:border-yellow-300/30 transition-all duration-300 cursor-pointer w-full"
      onClick={onClick}
    >
      <img
        src={icon}
        alt={title}
        className="w-12 h-12 mb-3 filter brightness-0 invert"
      />
      <span className="text-3xl font-light text-white font-[Lexend]">
        {count ?? 0}
      </span>
      <span className="text-lg font-light text-white mt-2 font-[Lexend] text-center">
        {title}
      </span>
      <span className="text-sm text-white/70 font-[Lexend] font-light text-center">
        {count ?? 0} {subtitle}
      </span>
      <button
        className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg font-[Lexend] font-light"
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
      >
        {button}
      </button>
    </div>
  );
}
