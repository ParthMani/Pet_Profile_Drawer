
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { Badge } from '../../../components/ui/Badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { BookingStatus } from '../../../types';

export const PetBookings: React.FC<{ petId: number }> = ({ petId }) => {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', petId],
    queryFn: () => apiClient.getBookings(petId),
  });

  const sorted = [...bookings].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Confirmed: return 'success';
      case BookingStatus.Pending: return 'warning';
      case BookingStatus.Cancelled: return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Calendar size={20} className="text-primary-600" />
        Upcoming & Past Bookings
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-10 text-center animate-pulse text-slate-300">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="p-12 bg-white border rounded-2xl text-center text-slate-400">No bookings found.</div>
        ) : (
          sorted.map(b => (
            <div key={b.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">{b.type}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="neutral" className="bg-slate-50">{b.start}</Badge>
                  <ArrowRight size={14} className="text-slate-400" />
                  <Badge variant="neutral" className="bg-slate-50">{b.end}</Badge>
                </div>
              </div>
              <Badge variant={getStatusVariant(b.status)} className="self-start sm:self-center">
                {b.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
