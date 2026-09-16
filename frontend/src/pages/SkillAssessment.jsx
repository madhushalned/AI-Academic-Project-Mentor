// import { useState } from "react";
// import SkillCard from "../components/SkillCard.jsx";
// import Icon from "../components/Icon.jsx";
// import { getSkills, getSkillSummary } from "../services/api.js";

// export default function SkillAssessment() {
//   const data = getSkills();
//   const summary = getSkillSummary();
//   const [editing, setEditing] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [levels, setLevels] = useState(() => {
//     const init = {};
//     data.categories.forEach((cat) => cat.skills.forEach((s) => { init[`${cat.name}-${s.name}`] = s.level; }));
//     return init;
//   });

//   const handleSave = () => {
//     setEditing(false);
//     setSaved(true);
//     setTimeout(() => setSaved(false), 2500);
//   };

//   const handleChange = (key, val) => {
//     setLevels((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, Number(val) || 0)) }));
//   };

//   return (
//     <div className="skill-assessment">
//       <div className="skill-assessment-top">
//         <div className="student-card">
//           <div className="student-avatar">AR</div>
//           <div className="student-info">
//             <h3>{data.student.name}</h3>
//             <p>{data.student.id} · {data.student.course}</p>
//             <p>{data.student.year} · GPA {data.student.gpa}</p>
//           </div>
//         </div>

//         <div className="assessment-progress-card">
//           <div className="assessment-progress-head">
//             <h3>Assessment Completion</h3>
//             <span>{data.assessmentProgress}%</span>
//           </div>
//           <div className="progress-bar">
//             <div className="progress-bar-fill" style={{ width: `${data.assessmentProgress}%` }} />
//           </div>
//           <div className="assessment-actions">
//             <button className={`btn ${editing ? "btn-primary" : "btn-ghost"}`} onClick={() => setEditing((e) => !e)}>
//               <Icon name="edit" size={16} /> {editing ? "Editing..." : "Edit Assessment"}
//             </button>
//             <button className="btn btn-primary" onClick={handleSave}>
//               <Icon name="check" size={16} /> Save Assessment
//             </button>
//           </div>
//           {saved && (
//             <div className="success-banner">
//               <Icon name="check" size={18} /> Assessment saved successfully.
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="skill-overall">
//         <div className="skill-overall-ring" style={{ "--ring-value": summary.average }}>
//           <span>{summary.average}%</span>
//         </div>
//         <div>
//           <h3>Overall Skill Summary</h3>
//           <p>{summary.count} skills tracked across {data.categories.length} categories. Average proficiency: {summary.average}%.</p>
//         </div>
//       </div>

//       <div className="skill-grid">
//         {data.categories.map((cat) =>
//           editing ? (
//             <div key={cat.name} className="skill-card editing">
//               <h3 className="skill-card-title">{cat.name}</h3>
//               <div className="skill-card-list">
//                 {cat.skills.map((s) => {
//                   const key = `${cat.name}-${s.name}`;
//                   return (
//                     <div key={s.name} className="skill-item">
//                       <div className="skill-item-head">
//                         <span className="skill-item-name">{s.name}</span>
//                         <input
//                           type="number"
//                           className="skill-input"
//                           min="0"
//                           max="100"
//                           value={levels[key]}
//                           onChange={(e) => handleChange(key, e.target.value)}
//                         />
//                       </div>
//                       <div className="skill-bar">
//                         <div className="skill-bar-fill" style={{ width: `${levels[key]}%` }} />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ) : (
//             <SkillCard key={cat.name} category={cat} />
//           )
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import SkillCard from "../components/SkillCard.jsx";
import Icon from "../components/Icon.jsx";
import {
  getSkillAssessment,
  updateSkillAssessment,
} from "../services/api.js";

// Temporary student ID for integration testing.
// Later this will come from the logged-in student/profile.
const STUDENT_ID = "student001";

