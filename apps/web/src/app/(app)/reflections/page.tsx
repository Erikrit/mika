'use client';

import { BookOpen } from 'lucide-react';

export default function ReflectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reflexões</h1>
        <p className="text-slate-400 text-sm mt-1">Diário e reflexões pessoais</p>
      </div>
      <div className="flex flex-col items-center py-16 text-center bg-slate-900 rounded-xl border border-slate-800">
        <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-slate-400">Em breve...</p>
      </div>
    </div>
  );
}
