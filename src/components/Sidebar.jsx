import React from 'react';
import {
    LayoutDashboard,
    CheckSquare,
    BarChart3,
    Camera,
    Download,
    Flame,
    Hand,
    Bell,
    User
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {id: 'friend', label : 'Friend' , icon :Hand},
    {id:'notification', label: 'Notification' , icon : Bell},
    { id: 'photos', label: 'Photo Journal', icon: Camera },
    { id: 'export', label: 'Export', icon: Download },
    {id:'profile', label: 'Profile', icon : User}
];

export default function Sidebar({
active,
onNavigate,
collapsed,
onToggleCollapse,
open,
isMobile,
onClose
}) {
    return (
        <aside
        className={`sidebar
        ${collapsed ? 'sidebar--collapsed' : ''}
        ${isMobile ? 'sidebar-mobile' : ''}
        ${isMobile && open ? 'sidebar-mobile-open' : ''}`
        }
        >
            <div className="sidebar-brand" onClick={() => {
            onNavigate(id)
            if(isMobile && onClose) onClose()
            }}>
                <Flame size={28} className="brand-icon" />
                {!collapsed && <span className="brand-text">Progress<span className="brand-accent">Tracker</span></span>}
            </div>
            {isMobile && (
            <button className="sidebar-close-btn" onClick={onClose}>
            </button>
            )}
            <nav className="sidebar-nav">
                {navItems.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`nav-item ${active === id ? 'nav-item--active' : ''}`}
                        onClick={() => onNavigate(id)}
                        title={label}
                    >
                        <Icon size={20} />
                        {!collapsed && <span>{label}</span>}
                    </button>
                ))}
            </nav>
            <button className="sidebar-collapse-btn" onClick={onToggleCollapse}>
                {collapsed ? '→' : '←'}
            </button>
        </aside>
    );
}
