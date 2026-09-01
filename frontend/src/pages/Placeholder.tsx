import PageHeader from '@/components/PageHeader';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="card flex flex-col items-center justify-center p-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <Construction size={32} className="text-brand-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Coming Soon</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          This module will be available in a future update. The AI mentor and reporting
          features are part of the roadmap once the core planning modules are complete.
        </p>
      </div>
    </div>
  );
}
