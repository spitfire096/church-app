import { NextRequest, NextResponse } from 'next/server';

// Mock database
let mockFirstTimers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    gender: "male",
    postalCode: "12345",
    isStudent: false,
    isBornAgain: true,
    bornAgainDate: "2020-01-01",
    isWaterBaptized: true,
    waterBaptismDate: "2020-02-01",
    prayerRequest: "Prayer for family",
    serviceDate: "2024-03-17",
    status: "new"
  }
];

export const dynamic = 'force-dynamic'; // Disable static optimization

export async function GET() {
  try {
    return NextResponse.json(mockFirstTimers, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create new first timer with all fields
    const newFirstTimer = {
      id: Date.now(),
      ...data,
      status: 'new'
    };

    // Add to mock database
    mockFirstTimers = [...mockFirstTimers, newFirstTimer];
    
    return NextResponse.json(newFirstTimer, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Failed to create first timer' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 