
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    console.log("Received support request:", { name, email, message });

    // THIS IS WHERE YOU WOULD INTEGRATE WITH A BACKEND EMAIL SERVICE
    // For example, calling a Firebase Function:
    /*
    const firebaseFunctionUrl = 'YOUR_FIREBASE_FUNCTION_URL';
    const response = await fetch(firebaseFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email via Firebase Function.');
    }
    */
    
    // For now, we'll just simulate a success response.
    // In a real app, you would remove this simulation and use a real backend call.
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ success: true, message: 'Email sent successfully (simulated).' });

  } catch (error) {
    console.error('Error in /api/send-email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
