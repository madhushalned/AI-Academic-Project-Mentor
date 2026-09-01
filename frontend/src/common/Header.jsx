import React from 'react';

const Header = ({ user = { name: 'Student', role: 'Student' }, onProfileClick }) => {
 return (
<header style={styles.header}>
 {/* Search / Left Spacer */}
 <div></div>

 {/* Right Controls */}
 <div style={styles.rightControls}>
{/* Bell Icon */}
<button style={styles.iconButton}>
 <svg width="20" height="20" fill="none" stroke="#64748b" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
 </svg>
</button>

{/* User Badge */}
<div style={styles.profileBadge} onClick={onProfileClick}>
 <div style={styles.avatar}>
{user.name ? user.name.charAt(0) : 'S'}
 </div>
 <span style={styles.roleText}>{user.role || 'Student'}</span>
 <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
 </svg>
</div>
 </div>
</header>
 );
};

const styles = {
 header: {
height: '64px',
backgroundColor: '#ffffff',
borderBottom: '1px solid #e2e8f0',
padding: '0 32px',
display: 'flex',
alignItems: 'center',
justifyContent: 'space-between',
position: 'sticky',
top: 0,
zIndex: 10
 },
 rightControls: {
display: 'flex',
alignItems: 'center',
gap: '16px'
 },
 iconButton: {
background: 'none',
border: 'none',
cursor: 'pointer',
padding: '8px',
borderRadius: '50%',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
 },
 profileBadge: {
display: 'flex',
alignItems: 'center',
gap: '10px',
cursor: 'pointer',
padding: '4px 8px',
borderRadius: '8px'
 },
 avatar: {
width: '32px',
height: '32px',
borderRadius: '50%',
backgroundColor: '#2563eb',
color: '#ffffff',
fontWeight: '600',
fontSize: '14px',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
 },
 roleText: {
fontSize: '14px',
 fontWeight: '500',
 color: '#334155'
 }
};

export default Header;