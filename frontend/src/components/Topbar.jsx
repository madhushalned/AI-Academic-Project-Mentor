import Icon from "./Icon.jsx";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <div className="topbar-search">
          <Icon name="search" size={18} />
          <input type="text" placeholder="Search..." />
        </div>
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Icon name="bell" size={20} />
          <span className="topbar-badge" />
        </button>
        <div className="topbar-avatar">AR</div>
      </div>
    </header>
  );
}
