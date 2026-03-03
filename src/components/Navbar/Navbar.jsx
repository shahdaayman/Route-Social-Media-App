import { Home, User, Bell, Menu, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import routeImg from "../../assets/image.png";
import profilePic from "../../assets/image2.png";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { authContext } from "../../contexts/authContext";

export default function Navbar() {
  const baseStyle = "flex items-center gap-2 font-medium transition";

  const activeStyle = "text-blue-600";
  const inactiveStyle = "text-gray-600 hover:text-blue-600";
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { setUserToken } = useContext(authContext);

  function logout() {
    localStorage.removeItem("token");
    setUserToken(null);
    navigate("/login");
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-50 fixed">
      {/*===================== Left Section====================*/}
      <Link to={"/home"}>
        <div className="flex items-center gap-3 justify-center">
          <div>
            <img src={routeImg} alt="" className="w-10 rounded-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Route Posts</h1>
        </div>
      </Link>

      {/*=======================Center Section=========================*/}
      <div className="hidden md:flex items-center gap-8 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-200">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          <Home size={18} />
          Feed
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          <User size={18} />
          Profile
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          <Bell size={18} />
          Notifications
        </NavLink>
      </div>

      {/*========================= Right Section======================*/}
      <div className="relative z-50" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 bg-white px-4 py-3 rounded-4xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
        >
          <img
            src={profilePic}
            alt="profile picture"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-700 font-medium hidden sm:block">
            shahd ayman
          </span>
          <Menu size={18} className="text-gray-500" />
        </div>

        {/*===================== Dropdown Menu========================= */}
        {open && (
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 p-3">
            <Link to={"/profile"}>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <User size={18} />
                Profile
              </button>
            </Link>

            <Link to="/settings">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <Settings size={18} />
                Settings
              </button>
            </Link>

            <hr className="my-3 border-gray-200" />

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition"
              onClick={logout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
