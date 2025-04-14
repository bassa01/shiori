"use client";

import React from 'react';
import Link from 'next/link';
import { FiHome, FiPlus, FiMap, FiCalendar, FiMenu, FiX } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Modern header with gradient background */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-white flex items-center gap-2 transition-all duration-300 transform hover:scale-105">
            <FiMap className="text-3xl" />
            <span className="font-sans">しおり</span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6 items-center">
              <li>
                <Link href="/" className="flex items-center gap-2 hover:text-white py-2 px-3 rounded-lg transition-all duration-300 hover:bg-white/10">
                  <FiHome />
                  <span>ホーム</span>
                </Link>
              </li>
              <li>
                <Link href="/create" className="flex items-center gap-2 bg-white text-indigo-600 font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105">
                  <FiPlus />
                  <span>新規作成</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
            <ul className="flex flex-col space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 hover:bg-white/10 p-3 rounded-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiHome />
                  <span>ホーム</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/create" 
                  className="flex items-center gap-2 bg-white text-indigo-600 font-medium p-3 rounded-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiPlus />
                  <span>新規作成</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
      
      {/* Main content with subtle background pattern */}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[80vh]">
          {children}
        </div>
      </main>
      
      {/* Modern footer with gradient */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 mt-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <FiMap className="text-2xl text-indigo-400" />
              <span className="font-bold text-xl">しおり</span>
            </div>
            <p className="text-gray-300">© {new Date().getFullYear()} しおり - 旅のしおりを作るアプリ</p>
            <div className="flex gap-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300">
                <FiHome className="text-xl" />
              </Link>
              <Link href="/create" className="text-gray-300 hover:text-white transition-colors duration-300">
                <FiCalendar className="text-xl" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
