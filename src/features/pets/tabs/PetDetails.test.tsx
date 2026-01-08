import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PetDetails } from './PetDetails';
import { Pet, Status } from '../../../types';

describe('PetDetails (attributes)', () => {
  test('attribute checkboxes add/remove updates form state', async () => {
    const user = userEvent.setup();

    const pet: Pet = {
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

    const Wrapper: React.FC = () => {
      const [formData, setFormData] = React.useState<Partial<Pet>>({
        ...pet,
        attributes: ['Friendly'],
      });

      return (
        <div>
          <PetDetails
            pet={pet}
            isEditing
            formData={formData}
            setFormData={setFormData}
          />
          <pre data-testid="formData">{JSON.stringify(formData)}</pre>
        </div>
      );
    };

    render(<Wrapper />);

    const barks = screen.getByLabelText('Barks') as HTMLInputElement;
    expect(barks.checked).toBe(false);

    await user.click(barks);
    expect((screen.getByLabelText('Barks') as HTMLInputElement).checked).toBe(true);
    expect(screen.getByTestId('formData').textContent).toContain('Barks');

    await user.click(screen.getByLabelText('Barks'));
    expect((screen.getByLabelText('Barks') as HTMLInputElement).checked).toBe(false);
    expect(screen.getByTestId('formData').textContent).not.toContain('Barks');
  });
});
