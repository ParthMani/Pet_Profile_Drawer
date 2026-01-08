import { Client, Pet, Vaccination, Grooming, Booking } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

const API_BASE_URL = 'http://localhost:4000';

const DISABLE_SIM_FAILURE = (import.meta as any).env?.VITE_DISABLE_SIM_FAILURE === 'true' || (globalThis as any).Cypress;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.message === 'string') message = body.message;
    } catch {
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  getClients: async () => {
    await delay();
    return request<Client[]>('/clients');
  },

  getPets: async (clientId?: number) => {
    await delay();
    const qs = clientId ? `?clientId=${clientId}` : '';
    return request<Pet[]>(`/pets${qs}`);
  },

  getPet: async (id: number) => {
    await delay();
    return request<Pet>(`/pets/${id}`);
  },

  updatePet: async (id: number, data: Partial<Pet>) => {
    await delay(500);
    if (!DISABLE_SIM_FAILURE && Math.random() < 0.3) {
      throw new ApiError(500, "Simulated server failure (30% chance)");
    }

    return request<Pet>(`/pets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getVaccinations: async (petId: number) => {
    await delay();
    return request<Vaccination[]>(`/vaccinations?petId=${petId}`);
  },

  addVaccination: async (data: Omit<Vaccination, 'id'>) => {
    await delay(400);
    return request<Vaccination>('/vaccinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGrooming: async (petId: number) => {
    await delay();
    return request<Grooming[]>(`/grooming?petId=${petId}`);
  },

  getBookings: async (petId: number) => {
    await delay();
    return request<Booking[]>(`/bookings?petId=${petId}`);
  }
};
