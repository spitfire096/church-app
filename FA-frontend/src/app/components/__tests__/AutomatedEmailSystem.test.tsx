import { render, screen } from '@testing-library/react'
import AutomatedEmailSystem from '../AutomatedEmailSystem'

describe('AutomatedEmailSystem', () => {
  it('renders email system interface', () => {
    render(<AutomatedEmailSystem />)
    expect(screen.getByText(/Email System/i)).toBeInTheDocument()
  })

  it('displays email templates', () => {
    render(<AutomatedEmailSystem />)
    expect(screen.getByText(/Templates/i)).toBeInTheDocument()
  })
}) 