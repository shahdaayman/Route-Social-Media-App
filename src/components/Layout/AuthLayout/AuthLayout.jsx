import { Outlet, useNavigate, useLocation } from "react-router-dom";
import StatBox from "../../StatBox/StatBox";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full">

        {/*===================== LEFT SECTION ===================*/}
          <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Route Posts
          </h1>

          <p className="text-lg text-gray-700 mb-8 max-w-md">
            Connect with friends and the world around you on Route Posts.
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 tracking-widest mb-2">
              ABOUT ROUTE ACADEMY
            </h3>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Egypt's Leading IT Training Center Since 2012
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Route Academy is the premier IT training center in Egypt, established in 2012.
              We specialize in delivering high-quality training courses in programming,
              web development, and application development. We've identified the unique
              challenges people may face when learning new technology and made efforts
              to provide strategies to overcome them.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatBox number="2012" label="FOUNDED" />
              <StatBox number="40K+" label="GRADUATES" />
              <StatBox number="50+" label="PARTNER COMPANIES" />
              <StatBox number="5" label="BRANCHES" />
              <StatBox number="20" label="DIPLOMAS AVAILABLE" />
            </div>
          </div>
        </div>

        {/*================== RIGHT SECTION ====================*/}
        <div className="bg-gray-50 rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto self-center">
          <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
            <button
              onClick={() => navigate("/login")}
              className={`flex-1 py-2 rounded-xl font-semibold ${
                isLogin ? "bg-white shadow text-blue-900" : "text-gray-600"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className={`flex-1 py-2 rounded-xl font-semibold ${
                isRegister ? "bg-white shadow text-blue-900" : "text-gray-600"
              }`}
            >
              Register
            </button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}