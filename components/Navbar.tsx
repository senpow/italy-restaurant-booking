import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { Utensils, Menu, X, User, LogOut, ShieldCheck, ShoppingCart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
    }
  };

  return (
    <nav className="bg-italian-green text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-italian-white" />
              <span className="font-serif text-xl font-bold tracking-wider">Bella Vista</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="hover:bg-italian-red px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Startseite
              </Link>
              <Link to="/menu" className="hover:bg-italian-red px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Speisekarte
              </Link>
              <Link to="/reservation" className="bg-italian-white text-italian-green hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-bold transition-colors shadow-md">
                Tisch Reservieren
              </Link>

              <Link to="/cart" className="relative hover:bg-italian-red px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-italian-green text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin Link */}
              {isAdmin && (
                <Link to="/admin/dashboard" className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-gray-700">
                  <ShieldCheck className="w-4 h-4 text-yellow-500" />
                  <span>Admin</span>
                </Link>
              )}

              {currentUser ? (
                <>
                  <Link to="/dashboard" className="hover:bg-italian-red px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Meine Reservierungen
                  </Link>
                  <button onClick={handleLogout} className="flex items-center space-x-1 hover:bg-italian-red px-3 py-2 rounded-md text-sm font-medium transition-colors border border-white/30">
                    <LogOut className="w-4 h-4" />
                    <span>Abmelden</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 hover:bg-italian-red px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <User className="w-4 h-4" />
                  <span>Anmelden</span>
                </Link>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-italian-red focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-italian-green pb-3">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block hover:bg-italian-red px-3 py-2 rounded-md text-base font-medium">
              Startseite
            </Link>
            <Link to="/menu" onClick={() => setIsOpen(false)} className="block hover:bg-italian-red px-3 py-2 rounded-md text-base font-medium">
              Speisekarte
            </Link>
            <Link to="/reservation" onClick={() => setIsOpen(false)} className="block bg-italian-white text-italian-green px-3 py-2 rounded-md text-base font-bold">
              Tisch Reservieren
            </Link>
            <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 hover:bg-italian-red px-3 py-2 rounded-md text-base font-medium">
              <ShoppingCart className="w-5 h-5" />
              <span>Warenkorb ({cartCount})</span>
            </Link>

            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 bg-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                <ShieldCheck className="w-4 h-4 text-yellow-500" />
                <span>Admin Bereich</span>
              </Link>
            )}

            {currentUser ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block hover:bg-italian-red px-3 py-2 rounded-md text-base font-medium">
                  Meine Reservierungen
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left block hover:bg-italian-red px-3 py-2 rounded-md text-base font-medium">
                  Abmelden
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block hover:bg-italian-red px-3 py-2 rounded-md text-base font-medium">
                Anmelden
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};