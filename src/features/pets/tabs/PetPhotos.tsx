
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pet } from '../../../types';
import { apiClient } from '../../../api/client';
import { Button } from '../../../components/ui/Button';
import { Camera, Trash2, Upload, Plus } from 'lucide-react';
import { useToasts } from '../../../hooks/useToasts';

export const PetPhotos: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPhotos: string[]) => apiClient.updatePet(pet.id, { photos: newPhotos }),
    onSuccess: () => {
      addToast('Photos updated successfully');
      setPreviewUrl(null);
      setIsUploading(false);
    },
    onError: () => addToast('Failed to update photos', 'error'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['pet', pet.id] }),
  });

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const validateAndPreview = async (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      addToast('Invalid file format. Only JPG, PNG, WEBP allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('File too large. Max 5MB.', 'error');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPreviewUrl(dataUrl);
    } catch {
      addToast('Failed to read image file', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void validateAndPreview(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void validateAndPreview(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleUpload = () => {
    if (previewUrl) {
      mutation.mutate([...pet.photos, previewUrl]);
    }
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      const updated = pet.photos.filter((_, i) => i !== index);
      mutation.mutate(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <Camera size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Pet Gallery</h3>
            <p className="text-sm text-slate-500">Manage photos for {pet.name}</p>
          </div>
        </div>
        
        <label
          className="cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
          />
          <div className={`bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isDragOver ? 'ring-4 ring-green-200' : ''
          }`}>
            <Plus size={18} />
            {isDragOver ? 'Drop Photo' : 'Add Photo'}
          </div>
        </label>
      </div>

      {previewUrl && (
        <div className="bg-white p-6 rounded-2xl border border-dashed border-primary-300 animate-fade-in space-y-4">
          <h4 className="font-semibold text-slate-800">Preview</h4>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-white">
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-sm text-slate-600">This photo will be added to the gallery.</p>
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button
                  loading={mutation.isPending}
                  onClick={handleUpload}
                  className="gap-2 bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                >
                  <Upload size={16} /> Confirm Upload
                </Button>
                <Button
                  onClick={() => setPreviewUrl(null)}
                  className="bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pet.photos.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-slate-400">No photos uploaded yet.</p>
          </div>
        ) : (
          pet.photos.map((url, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm border bg-slate-200">
              <img src={url} className="w-full h-full object-cover" alt={`Pet ${idx}`} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(idx)}
                  className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transform hover:scale-110 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
