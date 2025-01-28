import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const mockFollowUps = [
      {
        id: 1,
        firstTimer: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          serviceDate: "2024-03-17"
        },
        status: "pending",
        notes: "Initial follow-up needed",
        dueDate: "2024-03-24",
        assignedTo: "Admin User"
      },
      {
        id: 2,
        firstTimer: {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          phone: "098-765-4321",
          serviceDate: "2024-03-17"
        },
        status: "completed",
        notes: "Welcome call completed",
        dueDate: "2024-03-20",
        assignedTo: "Admin User"
      }
    ];

    return NextResponse.json(mockFollowUps);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 