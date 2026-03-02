import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, User, Menu, X, LogOut } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              VERME.
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm tracking-wide transition-colors ${
                    isActive(link.path)
                      ? 'text-black font-medium'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <>
                  <Link to="/wishlist" className="hover:opacity-70 transition-opacity">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link to="/cart" className="hover:opacity-70 transition-opacity">
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  {user?.role === 'admin' && (
                    <Link to="/admin">
                      <button className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
                        Admin
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-xs px-3 py-1 hover:bg-gray-100 rounded flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex text-xs px-3 py-1 hover:bg-gray-100 rounded items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}

              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 px-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm tracking-wide ${
                    isActive(link.path) ? 'text-black font-medium' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-wide text-gray-600"
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm tracking-wide text-gray-600 text-left"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-wide text-gray-600"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold tracking-tight mb-2">VERME.</h3>
              <p className="text-sm text-gray-500">Minimal. Modern. Timeless.</p>
            </div>

            <div className="flex gap-6 text-sm text-gray-600">
              <a href__="#" className="hover:text-black transition-colors">Instagram</a>
              <a href__="#" className="hover:text-black transition-colors">Twitter</a>
              <a href__="#" className="hover:text-black transition-colors">Facebook</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            © 2025 Verme. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}