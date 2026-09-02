import Icon from "../components/Icon.jsx";

export default function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon"><Icon name="dashboard" size={48} /></div>
      <h2>{title}</h2>
      <p>This module is part of the full AcadTracker suite. It will be available in a future update.</p>
    </div>
  );
}
