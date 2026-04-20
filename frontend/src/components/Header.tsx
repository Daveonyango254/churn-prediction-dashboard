import React from 'react';
import { Menu, Github } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-card border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-secondary rounded-md transition-colors"
        >
          <Menu size={20} className="text-foreground" />
        </button>
        
        <div className="hidden lg:block">
          <h1 className="text-sm font-medium text-foreground">Churn Prediction Dashboard</h1>
          <p className="text-xs text-muted-foreground">Real-time ML-powered customer analytics</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/Daveonyango254/churn-prediction-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
        >
          <Github size={16} />
          <span className="hidden sm:inline">View Source</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
