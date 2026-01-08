import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import { apiClient } from './src/api/client';
import { Client, Pet, Status } from './src/types';

jest.mock('./src/api/client', () => ({
  apiClient: {
    getClients: jest.fn(),
    getPets: jest.fn(),
    getPet: jest.fn(),
    updatePet: jest.fn(),
    getVaccinations: jest.fn(),
    addVaccination: jest.fn(),
    getGrooming: jest.fn(),
    getBookings: jest.fn(),
  },
}));

describe('App integration (drawer)', () => {
  const mockClients: Client[] = [
    { id: 1, name: 'Sarah Jenkins', email: 'sarah.j@example.com', status: Status.Active },
  ];

  const basePet: Pet = {
    id: 101,
    clientId: 1,
    name: 'Noddy',
    status: Status.Active,
    type: 'Dog',
    breed: 'American Staffordshire Terrier',
    size: 'Medium',
    temper: 'Excellent',
    color: 'Black',
    gender: 'Female',
    weightKg: 15.4,
    dob: '2022-01-01',
    attributes: ['Friendly'],
    notes: null,
    customerNotes: null,
    photos: [],
  };

  beforeEach(() => {
    (apiClient.getClients as jest.Mock).mockResolvedValue(mockClients);
    (apiClient.getPets as jest.Mock).mockResolvedValue([basePet]);
    (apiClient.getPet as jest.Mock).mockResolvedValue(basePet);
    (apiClient.updatePet as jest.Mock).mockImplementation(async (_id: number, data: Partial<Pet>) => ({
      ...basePet,
      ...data,
    }));
    (apiClient.getVaccinations as jest.Mock).mockResolvedValue([]);
    (apiClient.getGrooming as jest.Mock).mockResolvedValue([]);
    (apiClient.getBookings as jest.Mock).mockResolvedValue([]);
  });

  test('clicking a pet button opens the Pet Profile Drawer', async () => {
    const user = userEvent.setup();
    render(<App />);

    const petButton = await screen.findByRole('button', { name: /Noddy/i });
    await user.click(petButton);

    expect(await screen.findByText('Noddy')).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /Details/i })).toBeInTheDocument();
  });

  test('Edit -> Save calls update and updates the UI (weight)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const petButton = await screen.findByRole('button', { name: /Noddy/i });
    await user.click(petButton);

    await user.click(await screen.findByRole('button', { name: /Actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /Edit/i }));

    const weightInput = await screen.findByRole('spinbutton', { name: /Weight/i });
    await user.clear(weightInput);
    await user.type(weightInput, '26.75');

    await user.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(apiClient.updatePet).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Pet profile updated successfully')).toBeInTheDocument();

    expect(await screen.findByText('26.75 kg')).toBeInTheDocument();
  });
});
