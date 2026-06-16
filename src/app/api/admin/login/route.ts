import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Use environment variable or a secure default for development
    const securePassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (password === securePassword) {
      // Set admin session cookie with 1 week expiration
      const response = NextResponse.json({ success: true });
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      response.cookies.set('admin', 'true', {
        expires,
        path: '/',
        sameSite: 'strict',
        httpOnly: false, // Need to be accessible from client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      });
      
      return response;
    }
    
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
