import { useMemo, useState } from 'react';
import type { SkillAssessment, SkillGroup, SkillLevel, Proficiency } from '@/types';
import { initialSkillAssessment } from '@/data/mockData';
import { api } from '@/services/api';
import PageHeader from '@/components/PageHeader';
import ProgressBar from '@/components/ProgressBar';
import {
  skillLevelConfig,
  proficiencyLabels,
  formatDate,
} from '@/lib/statusConfig';
import {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
  Save,
  Pencil,
  CheckCircle2,
  Sparkles,
  User,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
};

const levels: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

function levelToProficiency(level: SkillLevel): Proficiency {
  return skillLevelConfig[level].proficiency as Proficiency;
}

function proficiencyToLevel(p: Proficiency): SkillLevel {
  if (p <= 1) return 'beginner';
  if (p <= 2) return 'beginner';
  if (p === 3) return 'intermediate';
  if (p === 4) return 'advanced';
  return 'expert';
}

export default function SkillAssessment() {
  const [assessment, setAssessment] = useState<SkillAssessment>(initialSkillAssessment);
  const [isEditing, setIsEditing] = useState(!initialSkillAssessment.saved);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(initialSkillAssessment.saved);

  const completion = useMemo(() => {
    const all = assessment.groups.flatMap((g) => g.skills);
    const selected = all.filter((s) => s.selected).length;
    return Math.round((selected / all.length) * 100);
  }, [assessment]);

  const summarySkills = useMemo(() => {
    return assessment.groups
      .flatMap((g) => g.skills)
      .filter((s) => s.selected)
      .sort((a, b) => b.proficiency - a.proficiency);
  }, [assessment]);

  function updateSkill(groupId: string, skillName: string, updates: Partial<{ selected: boolean; level: SkillLevel; proficiency: Proficiency }>) {
    setAssessment((prev) => ({
      ...prev,
      groups: prev.groups.map((g): SkillGroup =>
        g.id === groupId
          ? {
              ...g,
              skills: g.skills.map((s) =>
                s.name === skillName
                  ? {
                      ...s,
                      ...updates,
                      level: updates.level ?? (updates.proficiency ? proficiencyToLevel(updates.proficiency) : s.level),
                      proficiency: updates.proficiency ?? (updates.level ? levelToProficiency(updates.level) : s.proficiency),
                    }
                  : s,
              ),
            }
          : g,
      ),
    }));
  }

  function handleSave() {
    setSaving(true);
    api.saveSkillAssessment({ ...assessment, completion })
      .then((saved) => {
        setAssessment(saved);
        setShowSaved(true);
        setIsEditing(false);
      })
      .finally(() => setSaving(false));
  }

  function handleEdit() {
    setIsEditing(true);
    setShowSaved(false);
  }

  return (
    <div>
      <PageHeader
        title="Skill Assessment"
        description="Rate your technical skills so the AI mentor can recommend the right technologies and project plan."
        actions={
          showSaved ? (
            <button onClick={handleEdit} className="btn-secondary">
              <Pencil size={16} /> Edit Assessment
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Assessment'}
            </button>
          )
        }
      />

      {showSaved && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Assessment saved successfully</p>
            <p className="text-xs text-emerald-600">
              Last updated {formatDate(assessment.lastUpdated)}. The AI mentor will use this to guide your project plan.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <User size={18} className="text-brand-600" />
              <h3 className="section-title">Student Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Student Name</label>
                <input className="input" value={assessment.student.name} readOnly={!isEditing} onChange={(e) => setAssessment((p) => ({ ...p, student: { ...p.student, name: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Department</label>
                <input className="input" value={assessment.student.department} readOnly={!isEditing} onChange={(e) => setAssessment((p) => ({ ...p, student: { ...p.student, department: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Year</label>
                <input className="input" value={assessment.student.year} readOnly={!isEditing} onChange={(e) => setAssessment((p) => ({ ...p, student: { ...p.student, year: e.target.value } }))} />
              </div>
              <div>
                <label className="label">Academic Level</label>
                <input className="input" value={assessment.student.academicLevel} readOnly={!isEditing} onChange={(e) => setAssessment((p) => ({ ...p, student: { ...p.student, academicLevel: e.target.value } }))} />
              </div>
            </div>
          </div>

          {assessment.groups.map((group) => {
            const Icon = iconMap[group.icon] ?? Wrench;
            return (
              <div key={group.id} className="card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Icon size={18} className="text-brand-600" />
                  <h3 className="section-title">{group.title}</h3>
                </div>
                <div className="space-y-3">
                  {group.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className={`rounded-lg border p-3 transition-colors ${
                        skill.selected
                          ? 'border-brand-200 bg-brand-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={skill.selected}
                            disabled={!isEditing}
                            onChange={(e) => updateSkill(group.id, skill.name, { selected: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          {skill.name}
                        </label>
                        {skill.selected && !isEditing && (
                          <span className={`text-xs font-medium ${skillLevelConfig[skill.level].color}`}>
                            {skillLevelConfig[skill.level].label}
                          </span>
                        )}
                      </div>
                      {skill.selected && isEditing && (
                        <div className="mt-3 pl-6">
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {levels.map((lvl) => (
                              <button
                                key={lvl.value}
                                onClick={() => updateSkill(group.id, skill.name, { level: lvl.value })}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                  skill.level === lvl.value
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {lvl.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => updateSkill(group.id, skill.name, { proficiency: n as Proficiency })}
                                className={`h-2 flex-1 rounded-full transition-colors ${
                                  n <= skill.proficiency ? 'bg-brand-500' : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                                title={proficiencyLabels[n]}
                                aria-label={`${proficiencyLabels[n]} (${n}/5)`}
                              />
                            ))}
                            <span className="ml-2 w-24 text-xs text-slate-500">
                              {proficiencyLabels[skill.proficiency]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="card sticky top-20 p-5">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="section-title">Assessment Completion</h3>
                <span className="text-sm font-bold text-brand-600">{completion}%</span>
              </div>
              <ProgressBar value={completion} size="lg" color={completion >= 100 ? 'emerald' : 'brand'} />
              <p className="mt-2 text-xs text-slate-500">
                {completion === 100
                  ? 'All skills rated — ready to save.'
                  : `${summarySkills.length} skills selected. Rate more to improve accuracy.`}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-600" />
                <h4 className="text-sm font-semibold text-slate-900">Skill Summary</h4>
              </div>
              {summarySkills.length === 0 ? (
                <p className="text-sm text-slate-400">No skills selected yet.</p>
              ) : (
                <div className="space-y-2">
                  {summarySkills.slice(0, 12).map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{skill.name}</span>
                      <span className={`font-medium ${skillLevelConfig[skill.level].color}`}>
                        {skillLevelConfig[skill.level].label}
                      </span>
                    </div>
                  ))}
                  {summarySkills.length > 12 && (
                    <p className="pt-1 text-xs text-slate-400">+{summarySkills.length - 12} more</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <GraduationCap size={14} />
                {assessment.student.academicLevel} · {assessment.student.year}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
