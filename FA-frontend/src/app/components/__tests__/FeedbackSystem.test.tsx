import { render, screen, fireEvent } from '@testing-library/react'
import FeedbackSystem from '../FeedbackSystem'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

describe('FeedbackSystem', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()
  })

  it('renders feedback form correctly', () => {
    render(<FeedbackSystem />)
    
    // Check for form elements
    expect(screen.getByText(/Feedback/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
  })

  it('handles feedback submission', async () => {
    // Mock successful API response
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } })
    
    render(<FeedbackSystem />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'Test feedback message' }
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }))
    
    // Verify API was called
    expect(api.post).toHaveBeenCalledWith('/feedback', {
      message: 'Test feedback message'
    })
  })
}) 