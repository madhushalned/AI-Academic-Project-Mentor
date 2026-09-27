import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

const IntegratedLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('student');
  };

  return (
    <div className="integrated-layout">
      <Sidebar onLogout={handleLogout} />

      <div className="integrated-main">
        <Header
          user={{
            name: 'Student',
            role: 'Student'
          }}
          onProfileClick={() => navigate('/profile')}
        />

        <main className="integrated-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default IntegratedLayout;
