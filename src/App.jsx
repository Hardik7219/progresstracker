import React, { useState, useCallback,useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import ProgressAnalytics from './components/ProgressAnalytics';
import PhotoJournal from './components/PhotoJournal';
import ExportData from './components/ExportData';
import ThemeToggle from './components/ThemeToggle';
import { getSettings, updateSettings } from './services/storageService';

export default function App() {
    const [page, setPage] = useState('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const settings = getSettings();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [theme, setTheme] = useState(settings.theme || 'dark');
    const [sidebar,setSidebar]=useState(false)
    // Apply theme
    
    document.documentElement.setAttribute('data-theme', theme);
    useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);
    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        updateSettings({ theme: next });
    }

    const triggerRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    function renderPage() {
        switch (page) {
            case 'dashboard':
                return <Dashboard onNavigate={setPage} refreshKey={refreshKey} />;
            case 'tasks':
                return <TaskManager onRefresh={triggerRefresh} />;
            case 'analytics':
                return <ProgressAnalytics refreshKey={refreshKey} />;
            case 'photos':
                return <PhotoJournal onRefresh={triggerRefresh} refreshKey={refreshKey} />;
            case 'export':
                return <ExportData onRefresh={triggerRefresh} />;
            default:
                return <Dashboard onNavigate={setPage} refreshKey={refreshKey} />;
        }
    }

    return (
        <div className="app-layout">
            <Sidebar
            active={page}
            open={sidebarOpen}
            isMobile={isMobile}
            onNavigate={(p)=>{
            setPage(p)
            if(isMobile) setSidebarOpen(false)
            }}
            onClose={()=>setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={()=>setSidebarCollapsed(!sidebarCollapsed)}
            />
            {isMobile && sidebarOpen && (
            <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={()=>setSidebarOpen(false)}
            ></div>
            )}
            <main className="main-content">
                <header className="top-bar flex items-center px-4">

                {isMobile && (
                <button
                className="text-2xl mr-3"
                onClick={()=>setSidebarOpen(true)}
                >
                ☰
                </button>
                )}

                <div className="flex-1"></div>

                <ThemeToggle theme={theme} onToggle={toggleTheme} />

                </header>
                <div className="page-content">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}
