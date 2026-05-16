import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the current path
  const path = request.nextUrl.pathname;
  
  // Get user from localStorage (via cookie)
  const userCookie = request.cookies.get('lms_user');
  
  // Define role-based allowed paths
  const rolePaths = {
    student: ['/dashboard/student'],
    instructor: ['/dashboard/instructor', '/dashboard/student'], // Instructors can see student view too
    admin: ['/dashboard/admin', '/dashboard/instructor', '/dashboard/student'] // Admins can see everything
  };
  
  // Check if trying to access dashboard
  if (path.startsWith('/dashboard')) {
    // No user cookie at all
    if (!userCookie) {
      console.log('No user cookie, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    try {
      const user = JSON.parse(userCookie.value);
      const userRole = user.role;
      
      // Check if user has access to this path
      let hasAccess = false;
      
      if (path === '/dashboard/student' && rolePaths[userRole]?.includes('/dashboard/student')) {
        hasAccess = true;
      } else if (path === '/dashboard/instructor' && rolePaths[userRole]?.includes('/dashboard/instructor')) {
        hasAccess = true;
      } else if (path === '/dashboard/admin' && rolePaths[userRole]?.includes('/dashboard/admin')) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        console.log(`Access denied: ${userRole} tried to access ${path}`);
        // Redirect to their correct dashboard
        const correctPath = `/${userRole === 'student' ? 'dashboard/student' : userRole === 'instructor' ? 'dashboard/instructor' : 'dashboard/admin'}`;
        return NextResponse.redirect(new URL(correctPath, request.url));
      }
      
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',  // Protect all dashboard routes
  ],
};