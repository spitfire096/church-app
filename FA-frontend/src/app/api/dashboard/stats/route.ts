import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // Add delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockStats = {
      totalFirstTimers: 125,
      recentFirstTimers: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          serviceDate: "2024-03-17"
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          serviceDate: "2024-03-17"
        }
      ],
      followUpStats: {
        pending: 15,
        inProgress: 8,
        completed: 102
      },
      upcomingTasks: [
        {
          id: 1,
          notes: "Follow up call scheduled",
          dueDate: "2024-03-24",
          firstTimer: {
            id: 1,
            firstName: "John",
            lastName: "Doe"
          }
        }
      ]
    };

    return NextResponse.json(mockStats, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 