import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProfileView from './ProfileView';
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

const mockCompleteUser = {
  id: '123',
  email: 'test@example.com',
  phone: '+254712345678',
  full_name: 'John Doe',
  phone_verified: true,
  date_of_birth: '1990-01-01T00:00:00Z',
  country: 'Kenya',
  city: 'Nairobi',
  address: '123 Main Street, Westlands',
  kyc_status: 'approved',
  created_at: '2024-01-01T00:00:00Z'
};

const mockIncompleteUser = {
  id: '123',
  email: 'test@example.com',
  phone: '+254712345678',
  full_name: 'John Doe',
  phone_verified: true,
  // Missing profile completion fields
  kyc_status: 'not_submitted',
  created_at: '2024-01-01T00:00:00Z'
};

const mockUpdateUser = vi.fn();

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authClient.getProfile.mockResolvedValue(mockCompleteUser);
  });

  it('displays complete profile information', async () => {
    useAuth.mockReturnValue({
      user: mockCompleteUser,
      updateUser: mockUpdateUser,
      isProfileCompleted: () => true
    });

    render(<ProfileView onEditProfile={vi.fn()} onUploadKYC={vi.fn()} />);

    // Wait for profile to load
    await screen.findByText('John Doe');

    // Check basic information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+254712345678')).toBeInTheDocument();

    // Check profile completion fields
    expect(screen.getByText('Kenya')).toBeInTheDocument();
    expect(screen.getByText('Nairobi')).toBeInTheDocument();
    expect(screen.getByText('123 Main Street, Westlands')).toBeInTheDocument();

    // Check completion progress
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows profile completion status for incomplete profile', async () => {
    useAuth.mockReturnValue({
      user: mockIncompleteUser,
      updateUser: mockUpdateUser,
      isProfileCompleted: () => false
    });

    authClient.getProfile.mockResolvedValue(mockIncompleteUser);

    render(<ProfileView onEditProfile={vi.fn()} onUploadKYC={vi.fn()} />);

    // Wait for profile to load
    await screen.findByText('John Doe');

    // Check that completion alert is shown
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Missing information:')).toBeInTheDocument();

    // Check missing fields are listed
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();

    // Check completion progress shows 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays KYC status correctly', async () => {
    useAuth.mockReturnValue({
      user: mockCompleteUser,
      updateUser: mockUpdateUser,
      isProfileCompleted: () => true
    });

    render(<ProfileView onEditProfile={vi.fn()} onUploadKYC={vi.fn()} />);

    // Wait for profile to load
    await screen.findByText('John Doe');

    // Check KYC status
    expect(screen.getByText('Identity Verification')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('shows upload button for unverified KYC', async () => {
    const userWithoutKYC = {
      ...mockCompleteUser,
      kyc_status: 'not_submitted'
    };

    useAuth.mockReturnValue({
      user: userWithoutKYC,
      updateUser: mockUpdateUser,
      isProfileCompleted: () => true
    });

    authClient.getProfile.mockResolvedValue(userWithoutKYC);

    render(<ProfileView onEditProfile={vi.fn()} onUploadKYC={vi.fn()} />);

    // Wait for profile to load
    await screen.findByText('John Doe');

    // Check upload button is shown
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
  });

  it('handles missing profile fields gracefully', async () => {
    const userWithMissingFields = {
      ...mockIncompleteUser,
      country: 'Kenya', // Only country provided
    };

    useAuth.mockReturnValue({
      user: userWithMissingFields,
      updateUser: mockUpdateUser,
      isProfileCompleted: () => false
    });

    authClient.getProfile.mockResolvedValue(userWithMissingFields);

    render(<ProfileView onEditProfile={vi.fn()} onUploadKYC={vi.fn()} />);

    // Wait for profile to load
    await screen.findByText('John Doe');

    // Check that provided field is shown
    expect(screen.getByText('Kenya')).toBeInTheDocument();

    // Check that missing fields show "Not provided"
    expect(screen.getAllByText('Not provided')).toHaveLength(3); // DOB, City, Address
  });
});