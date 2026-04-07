// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';
import { ThemeProvider } from './context/ThemeContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { LoadingSpinner } from './components';

// Simple ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Initializing TaskFlow..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      {!user && (
        <>
          <Route path="/signup" element={<Register />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/" element={<Navigate to="/signin" replace />} />
        </>
      )}

      {/* Protected Routes */}
      {user && (
        <>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        </>
      )}

      {/* 404 Route */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/signin'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <TasksProvider>
            <AppContent />
          </TasksProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
