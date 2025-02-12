import { render, screen, fireEvent } from '@testing-library/react'
import FirstTimerForm from '../FirstTimerForm'

describe('FirstTimerForm', () => {
  it('renders form fields correctly', () => {
    render(<FirstTimerForm onSubmit={() => {}} />)
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
  })

  it('handles form submission', () => {
    const mockSubmit = jest.fn()
    render(<FirstTimerForm onSubmit={mockSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'John' }
    })
    
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }))
    expect(mockSubmit).toHaveBeenCalled()
  })
}) 