import Icon from "./Icon.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "skill-assessment", label: "Skill Assessment", icon: "skill" },
  { id: "project", label: "Project", icon: "project", placeholder: true },
  { id: "milestones", label: "Milestones", icon: "milestone" },
  { id: "timeline", label: "Timeline", icon: "timeline" },
  { id: "progress", label: "Progress", icon: "progress", placeholder: true },
  { id: "mentor", label: "AI Mentor", icon: "mentor", placeholder: true },
  { id: "reports", label: "Reports", icon: "reports", placeholder: true },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">
          <Icon name="logo" size={22} />
        </span>
        <span className="sidebar-brand-text">AcadTracker</span>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section">Main</p>

        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${
              currentPage === item.id ? "active" : ""
            }`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-user"
          onClick={() => onNavigate("student-profile")}
          title="Open Student Profile"
        >
          <div className="sidebar-avatar">M</div>

          <div className="sidebar-user-info">
            <p className="sidebar-user-name">Madhu</p>
            <p className="sidebar-user-role">Student</p>
          </div>
        </button>

        <button
          className={`nav-item ${
            currentPage === "settings" ? "active" : ""
          }`}
          onClick={() => onNavigate("settings")}
        >
          <Icon name="settings" size={18} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}