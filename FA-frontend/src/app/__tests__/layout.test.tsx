import { render, screen } from '@testing-library/react'
import RootLayout from '../layout'

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const testContent = 'Test Content'
    render(
      <RootLayout>
        <div>{testContent}</div>
      </RootLayout>
    )
    
    expect(screen.getByText(testContent)).toBeInTheDocument()
    expect(document.querySelector('html')).toHaveAttribute('lang', 'en')
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