'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  // Helper function to get cookie value - simple and reliable
  const getCookie = (name: string) => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const part = parts.pop();
        if (part) {
          return part.split(';').shift();
        }
      }
    } catch (error) {
      console.error('Error getting cookie:', error);
    }
    return null;
  };

  useEffect(() => {
    // Check if user is authenticated
    const isAdmin = getCookie('admin');
    
    if (isAdmin !== 'true') {
      // Redirect to login if not authenticated
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    // Remove admin cookie
    document.cookie = 'admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage People</h2>
            <p className="text-gray-600 mb-4">Add, edit, or delete people from the system</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Manage People
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Projects</h2>
            <p className="text-gray-600 mb-4">Add, edit, or delete projects from the system</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Manage Projects
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">View Reports</h2>
            <p className="text-gray-600 mb-4">Generate reports on capacity and assignments</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Generate Reports
            </button>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Reset System
            </button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              Backup Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
