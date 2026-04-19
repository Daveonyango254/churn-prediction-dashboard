import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Settings,
  Menu,
  X,
  Home,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/', id: 'dashboard' },
    { label: 'Customers', icon: Users, path: '/customers', id: 'customers' },
    { label: 'Analytics', icon: TrendingUp, path: '/analytics', id: 'analytics' },
    { label: 'Predictor', icon: Zap, path: '/predictor', id: 'predictor' },
    { label: 'Admin', icon: Shield, path: '/admin', id: 'admin' },
    { label: 'Settings', icon: Settings, path: '/settings', id: 'settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-50 lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Churn Pro</h2>
                <p className="text-xs text-muted-foreground">Analytics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon
                  size={20}
                  className={active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}
                />
                <span className="font-medium">{item.label}</span>
                {active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Premium Plan</p>
            <p className="text-sm font-semibold text-primary mt-1">Active</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
