import React from 'react';
// Changed import from 'react-router-dom' to 'react-router' to fix missing export errors
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router';
import { Feed } from './pages/Feed';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Channel } from './pages/Channel';
import { Discover } from './pages/Discover';
import { Profile } from './pages/Profile';
import { MyAccount } from './pages/MyAccount';
import { Subscriptions } from './pages/Subscriptions';
import { AuthProvider, useAuth } from './services/authContext';
import { Home, Search, User, Upload } from 'lucide-react';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isHome = location.pathname === '/';
  const isDiscover = location.pathname === '/discover';
  const isMe = location.pathname.startsWith('/profile');

  // Hide bottom nav on specific sub-pages to give more screen real estate, or keep it. 
  // Based on standard UX, we usually keep it unless it's a deep setting page. 
  // For this request, we keep it simple.

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-white relative shadow-2xl overflow-hidden text-black">
      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-white">
        {children}
      </main>

      {/* Bottom Navigation - Always Light Mode */}
      <nav className="absolute bottom-0 left-0 w-full h-16 flex justify-around items-center z-50 pb-2 bg-white border-t border-gray-100 text-black">
        <Link to="/" className={`flex flex-col items-center p-2 transition-opacity ${isHome ? 'opacity-100 text-black' : 'opacity-40 hover:opacity-100'}`}>
          <Home size={24} strokeWidth={isHome ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>

        <Link to="/discover" className={`flex flex-col items-center p-2 transition-opacity ${isDiscover ? 'opacity-100 text-black' : 'opacity-40 hover:opacity-100'}`}>
          <Search size={24} strokeWidth={isDiscover ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-0.5">Discover</span>
        </Link>
        
        {user?.isAdmin && (
           <Link to="/admin" className={`flex flex-col items-center p-2 transition-opacity ${location.pathname === '/admin' ? 'opacity-100 text-black' : 'opacity-40 hover:opacity-100'}`}>
            <Upload size={24} strokeWidth={location.pathname === '/admin' ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-0.5">Upload</span>
          </Link>
        )}

        <Link to={user ? "/profile" : "/login"} className={`flex flex-col items-center p-2 transition-opacity ${isMe ? 'opacity-100 text-black' : 'opacity-40 hover:opacity-100'}`}>
          <User size={24} strokeWidth={isMe ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-0.5">Me</span>
        </Link>
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
            <Route path="/discover" element={<Discover />} />
            <Route path="/login" element={<Login />} />
            <Route path="/channel/:userId" element={<Channel />} />
            
            {/* Protected User Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/profile/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />

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