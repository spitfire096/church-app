import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    }
  },
  useParams() {
    return {}
  },
}))

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

// Add TextEncoder/TextDecoder to global
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any 