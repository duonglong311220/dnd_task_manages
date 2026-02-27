import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <Sidebar />

            {/* Main Content Area */}
            <main className="ml-64 pt-14 min-h-screen">
                <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
