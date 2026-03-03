import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import NotFound from "./pages/NotFound/NotFound";
import AuthLayout from "./components/Layout/AuthLayout/AuthLayout";
import MainLayout from "./components/Layout/MainLayout/MainLayout";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ProtectedAuthRoute from "./components/ProtectedAuthRoute/ProtectedAuthRoute";
import CounterContextProvider from "./contexts/counterContext";
import AuthContextProvider from "./contexts/authContext";
import Notifications from "./pages/Notifications/Notifications";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import PostDetails from "./pages/PostDetails/PostDetails";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <ProtectedAuthRoute>
            <Login />
          </ProtectedAuthRoute>
        ),
      },
      {
        path: "register",
        element: (
          <ProtectedAuthRoute>
            <Register />{" "}
          </ProtectedAuthRoute>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <Notifications/>
          </ProtectedRoute>
        ),
      },
       {
        path: "settings",
        element: (
          <ProtectedRoute>
            <ChangePassword/>
          </ProtectedRoute>
        ),
      },
      {
        path: "posts/:id",
        element: (
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default function App() {
  return (
    <AuthContextProvider>
      <CounterContextProvider>
        <HeroUIProvider>
          <ToastProvider />
          <RouterProvider router={routes} />
        </HeroUIProvider>
      </CounterContextProvider>
    </AuthContextProvider>
  );
}
