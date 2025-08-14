import React, { useState, useCallback, memo } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';


// Memoized components
const MemoizedNavbar = memo(Navbar);
const MemoizedSidebar = memo(Sidebar);
const MemoizedFooter = memo(Footer);

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Event listener deviceStatusChange sudah ditangani di socketService.js
  // Tidak perlu duplikasi di sini untuk menghindari toast ganda

  // Memoized toggle function
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <MemoizedNavbar toggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <MemoizedSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <main className="flex-1 p-6 mt-16 overflow-auto">
          <Outlet />
        </main>
        
        {/* Footer */}
        <MemoizedFooter />
      </div>
      

    </div>
  );
};

// Prevent unnecessary re-renders
export default memo(MainLayout);