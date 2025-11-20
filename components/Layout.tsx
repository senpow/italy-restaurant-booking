import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-italian-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif text-xl mb-2">Trattoria Bella Vista</p>
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Alle Rechte vorbehalten.</p>
          <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
             <span>Impressum</span>
             <span>Datenschutz</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
