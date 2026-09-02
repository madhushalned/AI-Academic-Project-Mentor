import { useState } from "react";
import SkillCard from "../components/SkillCard.jsx";
import Icon from "../components/Icon.jsx";
import { getSkills, getSkillSummary } from "../services/api.js";

export default function SkillAssessment() {
  const data = getSkills();
  const summary = getSkillSummary();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [levels, setLevels] = useState(() => {
    const init = {};
    data.categories.forEach((cat) => cat.skills.forEach((s) => { init[`${cat.name}-${s.name}`] = s.level; }));
    return init;
  });

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChange = (key, val) => {
    setLevels((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, Number(val) || 0)) }));
  };

  return (
    <div className="skill-assessment">
      <div className="skill-assessment-top">
        <div className="student-card">
          <div className="student-avatar">AR</div>
          <div className="student-info">
            <h3>{data.student.name}</h3>
            <p>{data.student.id} · {data.student.course}</p>
            <p>{data.student.year} · GPA {data.student.gpa}</p>
          </div>
        </div>

        <div className="assessment-progress-card">
          <div className="assessment-progress-head">
            <h3>Assessment Completion</h3>
            <span>{data.assessmentProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${data.assessmentProgress}%` }} />
          </div>
          <div className="assessment-actions">
            <button className={`btn ${editing ? "btn-primary" : "btn-ghost"}`} onClick={() => setEditing((e) => !e)}>
              <Icon name="edit" size={16} /> {editing ? "Editing..." : "Edit Assessment"}
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Icon name="check" size={16} /> Save Assessment
            </button>
          </div>
          {saved && (
            <div className="success-banner">
              <Icon name="check" size={18} /> Assessment saved successfully.
            </div>
          )}
        </div>
      </div>

      <div className="skill-overall">
        <div className="skill-overall-ring" style={{ "--ring-value": summary.average }}>
          <span>{summary.average}%</span>
        </div>
        <div>
          <h3>Overall Skill Summary</h3>
          <p>{summary.count} skills tracked across {data.categories.length} categories. Average proficiency: {summary.average}%.</p>
        </div>
      </div>

      <div className="skill-grid">
        {data.categories.map((cat) =>
          editing ? (
            <div key={cat.name} className="skill-card editing">
              <h3 className="skill-card-title">{cat.name}</h3>
              <div className="skill-card-list">
                {cat.skills.map((s) => {
                  const key = `${cat.name}-${s.name}`;
                  return (
                    <div key={s.name} className="skill-item">
                      <div className="skill-item-head">
                        <span className="skill-item-name">{s.name}</span>
                        <input
                          type="number"
                          className="skill-input"
                          min="0"
                          max="100"
                          value={levels[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      </div>
                      <div className="skill-bar">
                        <div className="skill-bar-fill" style={{ width: `${levels[key]}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <SkillCard key={cat.name} category={cat} />
          )
        )}
      </div>
    </div>
  );
}
