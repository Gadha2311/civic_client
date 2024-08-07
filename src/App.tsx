import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import Sidebar from "./components/adminsidebar/adminSidebar";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import ResetPassword from "./pages/resetpassword/resetpassword";
import AdminLogin from "./admin/AdminLogin/adminLogin";
import AdminUserlist from "./admin/AdminUserlist/adminUserlist";
import "./App.css";
import Profile from "./pages/profile/profile";
import Search from "./pages/search/search";
import UserProfile from "./pages/userprofile/userprofile";

const queryClient = new QueryClient();

function App() {
  return (
    <AdminAuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <AuthRoute>
                  <ResetPassword />
                </AuthRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
          <AdminRoutes />
        </Router>
      </QueryClientProvider>
    </AdminAuthProvider>
  );
}

function AdminRoutes() {
  const { isAdminAuthenticated } = useAdminAuth();

  return (
    <Routes>
      <Route
        path="/adminLogin"
        element={
          !isAdminAuthenticated ? <AdminLogin /> : <Navigate to="/dashbord" />
        }
      />
      <Route
        path="/dashbord"
        element={
          isAdminAuthenticated ? <Sidebar /> : <Navigate to="/adminLogin" />
        }
      />
      <Route
        path="/userlist"
        element={
          isAdminAuthenticated ? (
            <AdminUserlist />
          ) : (
            <Navigate to="/adminLogin" />
          )
        }
      />
    </Routes>
  );
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/home" /> : children;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
