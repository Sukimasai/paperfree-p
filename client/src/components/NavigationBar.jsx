import { useState, useEffect, useRef } from "react";
import NavigationItem from "./NavigationItem";
import useAuth from "../contexts/UseAuth";
import gsap from "gsap";

export default function NavigationBar() {
  const navItems = [{ text: "Home", link: "/" }];
  const userItems = [
    { text: "Documents", link: "/document" },
    { text: "Requests", link: "/requests" },
    { text: "History", link: "/history" },
    { text: "Profile", link: "/profile" },
    { text: "Logout", link: "/logout" },
  ];
  const adminItems = [
    { text: "Pending", link: "/admin/pending" },
    { text: "Logout", link: "/logout" },
  ];
  const rtAdminItems = [
    { text: "Pending", link: "/rt-admin/pending" },
    { text: "Logout", link: "/logout" },
  ];
  const kelurahanAdminItems = [
    { text: "Pending", link: "/kelurahan-admin/pending" },
    { text: "Logout", link: "/logout" },
  ];

  const [isOpen, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const deviceWidth = window.innerWidth;
  const overlayRef = useRef(null);

  useEffect(() => {
    if (overlayRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, { width: deviceWidth, duration: 0.3 });
        gsap.to(".bar1", { x: 0, y: 12, rotation: -45, duration: 0.5 });
        gsap.to(".bar2", { opacity: 0, duration: 0.5 });
        gsap.to(".bar3", { x: 0, y: -12, rotation: 45, duration: 0.5 });
      } else {
        gsap.to(overlayRef.current, { width: 0, duration: 0.3 });
        gsap.to(".bar1", { x: 0, y: 0, rotation: 0, duration: 0.5 });
        gsap.to(".bar2", { opacity: 1, duration: 0.5 });
        gsap.to(".bar3", { x: 0, y: 0, rotation: 0, duration: 0.5 });
      }
    }
  }, [isOpen, deviceWidth]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  let roleNavItems = userItems;
  switch (user.role) {
    case "admin":
      roleNavItems = adminItems;
      break;
    case "rt_admin":
      roleNavItems = rtAdminItems;
      break;
    case "kelurahan_admin":
      roleNavItems = kelurahanAdminItems;
      break;
    default:
      roleNavItems = userItems;
      break;
  }

  const totalNavItems = [...navItems, ...roleNavItems];
  return (
    <>
      <div
        className="cursor-pointer flex flex-col items-end justify-center z-[100] relative ml-4"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <div className="w-8 h-1 my-1 rounded-full bg-white bar1"></div>
        <div className="w-8 h-1 my-1 rounded-full bg-white bar2"></div>
        <div className="w-8 h-1 my-1 rounded-full bg-white bar3"></div>
      </div>
      <nav
        ref={overlayRef}
        className="nav-overlay fixed top-0 right-0 flex flex-col items-center justify-center h-screen overflow-hidden text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 backdrop-blur-md transition-all duration-300 z-[50]"
        style={{ width: isOpen ? deviceWidth : 0 }}
      >
        <ul className="space-y-8">
          {totalNavItems.map((item) => (
            <li key={item.link} className="list-none">
              <NavigationItem text={item.text} link={item.link} />
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
