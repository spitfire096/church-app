import { render } from '@testing-library/react'
import RootLayout from '../layout'

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter',
  }),
}))

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    )
    
    // Check if the content is rendered
    expect(container.querySelector('[data-testid="test-content"]')).toBeInTheDocument()
    
    // Check for html lang attribute
    const html = container.parentElement
    expect(html).toHaveAttribute('lang', 'en')
  })

  it('includes necessary meta tags', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )
    
    const viewport = document.querySelector('meta[name="viewport"]')
    expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1')
  })
}) 