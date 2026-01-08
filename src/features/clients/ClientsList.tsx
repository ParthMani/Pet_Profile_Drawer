
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useDebounce } from '../../hooks/useDebounce';
import { Client, Pet, Status } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Mail, ChevronRight } from 'lucide-react';

interface ClientsListProps {
  clients: Client[];
  pets: Pet[];
  search: string;
  includeInactive: boolean;
  onPetClick: (id: number) => void;
  onClientClick: (id: number) => void;
  selectedPetId: number | null;
  isLoading: boolean;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  pets,
  search,
  includeInactive,
  onPetClick,
  onClientClick,
  selectedPetId,
  isLoading
}) => {
  const debouncedSearch = useDebounce(search.toLowerCase(), 400);

  const filteredData = useMemo(() => {
    return clients
      .map(client => {
        const clientPets = pets.filter(p => p.clientId === client.id);
        const matchesClient = client.name.toLowerCase().includes(debouncedSearch) || 
                             client.email.toLowerCase().includes(debouncedSearch);
        const matchingPets = clientPets.filter(p => 
          p.name.toLowerCase().includes(debouncedSearch)
        );

        if (!matchesClient && matchingPets.length === 0) return null;

        if (!includeInactive && client.status === Status.Inactive) return null;
        
        const visiblePets = includeInactive 
          ? clientPets 
          : clientPets.filter(p => p.status === Status.Active);

        return { ...client, pets: visiblePets };
      })
      .filter((c): c is (Client & { pets: Pet[] }) => c !== null);
  }, [clients, pets, debouncedSearch, includeInactive]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-slate-400 text-sm">No clients or pets found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y">
      {filteredData.map(client => (
        <div 
          key={client.id} 
          className={classNames(
            "group p-4 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors",
            client.status === Status.Inactive && "opacity-60 bg-slate-50/50"
          )}
          onClick={() => onClientClick(client.id)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                {client.name}
                <Badge variant={client.status === Status.Active ? 'success' : 'neutral'}>
                  {client.status}
                </Badge>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Mail size={12} />
                {client.email}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {client.pets.map(pet => (
              <button
                key={pet.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onPetClick(pet.id);
                }}
                className={classNames(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-2 transition-all",
                  selectedPetId === pet.id 
                    ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-100" 
                    : "bg-white border-slate-200 text-slate-700 hover:border-primary-400",
                  pet.status === Status.Inactive && selectedPetId !== pet.id && "bg-slate-50 border-dashed text-slate-400"
                )}
              >
                <div className={classNames(
                  "w-2 h-2 rounded-full",
                  pet.status === Status.Active ? "bg-green-500" : "bg-slate-300"
                )} />
                {pet.name}
                <ChevronRight size={14} className={selectedPetId === pet.id ? "opacity-100" : "opacity-0"} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
