
import React, { useMemo } from 'react';
import { Pet } from '../../../types';
import { calculateAge, isDateInFuture } from '../../../utils/date';
import { Input, Checkbox } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { PetFormErrors, toggleAttribute } from '../../../utils/petForm';

interface PetDetailsProps {
  pet: Pet;
  isEditing: boolean;
  formData: Partial<Pet>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Pet>>>;
  errors?: PetFormErrors;
}

const ATTRIBUTE_OPTIONS = ["Barks", "Blind", "Escaper", "Shy", "Friendly", "Aggressive"];

export const PetDetails: React.FC<PetDetailsProps> = ({ pet, isEditing, formData, setFormData, errors }) => {
  const age = useMemo(() => calculateAge(pet.dob), [pet.dob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleAttributeToggle = (attr: string) => {
    setFormData(prev => ({ ...prev, attributes: toggleAttribute(prev.attributes, attr) }));
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => (
    <div className="flex flex-col py-3 border-b last:border-0">
      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="mt-1 text-slate-900 font-medium">{value}</div>
    </div>
  );

  if (!isEditing) {
    return (
      <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <InfoRow label="Pet Name" value={pet.name} />
          <InfoRow label="Breed" value={pet.breed} />
          <InfoRow label="Type" value={pet.type} />
          <InfoRow label="Gender" value={pet.gender} />
          <InfoRow label="Age" value={`${age.years} yrs, ${age.months} mos`} />
          <InfoRow label="Weight" value={`${pet.weightKg} kg`} />
          <InfoRow label="Temper" value={pet.temper} />
          <InfoRow label="Size" value={pet.size} />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Attributes</h4>
          <div className="flex flex-wrap gap-2">
            {pet.attributes.length > 0 ? (
              pet.attributes.map(attr => (
                <Badge key={attr} variant="neutral" className="px-3 py-1">{attr}</Badge>
              ))
            ) : (
              <span className="text-slate-400 italic text-sm">No special attributes</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Internal Notes</h4>
            <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {pet.notes || 'No internal notes provided.'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Customer Portal Notes</h4>
            <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {pet.customerNotes || 'No notes from customer portal.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Pet Name *" 
          name="name" 
          value={formData.name || ''} 
          onChange={handleChange}
          error={errors?.name}
          required
        />
        <Input 
          label="Breed *" 
          name="breed" 
          value={formData.breed || ''} 
          onChange={handleChange}
          error={errors?.breed}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Type *</label>
          <select 
            name="type" 
            value={formData.type || ''} 
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Gender *</label>
          <select 
            name="gender" 
            value={formData.gender || ''} 
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Neutered - Male">Neutered - Male</option>
            <option value="Neutered - Female">Neutered - Female</option>
          </select>
        </div>
        <Input 
          label="DOB *" 
          name="dob" 
          type="date" 
          max={new Date().toISOString().split('T')[0]}
          value={formData.dob || ''} 
          onChange={handleChange}
          error={errors?.dob || (formData.dob && isDateInFuture(formData.dob) ? "Date cannot be in the future" : undefined)}
          required
        />
        <Input 
          label="Weight (kg) *" 
          name="weightKg" 
          type="number" 
          step="0.01" 
          min="0" 
          max="200"
          value={formData.weightKg || ''} 
          onChange={handleChange}
          error={errors?.weightKg}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Size *</label>
          <select 
            name="size" 
            value={formData.size || ''} 
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
          >
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>
        <Input 
          label="Temper" 
          name="temper" 
          value={formData.temper || ''} 
          onChange={handleChange}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Attributes</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ATTRIBUTE_OPTIONS.map(attr => (
            <Checkbox 
              key={attr} 
              label={attr} 
              checked={formData.attributes?.includes(attr) || false} 
              onChange={() => handleAttributeToggle(attr)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Internal Notes</label>
          <textarea 
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-primary-600 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Customer Portal Notes</label>
          <textarea 
            name="customerNotes"
            value={formData.customerNotes || ''}
            onChange={handleChange}
            rows={3}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-primary-600 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
