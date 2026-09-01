import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import SkillAssessment from '@/pages/SkillAssessment';
import MilestoneManagement from '@/pages/MilestoneManagement';
import TimelineManagement from '@/pages/TimelineManagement';
import Placeholder from '@/pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skill-assessment" element={<SkillAssessment />} />
          <Route path="/project" element={
            <Placeholder
              title="Project"
              description="View and manage your project details and configuration."
            />
          } />
          <Route path="/milestones" element={<MilestoneManagement />} />
          <Route path="/timeline" element={<TimelineManagement />} />
          <Route path="/progress" element={
            <Placeholder
              title="Progress"
              description="Detailed progress analytics across all project modules."
            />
          } />
          <Route path="/ai-mentor" element={
            <Placeholder
              title="AI Mentor"
              description="Get AI-powered guidance and recommendations from your project mentor agent."
            />
          } />
          <Route path="/reports" element={
            <Placeholder
              title="Reports"
              description="Generate and download project progress reports."
            />
          } />
          <Route path="/settings" element={
            <Placeholder
              title="Settings"
              description="Manage your account and application preferences."
            />
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
