import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/sidebar';
import Header from '../common/header';

const ACTIVE_PROJECT_STORAGE_KEY = 'activeProjectId';

const IntegratedLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);

    sessionStorage.clear();

    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="integrated-layout">
      <Sidebar onLogout={handleLogout} />

      <div className="integrated-main">
        <Header
          user={{
            name: 'Student',
            role: 'Student',
          }}
          onProfileClick={handleProfileClick}
        />

        <main className="integrated-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default IntegratedLayout;