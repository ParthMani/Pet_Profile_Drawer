
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Vaccination } from '../../../types';
import { computeDueDate } from '../../../utils/date';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { differenceInDays, parseISO } from 'date-fns';
import { Shield, Plus } from 'lucide-react';
import { useToasts } from '../../../hooks/useToasts';

export const PetVaccinations: React.FC<{ petId: number }> = ({ petId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [newVaccine, setNewVaccine] = useState({ name: '', date: new Date().toISOString().split('T')[0] });
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const { data: vaccinations = [], isLoading } = useQuery({
    queryKey: ['vaccinations', petId],
    queryFn: () => apiClient.getVaccinations(petId),
  });

  const mutation = useMutation({
    mutationFn: apiClient.addVaccination,
    onSuccess: () => {
      addToast('Vaccination recorded');
      setNewVaccine({ name: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['vaccinations', petId] }),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.name) return;
    mutation.mutate({
      petId,
      vaccine: newVaccine.name,
      date: newVaccine.date,
      due: computeDueDate(newVaccine.date),
    });
  };

  const isDueSoon = (dueDate: string) => {
    const diff = differenceInDays(parseISO(dueDate), new Date());
    return diff >= 0 && diff <= 30;
  };

  const sortedVaccinations = [...vaccinations].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return sortDir === 'desc' ? diff : -diff;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Shield size={20} className="text-primary-600" />
          Vaccination Records
        </h3>
        <Button 
          variant={showAddForm ? 'ghost' : 'primary'} 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
          className={
            showAddForm
              ? undefined
              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
          }
        >
          {showAddForm ? 'Cancel' : 'Quick Add'}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border shadow-sm animate-fade-in flex flex-col sm:flex-row items-end gap-4">
          <Input 
            label="Vaccine Name" 
            placeholder="e.g. Rabies" 
            value={newVaccine.name} 
            onChange={e => setNewVaccine(p => ({ ...p, name: e.target.value }))}
            required
          />
          <Input 
            label="Administered Date" 
            type="date" 
            value={newVaccine.date} 
            onChange={e => setNewVaccine(p => ({ ...p, date: e.target.value }))}
            required
          />
          <Button
            type="submit"
            loading={mutation.isPending}
            className="flex-shrink-0 bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          >
            Add Record
          </Button>
        </form>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center animate-pulse text-slate-300">Loading records...</div>
        ) : sortedVaccinations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No vaccination history found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vaccine</th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                    aria-label={`Sort by date ${sortDir === 'desc' ? 'ascending' : 'descending'}`}
                  >
                    Date
                    <span className="text-slate-400 text-[10px] font-bold">{sortDir === 'desc' ? '(desc)' : '(asc)'}</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedVaccinations.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{v.vaccine}</td>
                  <td className="px-6 py-4 text-slate-600">{v.date}</td>
                  <td className="px-6 py-4 text-slate-600">{v.due}</td>
                  <td className="px-6 py-4">
                    {isDueSoon(v.due) && (
                      <Badge variant="error">Due within 30 days</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
