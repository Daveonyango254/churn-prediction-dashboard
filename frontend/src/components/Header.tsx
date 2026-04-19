import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-secondary-bg border-b border-border-color px-4 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-hover-bg rounded-lg transition-colors"
        >
          <Menu size={24} className="text-text-primary" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md items-center bg-tertiary-bg border border-border-color rounded-lg px-3 py-2 gap-2">
          <Search size={18} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search customers, metrics..."
            className="bg-transparent border-none outline-none flex-1 text-text-primary placeholder-text-secondary text-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-hover-bg rounded-lg transition-colors relative">
          <Bell size={20} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-hover-bg rounded-lg transition-colors">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-text-primary">Admin</span>
            <span className="text-xs text-text-secondary">Premium</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
