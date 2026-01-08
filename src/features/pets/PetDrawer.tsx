
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Status, Pet } from '../../types';
import { apiClient } from '../../api/client';
import { PetDetails } from './tabs/PetDetails';
import { PetPhotos } from './tabs/PetPhotos';
import { PetVaccinations } from './tabs/PetVaccinations';
import { PetGrooming } from './tabs/PetGrooming';
import { PetBookings } from './tabs/PetBookings';
import { useToasts } from '../../hooks/useToasts';
import { FileText, Camera, Shield, Scissors, Calendar, User, MoreVertical, Pencil } from 'lucide-react';
import { hasErrors, validatePetForm } from '../../utils/petForm';

interface PetDrawerProps {
  petId: number;
  onClose: () => void;
}

type TabType = 'details' | 'photos' | 'vaccinations' | 'grooming' | 'bookings';

export const PetDrawer: React.FC<PetDrawerProps> = ({ petId, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Pet>>({});
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [hasTriedSave, setHasTriedSave] = useState(false);
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => apiClient.getPet(petId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Pet>) => apiClient.updatePet(petId, data),
    onMutate: async (newPet) => {
      await queryClient.cancelQueries({ queryKey: ['pet', petId] });
      const previousPet = queryClient.getQueryData(['pet', petId]);
      queryClient.setQueryData(['pet', petId], (old: Pet) => ({ ...old, ...newPet }));
      return { previousPet };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['pet', petId], context?.previousPet);
      addToast(err.message || 'Failed to update pet profile', 'error');
    },
    onSuccess: () => {
      addToast('Pet profile updated successfully');
      setIsEditing(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', petId] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });

  if (isLoading || !pet) return <Drawer isOpen onClose={onClose}>Loading...</Drawer>;

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({});
      setIsEditing(false);
      setHasTriedSave(false);
    } else {
      setFormData(pet);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    setHasTriedSave(true);
    const errors = validatePetForm(formData);
    if (hasErrors(errors)) {
      addToast('Please fix validation errors before saving', 'error');
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleStatusChange = (newStatus: Status) => {
    setIsActionsOpen(false);
    updateMutation.mutate({ status: newStatus });
  };

  const validationErrors = isEditing && hasTriedSave ? validatePetForm(formData) : undefined;
  const saveDisabled = isEditing && (updateMutation.isPending || hasErrors(validatePetForm(formData)));

  const drawerTitle = (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full overflow-hidden border bg-slate-100 flex-shrink-0">
        {pet.photos?.[0] ? (
          <img src={pet.photos[0]} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <User size={24} />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          {pet.name}
          <Badge variant={pet.status === Status.Active ? 'success' : 'neutral'}>
            {pet.status}
          </Badge>
        </h2>
        <p className="text-sm text-slate-500">{pet.breed} - {pet.type}</p>
      </div>
    </div>
  );

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'vaccinations', label: 'Vaccines', icon: Shield },
    { id: 'grooming', label: 'Grooming', icon: Scissors },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
  ];

  const tabId = (id: TabType) => `pet-tab-${id}`;
  const panelId = (id: TabType) => `pet-panel-${id}`;

  return (
    <Drawer isOpen onClose={onClose} title={drawerTitle}>
      <div className="flex flex-col h-full bg-slate-50">
        {/* Actions Bar */}
        <div className="px-6 py-4 bg-white border-b flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10 shadow-sm">
          <div
            className="flex flex-1 min-w-0 gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto"
            role="tablist"
            aria-label="Pet profile tabs"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                id={tabId(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={panelId(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-shrink-0 items-center">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={handleEditToggle}>Cancel</Button>
                <Button 
                  loading={updateMutation.isPending}
                  disabled={saveDisabled}
                  onClick={handleSave}
                  className="bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-500 hidden sm:block">Status</label>
                  <select
                    value={pet.status}
                    onChange={(e) => handleStatusChange(e.target.value as Status)}
                    disabled={updateMutation.isPending}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700"
                    aria-label="Pet status"
                  >
                    <option value={Status.Active}>Active</option>
                    <option value={Status.Inactive}>Inactive</option>
                  </select>

                <Button
                  variant="outline"
                  onClick={() => setIsActionsOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isActionsOpen}
                  className="gap-2"
                >
                  <MoreVertical size={16} />
                  Actions
                </Button>
                </div>

                {isActionsOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    <button
                      role="menuitem"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                      onClick={() => {
                        setIsActionsOpen(false);
                        handleEditToggle();
                      }}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'details' && (
            <div id={panelId('details')} role="tabpanel" aria-labelledby={tabId('details')} tabIndex={0}>
              <PetDetails 
                pet={pet} 
                isEditing={isEditing} 
                formData={formData} 
                setFormData={setFormData}
                errors={validationErrors}
              />
            </div>
          )}
          {activeTab === 'photos' && (
            <div id={panelId('photos')} role="tabpanel" aria-labelledby={tabId('photos')} tabIndex={0}>
              <PetPhotos pet={pet} />
            </div>
          )}
          {activeTab === 'vaccinations' && (
            <div id={panelId('vaccinations')} role="tabpanel" aria-labelledby={tabId('vaccinations')} tabIndex={0}>
              <PetVaccinations petId={pet.id} />
            </div>
          )}
          {activeTab === 'grooming' && (
            <div id={panelId('grooming')} role="tabpanel" aria-labelledby={tabId('grooming')} tabIndex={0}>
              <PetGrooming petId={pet.id} />
            </div>
          )}
          {activeTab === 'bookings' && (
            <div id={panelId('bookings')} role="tabpanel" aria-labelledby={tabId('bookings')} tabIndex={0}>
              <PetBookings petId={pet.id} />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
