import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-64 h-full" onClick={e => e.stopPropagation()}>
            <Sidebar isCollapsed={false} setIsCollapsed={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        <footer className="p-6 text-center text-gray-500 text-sm border-t border-gray-100">
          &copy; {new Date().getFullYear()} NEXTSTEP AI Solutions. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
