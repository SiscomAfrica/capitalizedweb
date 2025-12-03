import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input Component', () => {
  it('renders with basic props', () => {
    render(<Input value="test" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test');
  });

  it('renders with label', () => {
    render(<Input label="Email" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Email" required value="" onChange={() => {}} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message and styling', () => {
    render(<Input error="This field is required" value="" onChange={() => {}} />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-error-300');
  });

  it('shows error icon when error is present', () => {
    render(<Input error="Error message" value="" onChange={() => {}} />);
    const errorIcons = document.querySelectorAll('svg');
    expect(errorIcons.length).toBeGreaterThan(0);
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" value="" onChange={() => {}} />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Input disabled value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('shows placeholder text', () => {
    render(<Input placeholder="Enter your email" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });
});