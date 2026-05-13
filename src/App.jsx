import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { isAllowedAdminEmail } from './config/adminAuth';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Lectures from './pages/Lectures';
import Notes from './pages/Notes';
import Projects from './pages/Projects';
import AppRegistrations from './pages/AppRegistrations';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Teachers from './pages/Teachers';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      const email = firebaseUser.email;
      const allowed = await isAllowedAdminEmail(email);
      if (!allowed) {
        setAuthError(
          'Access denied. Sign in only with the authorized admin Gmail account.'
        );
        try {
          await signOut(auth);
        } catch {
          /* ignore */
        }
        setUser(null);
        setAuthReady(true);
        return;
      }
      setAuthError(null);
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthenticated = !!user;

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login authError={authError} clearAuthError={() => setAuthError(null)} />
            )
          }
        />

        <Route
          path="/"
          element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="app-registrations" element={<AppRegistrations />} />
          <Route path="courses" element={<Courses />} />
          <Route path="lectures" element={<Lectures />} />
          <Route path="notes" element={<Notes />} />
          <Route path="live-classes" element={<Navigate to="/lectures" replace />} />
          <Route path="projects" element={<Projects />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
