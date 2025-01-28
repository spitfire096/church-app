'use strict';

export const emailTemplates = {
  newFirstTimer: (data: any) => ({
    subject: 'New First Timer Registration',
    html: `
      <h2>New First Timer Registration</h2>
      <p>A new first timer has registered:</p>
      <ul>
        <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Phone:</strong> ${data.phoneNumber}</li>
        <li><strong>Service Date:</strong> ${new Date(data.serviceDate).toLocaleDateString()}</li>
      </ul>
    `,
  }),

  weeklyReport: (data: any) => ({
    subject: 'Weekly First Timers Report',
    html: `
      <h2>Weekly First Timers Report</h2>
      <p>Here's your weekly summary:</p>
      <ul>
        <li><strong>Total New First Timers:</strong> ${data.totalNew}</li>
        <li><strong>Visiting Members:</strong> ${data.visitingMembers}</li>
        <li><strong>Students:</strong> ${data.students}</li>
      </ul>
      <p>View detailed report in the dashboard.</p>
    `,
  }),
}; 