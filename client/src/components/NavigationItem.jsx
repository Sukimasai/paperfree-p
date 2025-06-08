export default function NavigationItem({ text, link }) {
  return (
    <div className="NavigationItem">
      <a
        href={link}
        className="relative group text-white text-3xl font-[Lexend] font-light hover:text-green-300 transition-colors duration-300"
      >
        {text}
        <span
          className="absolute left-0 bottom-0 h-[2px] w-full bg-green-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          aria-hidden="true"
        />
      </a>
    </div>
  );
}
