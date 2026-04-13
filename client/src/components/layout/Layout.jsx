import React, { useState } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
    const navigate = useNavigate();
    const [sidebar, setSidebar] = useState(false);
    const { user, loading } = useAuth();

    // Show a loading state while AuthContext verifies the JWT in local storage
    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#F4F7FB]'>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Fallback protection: If no user is found, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className='flex flex-col items-start justify-start h-screen overflow-hidden bg-white'>
            {/* Top Navigation Bar (Mobile Toggle & Logo) */}
            <nav className='w-full px-8 py-4 min-h-16 flex items-center justify-between border-b border-gray-200 bg-white z-50 relative'>
                <img 
                    src={assets.logo} 
                    alt="QuickAi Logo" 
                    onClick={() => navigate('/')} 
                    className='cursor-pointer w-32 sm:w-44 transition-transform hover:scale-105' 
                />
                
                {/* Mobile Menu Toggle */}
                <div className='sm:hidden cursor-pointer p-1 rounded-md hover:bg-gray-100 transition-colors'>
                    {sidebar ? (
                        <X className='w-6 h-6 text-gray-700' onClick={() => setSidebar(false)} />
                    ) : (
                        <Menu className='w-6 h-6 text-gray-700' onClick={() => setSidebar(true)} />
                    )}
                </div>
            </nav>

            {/* Main Application Area */}
            <div className='flex-1 w-full flex h-[calc(100vh-64px)] relative'>
                {/* Fixed Sidebar */}
                <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
                
                {/* Dynamic Main Canvas (Where the AI Tools Render) */}
                <div className='flex-1 bg-[#F4F7FB] overflow-y-auto w-full relative'>
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;