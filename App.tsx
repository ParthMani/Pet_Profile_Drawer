
import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { apiClient } from './src/api/client';
import { ClientsList } from './src/features/clients/ClientsList';
import { PetDrawer } from './src/features/pets/PetDrawer';
import { Status, Pet } from './src/types';
import { ToastProvider, useToasts } from './src/hooks/useToasts';
import { Info } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function MainApp() {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [search, setSearch] = useState('');
  const { toasts } = useToasts();

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: apiClient.getClients,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => apiClient.getPets(),
  });

  const handleClientClick = (clientId: number) => {
    const clientPets = pets.filter(p => p.clientId === clientId);
    const visiblePets = includeInactive ? clientPets : clientPets.filter(p => p.status === Status.Active);
    if (visiblePets.length > 0) {
      setSelectedPetId(visiblePets[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Panel */}
      <aside className="w-full md:w-[400px] border-r bg-white h-screen flex flex-col sticky top-0">
        <header className="p-4 border-b space-y-4">
          <h1 className="text-xl font-bold text-primary-700 flex items-center gap-2">
            <span className="p-1 bg-primary-600 rounded text-white">P</span>
            PawsPort
          </h1>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search clients, email, or pets..."
              className="w-full px-3 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary-600 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              <span className="text-sm text-slate-600">Include Inactive</span>
            </label>
          </div>
        </header>

        <ClientsList 
          clients={clients}
          pets={pets}
          search={search}
          includeInactive={includeInactive}
          onPetClick={setSelectedPetId}
          onClientClick={handleClientClick}
          selectedPetId={selectedPetId}
          isLoading={clientsLoading || petsLoading}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 flex items-center justify-center text-slate-400">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Info size={32} />
          </div>
          <p className="text-lg font-medium">Select a pet to view their profile details, medical history, and more.</p>
        </div>
      </main>

      {/* Drawer */}
      {selectedPetId && (
        <PetDrawer 
          petId={selectedPetId}
          onClose={() => setSelectedPetId(null)}
        />
      )}

      {/* Toast Overlay */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </QueryClientProvider>
  );
}
