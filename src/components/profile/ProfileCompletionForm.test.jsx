import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileCompletionForm from './ProfileCompletionForm';
import useAuth from '../../hooks/useAuth';
import authClient from '../../api/authClient';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../api/authClient');
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

const mockUser = {
  id: '123',
  email: 'test@example.com',
  full_name: 'John Doe',
  phone_verified: true,
  date_of_birth: null,
  country: null,
  city: null,
  address: null
};

const mockUpdateUser = vi.fn();

describe('ProfileCompletionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser
    });
  });

  it('renders the form with all required fields', () => {
    render(<ProfileCompletionForm />);
    
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Profile/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<ProfileCompletionForm />);
    
    const submitButton = screen.getByRole('button', { name: /Complete Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
      expect(screen.getByText('Country is required')).toBeInTheDocument();
      expect(screen.getByText('City is required')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();
    });
  });

  it('validates minimum age requirement', async () => {
    render(<ProfileCompletionForm />);
    
    const dateInput = screen.getByLabelText(/Date of Birth/i);
    const today = new Date();
    const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    
    fireEvent.change(dateInput, { 
      target: { value: underageDate.toISOString().split('T')[0] } 
    });
    
    const submitButton = screen.getByRole('button', { name: /Complete Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('You must be at least 18 years old')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockUpdatedProfile = {
      ...mockUser,
      date_of_birth: '1990-01-01T00:00:00Z',
      country: 'Kenya',
      city: 'Nairobi',
      address: '123 Main Street, Westlands'
    };

    authClient.updateProfile.mockResolvedValue(mockUpdatedProfile);
    
    const mockOnSuccess = vi.fn();
    render(<ProfileCompletionForm onSuccess={mockOnSuccess} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' }
    });
    fireEvent.change(screen.getByLabelText(/Country/i), {
      target: { value: 'Kenya' }
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Nairobi' }
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: '123 Main Street, Westlands' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Complete Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authClient.updateProfile).toHaveBeenCalledWith({
        dateOfBirth: '1990-01-01T00:00:00.000Z',
        country: 'Kenya',
        city: 'Nairobi',
        address: '123 Main Street, Westlands'
      });
    });

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(mockUpdatedProfile);
    });

    // Check success message appears
    await waitFor(() => {
      expect(screen.getByText('Profile completed successfully!')).toBeInTheDocument();
    });

    // Check that onSuccess is called after delay
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUpdatedProfile);
    }, { timeout: 2000 });
  });

  it('shows progress indicator', () => {
    render(<ProfileCompletionForm />);
    
    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    // Fill in all fields
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' }
    });
    fireEvent.change(screen.getByLabelText(/Country/i), {
      target: { value: 'Kenya' }
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Nairobi' }
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: '123 Main Street, Westlands' }
    });

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    authClient.updateProfile.mockRejectedValue(new Error('Network error'));
    
    render(<ProfileCompletionForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' }
    });
    fireEvent.change(screen.getByLabelText(/Country/i), {
      target: { value: 'Kenya' }
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Nairobi' }
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: '123 Main Street, Westlands' }
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Complete Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});