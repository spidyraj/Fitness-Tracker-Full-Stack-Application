import React from 'react';
import TopNav from './TopNav';
import ChatbotWidget from './ChatbotWidget';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout-root">
      <TopNav />
      <main className="app-layout-main">
        {children}
      </main>
      <ChatbotWidget />
    </div>
  );
};

export default AppLayout;
