import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function DashboardLayout({ currentPage, onNavigate, title, subtitle, children }) {
  return (
    <div className="layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="layout-main">
        <Topbar title={title} subtitle={subtitle} />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
