import { useState } from "react";

export default function PasswordInput({
  value,
  onChange,
  className = "",
  ...props
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`pr-12 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 focus:outline-none hover:bg-slate-600/30 rounded-lg transition-colors duration-200"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        <img
          src={show ? "/noeye.png" : "/eye.png"}
          alt={show ? "Hide" : "Show"}
          className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity duration-200 filter brightness-0 invert"
        />
      </button>
    </div>
  );
}
