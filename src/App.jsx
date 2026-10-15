import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BookManagementPage from './pages/BookManagementPage';
import BookDetailsPage from './pages/BookDetailsPage';
import MemberManagementPage from './pages/MemberManagementPage';
import MemberProfilePage from './pages/MemberProfilePage';
import CirculationPage from './pages/CirculationPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <Routes>
            {/* Module 1: Authentication Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthPage key="login" mode="login" />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <AuthPage key="register" mode="register" />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <AuthPage key="forgot" mode="forgot" />
                </PublicRoute>
              }
            />

            {/* Module 2: Protected Dynamic Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Module 3: Protected Book Management & Book Details Routes */}
            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <BookManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/:id"
              element={
                <ProtectedRoute>
                  <BookDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Module 4: Protected Member Management & Member Profile Routes */}
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MemberManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <ProtectedRoute>
                  <MemberProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Module 5: Protected Circulation & Issue/Return Route */}
            <Route
              path="/circulation"
              element={
                <ProtectedRoute>
                  <CirculationPage />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3200}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
