import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const ACTIVE_PROJECT_STORAGE_KEY = 'activeProjectId';

const IntegratedLayout = ({ children }) => {
  const navigate = useNavigate();

  const student = React.useMemo(() => {
    try {
      const raw =
        localStorage.getItem('student') ||
        sessionStorage.getItem('student');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

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
            name: student?.name || 'Student',
            role: 'Student',
            profile_picture: student?.profile_picture || null,
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