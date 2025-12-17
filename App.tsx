import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Feed } from './pages/Feed';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './services/authContext';
import { Home, Upload, User, LogOut } from 'lucide-react';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isVideoFeed = location.pathname === '/';

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-black relative shadow-2xl overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-around items-center z-50 pb-2">
        <Link to="/" className={`p-2 ${isVideoFeed ? 'text-white' : 'text-gray-500'}`}>
          <Home size={28} strokeWidth={isVideoFeed ? 3 : 2} />
        </Link>
        
        {user ? (
          <>
            <Link to="/admin" className={`p-2 ${location.pathname === '/admin' ? 'text-white' : 'text-gray-500'}`}>
              <Upload size={28} />
            </Link>
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500">
              <LogOut size={28} />
            </button>
          </>
        ) : (
          <Link to="/login" className={`p-2 ${location.pathname === '/login' ? 'text-white' : 'text-gray-500'}`}>
            <User size={28} />
          </Link>
        )}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}