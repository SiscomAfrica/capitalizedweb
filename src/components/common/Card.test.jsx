import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-secondary-200');
  });

  it('applies different padding sizes', () => {
    const { rerender } = render(<Card padding="sm">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('p-3');

    rerender(<Card padding="lg">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('p-6');
  });

  it('applies different shadow styles', () => {
    const { rerender } = render(<Card shadow="medium">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('shadow-medium');

    rerender(<Card shadow="large">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('shadow-large');
  });

  it('becomes clickable when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    
    const card = screen.getByText('Clickable Card').closest('div');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    
    fireEvent.click(screen.getByText('Clickable Card').closest('div'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard interaction', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    
    const card = screen.getByText('Clickable Card').closest('div');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText('Content').closest('div')).toHaveClass('custom-class');
  });
});