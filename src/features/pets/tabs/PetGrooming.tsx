
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Scissors } from 'lucide-react';

export const PetGrooming: React.FC<{ petId: number }> = ({ petId }) => {
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const { data: grooming = [], isLoading } = useQuery({
    queryKey: ['grooming', petId],
    queryFn: () => apiClient.getGrooming(petId),
  });

  const sorted = [...grooming].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return sortDir === 'desc' ? diff : -diff;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Scissors size={20} className="text-primary-600" />
          Grooming History
        </h3>

        <button
          type="button"
          onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
          className="text-sm font-medium text-slate-600 hover:text-slate-800"
          aria-label={`Sort grooming by date ${sortDir === 'desc' ? 'ascending' : 'descending'}`}
        >
          Date {sortDir === 'desc' ? '(desc)' : '(asc)'}
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center animate-pulse text-slate-300">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-12 bg-white border rounded-2xl text-center text-slate-400">No grooming history.</div>
        ) : (
          sorted.map(g => (
            <div key={g.id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900">{g.service}</h4>
                <span className="text-sm font-medium text-slate-500">{g.date}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">"{g.notes}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
