import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Sliders, X, Activity, Database, ExternalLink } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/', id: 'dashboard' },
    { label: 'Predictor Workbench', icon: Sliders, path: '/predictor', id: 'predictor' },
    { label: 'Data Source', icon: Database, path: '/data-source', id: 'data-source' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-200 z-50 lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Activity size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">ChurnPulse</h2>
                <p className="text-xs text-muted-foreground">ML Analytics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-secondary rounded-md transition-colors"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                      active
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <a 
            href="https://david-portfolio.xyz/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 rounded-md p-3 transition-colors"
          >
            <ExternalLink size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">View Portfolio</span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
