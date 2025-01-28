import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable static optimization

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    // Mock data
    const mockFirstTimers = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        serviceDate: "2024-03-17",
        status: "new"
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "098-765-4321",
        serviceDate: "2024-03-17",
        status: "contacted"
      }
    ];

    return new NextResponse(JSON.stringify(mockFirstTimers), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Mock successful creation
    return NextResponse.json({ 
      ...data,
      id: Date.now(),
      status: 'new'
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Failed to create first timer' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 