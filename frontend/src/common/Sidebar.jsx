import React from 'react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  
  {
    label: 'Milestones',
    route: '/milestones',
    icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9'
  },
  {
    label: 'Documents',
    route: '/documents',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    label: 'Profile',
    route: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }
];

const Sidebar = ({ onLogout }) => {
  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div>
        <div style={styles.brandContainer}>
          <h1 style={styles.brandTitle}>
            <span>AI Academic</span>
            <span style={styles.brandSubtitle}>
              Project Mentor
            </span>
          </h1>
        </div>

        {/* Navigation */}
        <nav style={styles.navGroup} aria-label="Main navigation">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === 0;

            return (
              <button
                key={item.route}
                type="button"
                style={{
                  ...styles.navButton,
                  backgroundColor: isActive
                    ? '#eff6ff'
                    : 'transparent',
                  color: isActive
                    ? '#2563eb'
                    : '#64748b'
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={isActive ? '#2563eb' : '#94a3b8'}
                >
                  <path
                    d={item.icon}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div style={styles.logoutWrapper}>
        <button
          type="button"
          onClick={onLogout}
          style={styles.logoutButton}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#94a3b8"
          >
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0
  },

  brandContainer: {
    height: '64px',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0'
  },

  brandTitle: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    color: '#1d4ed8',
    fontSize: '15px',
    fontWeight: '700',
    lineHeight: '1.2'
  },

  brandSubtitle: {
    color: '#2563eb',
    fontWeight: '500'
  },

  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px'
  },

  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  logoutWrapper: {
    padding: '16px',
    borderTop: '1px solid #f1f5f9'
  },

  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }
};

export default Sidebar;
