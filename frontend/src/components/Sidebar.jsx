import Icon from "./Icon.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "skill-assessment", label: "Skill Assessment", icon: "skill" },
  { id: "milestones", label: "Milestone Management", icon: "milestone" },
  { id: "timeline", label: "Timeline Management", icon: "timeline" },
  { id: "project", label: "Project", icon: "project", placeholder: true },
  { id: "progress", label: "Progress", icon: "progress", placeholder: true },
  { id: "mentor", label: "AI Mentor", icon: "mentor", placeholder: true },
  { id: "reports", label: "Reports", icon: "reports", placeholder: true },
  { id: "settings", label: "Settings", icon: "settings", placeholder: true },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon"><Icon name="logo" size={22} /></span>
        <span className="sidebar-brand-text">AcadTracker</span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section">Main</p>
        {navItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}

        <p className="sidebar-section">More</p>
        {navItems.slice(4).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">AR</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">Aisha Rahman</p>
            <p className="sidebar-user-role">Student</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
