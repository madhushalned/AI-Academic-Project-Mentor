export default function SkillCard({ category }) {
  return (
    <div className="skill-card">
      <h3 className="skill-card-title">{category.name}</h3>
      <div className="skill-card-list">
        {category.skills.map((s) => (
          <div key={s.name} className="skill-item">
            <div className="skill-item-head">
              <span className="skill-item-name">{s.name}</span>
              <span className="skill-item-level">{s.level}%</span>
            </div>
            <div className="skill-bar">
              <div className="skill-bar-fill" style={{ width: `${s.level}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