// Skills displayed by the frontend.
// These do not require any backend schema change.
const SKILL_CATEGORIES = [
  {
    name: "Programming",
    skills: ["Python", "Java", "JavaScript"],
  },
  {
    name: "Frontend",
    skills: ["React", "HTML/CSS"],
  },
  {
    name: "Backend",
    skills: ["Node.js", "REST API"],
  },
  {
    name: "Database",
    skills: ["MongoDB", "MySQL"],
  },
];

function createInitialLevels() {
  const initialLevels = {};

  SKILL_CATEGORIES.forEach((category) => {
    category.skills.forEach((skill) => {
      initialLevels[skill] = 0;
    });
  });

  return initialLevels;
}

function normalizeSkillName(skillName) {
  return skillName
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/\//g, "");
}

function getBackendScore(scores, skillName) {
  const target = normalizeSkillName(skillName);

  const matchingKey = Object.keys(scores || {}).find(
    (key) => normalizeSkillName(key) === target
  );

  return matchingKey ? Number(scores[matchingKey]) || 0 : 0;
}

export default function SkillAssessment() {
  const [levels, setLevels] = useState(createInitialLevels);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [confidence, setConfidence] = useState("medium");
  //Newly added one
  const [originalRawScores, setOriginalRawScores] = useState({});
  const [originalNormalizedVector, setOriginalNormalizedVector] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadAssessment() {
      try {
        setLoading(true);
        setError("");

        const assessment = await getSkillAssessment(STUDENT_ID);

        if (cancelled) {
          return;
        }

        const loadedLevels = createInitialLevels();

        Object.keys(loadedLevels).forEach((skillName) => {
          const rawScore = getBackendScore(
            assessment.raw_scores,
            skillName
          );

          // Backend stores scores from 0-10.
          // UI displays scores from 0-100.
          loadedLevels[skillName] = Math.round(rawScore * 10);
        });

        setLevels(loadedLevels);
        setConfidence(assessment.confidence || "medium");
        //newly added
        setOriginalRawScores(assessment.raw_scores || {});
        setOriginalNormalizedVector(assessment.normalized_vector || {});

      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load skill assessment."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssessment();

    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    const categories = SKILL_CATEGORIES.map((category) => ({
      name: category.name,
      skills: category.skills.map((skillName) => ({
        name: skillName,
        level: levels[skillName] || 0,
      })),
    }));

    return {
      student: {
        name: "Madhu",
        id: STUDENT_ID,
        course: "Student",
        year: "",
        gpa: "",
      },
      categories,
    };
  }, [levels]);

  const summary = useMemo(() => {
    const allSkills = data.categories.flatMap(
      (category) => category.skills
    );

    const total = allSkills.reduce(
      (sum, skill) => sum + skill.level,
      0
    );

    const average =
      allSkills.length > 0
        ? Math.round(total / allSkills.length)
        : 0;

    const assessed = allSkills.filter(
      (skill) => skill.level > 0
    ).length;

    const assessmentProgress =
      allSkills.length > 0
        ? Math.round((assessed / allSkills.length) * 100)
        : 0;

    return {
      average,
      count: allSkills.length,
      assessmentProgress,
    };
  }, [data]);

  const handleChange = (skillName, value) => {
    const numericValue = Number(value);

    setLevels((previous) => ({
      ...previous,
      [skillName]: Math.max(
        0,
        Math.min(100, Number.isNaN(numericValue) ? 0 : numericValue)
      ),
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      // const rawScores = {};
      // const normalizedVector = {};
      const rawScores = { ...originalRawScores };
      const normalizedVector = { ...originalNormalizedVector };

      Object.entries(levels).forEach(([skillName, percentage]) => {
        const rawScore = Number(
          (Number(percentage) / 10).toFixed(2)
        );

        const normalizedScore = Number(
          (Number(percentage) / 100).toFixed(2)
        );

        // Convert frontend names to backend-friendly keys.
        const backendKey = normalizeSkillName(skillName);

        // Remove an existing key for the same skill
        // if the backend uses different capitalization/spacing.
        Object.keys(rawScores).forEach((key) => {
          if (
            normalizeSkillName(key) === backendKey &&
            key !== backendKey
          ) {
            delete rawScores[key];
          }
        });

        Object.keys(normalizedVector).forEach((key) => {
          if (
            normalizeSkillName(key) === backendKey &&
            key !== backendKey
          ) {
            delete normalizedVector[key];
          }
        });

        rawScores[backendKey] = rawScore;
        normalizedVector[backendKey] = normalizedScore;
        
      });

      await updateSkillAssessment(STUDENT_ID, {
        raw_scores: rawScores,
        normalized_vector: normalizedVector,
        confidence,
      });

      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(
        err.message || "Unable to save skill assessment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="skill-assessment">
      <div className="skill-assessment-top">
        <div className="student-card">
          <div className="student-avatar">M</div>

          <div className="student-info">
            <h3>{data.student.name}</h3>

            <p>
              {data.student.id} · {data.student.course}
            </p>

            <p>
              {confidence.charAt(0).toUpperCase() +
                confidence.slice(1)}{" "}
              confidence
            </p>
          </div>
        </div>

        <div className="assessment-progress-card">
          <div className="assessment-progress-head">
            <h3>Assessment Completion</h3>
            <span>{summary.assessmentProgress}%</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${summary.assessmentProgress}%`,
              }}
            />
          </div>

          <div className="assessment-actions">
          <button
            className={`btn ${
              editing ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => {
              setEditing((current) => !current);
              setError("");
              setSaved(false);
            }}
            disabled={loading || saving}
          >
            <Icon name="edit" size={16} />

            {editing ? "Editing..." : "Edit Assessment"}
          </button>

          {editing && (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || saving}
            >
              <Icon name="check" size={16} />

              {saving ? "Saving..." : "Save Assessment"}
            </button>
          )}
        </div>

          {saved && (
            <div className="success-banner">
              <Icon name="check" size={18} />
              Assessment saved successfully.
            </div>
          )}

          {error && (
            <div className="error-banner">
              <Icon name="alert" size={18} />
              {error}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="skill-overall">
          <div>
            <h3>Loading Skill Assessment...</h3>
            <p>
              Please wait while we load your saved skills.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="skill-overall">
            <div
              className="skill-overall-ring"
              style={{
                "--ring-value": summary.average,
              }}
            >
              <span>{summary.average}%</span>
            </div>

            <div>
              <h3>Overall Skill Summary</h3>

              <p>
                {summary.count} skills tracked across{" "}
                {data.categories.length} categories. Average
                proficiency: {summary.average}%.
              </p>
            </div>
          </div>

          <div className="skill-grid">
            {data.categories.map((category) =>
              editing ? (
                <div
                  key={category.name}
                  className="skill-card editing"
                >
                  <h3 className="skill-card-title">
                    {category.name}
                  </h3>

                  <div className="skill-card-list">
                    {category.skills.map((skill) => (

                      <div
                        key={skill.name}
                        className="skill-item"
                      >
                        <div className="skill-item-head">
                          <span className="skill-item-name">
                            {skill.name}
                          </span>

                          <input
                            type="number"
                            className="skill-input"
                            min="0"
                            max="100"
                            value={levels[skill.name] ?? 0}
                            onFocus={(event) => event.target.select()}
                            onClick={(event) => event.target.select()}
                            onChange={(event) =>
                              handleChange(
                                skill.name,
                                event.target.value
                              )
                            }
                          />
                          
                        </div>

                        <div className="skill-slider-row">
                          <span className="skill-slider-min">0</span>

                          <input
                            type="range"
                            className="skill-range"
                            min="0"
                            max="100"
                            value={levels[skill.name] ?? 0}
                            style={{
                              "--skill-value": `${levels[skill.name] ?? 0}%`,
                            }}
                            onChange={(event) =>
                              handleChange(
                                skill.name,
                                event.target.value
                              )
                            }
                          />

                          <span className="skill-slider-max">100</span>
                        </div>
                      </div>


                    ))}
                  </div>
                </div>
              ) : (
                <SkillCard
                  key={category.name}
                  category={category}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}