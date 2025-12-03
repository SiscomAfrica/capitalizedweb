import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    expect(screen.getByText('Africa Web Client')).toBeInTheDocument()
  })

  it('shows project setup completion message', () => {
    render(<App />)
    expect(screen.getByText('Project Setup Complete')).toBeInTheDocument()
  })

  it('displays the setup checklist', () => {
    render(<App />)
    expect(screen.getByText('✅ React + Vite')).toBeInTheDocument()
    expect(screen.getByText('✅ Tailwind CSS with custom design tokens')).toBeInTheDocument()
    expect(screen.getByText('✅ Vitest + Testing Library for testing')).toBeInTheDocument()
  })
})