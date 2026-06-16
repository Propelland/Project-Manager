import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear admin cookie
    response.cookies.set('admin', '', {
      expires: new Date(0), // Expire immediately
      path: '/',
      sameSite: 'strict',
      httpOnly: false, // Need to be accessible from client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
