'use client';

import { useState, useEffect } from 'react';
import { Person } from '@/types';
import { PersonRow } from '@/components/PersonRow';
import { AddEditPersonDialog } from '@/components/AddEditPersonDialog';
import { AddEditProjectDialog } from '@/components/AddEditProjectDialog';
import { AddEditAssignmentDialog } from '@/components/AddEditAssignmentDialog';
import { useCalendarStore } from '@/stores/calendarStore';
import { getWeekInfo } from '@/utils/calendarUtils';

export default function Home() {
  const { people, projects, assignments, updateAssignment, addAssignment, selectedWeek, goToPreviousWeek, goToNextWeek, goToToday, loadData, deleteAssignment, updateProject, updateProjectColor, deletePerson, deleteProject, syncWithKimai, syncKimaiUsers, syncKimaiProjects, savedFilters, saveFilter, deleteFilter } = useCalendarStore();

  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'view-users' | 'edit-projects'>('home' as 'home' | 'view-users' | 'edit-projects');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedProjectForColor, setSelectedProjectForColor] = useState<string | null>(null);
  const [showDeletePersonDialog, setShowDeletePersonDialog] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  const [showInvisible, setShowInvisible] = useState(true);
  const [showDisabledUsers, setShowDisabledUsers] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weeksInfo = getWeekInfo(selectedWeek, 8);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Check for existing admin cookie on load
  useEffect(() => {
    const checkAdminCookie = () => {
      try {
        const adminCookie = document.cookie.includes('admin=true');
        if (adminCookie) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin cookie:', error);
      }
    };
    
    // Check cookie on component mount
    checkAdminCookie();
  }, []);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>(people);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  
  // Search results - only show enabled users
  const searchResults = people.filter(person => 
    person.enabled !== false && person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Apply filters when search query or selected people change
  useEffect(() => {
    // Filter out disabled users by default
    const activePeople = people.filter(person => person.enabled !== false);
    
    if (selectedPeople.length === 0) {
      setFilteredPeople(activePeople);
    } else {
      setFilteredPeople(activePeople.filter(person => selectedPeople.includes(person.id)));

    }
  }, [selectedPeople, people]);
  
  // Handle admin login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'Propelland';
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Facecloth-Catnap-Produce4';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set admin cookie with 1 week expiration
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `admin=true; expires=${expires.toUTCString()}; path=/;`;
      
      setIsAdmin(true);
      setShowLoginDialog(false);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };
  
  // Handle admin logout
  const handleLogout = () => {
    // Remove admin cookie
    document.cookie = 'admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAdmin(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handlePercentageChange = (assignmentId: string, percentage: number) => {
    updateAssignment(assignmentId, { percentage });
  };

  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#22C55E', // Emerald
    '#FACC15', // Amber
    '#FB7185', // Rose
    '#A78BFA', // Violet
    '#34D399', // Light Green
    '#60A5FA', // Light Blue
    '#A3A3A3', // Light Gray
    '#94A3B8', // Slate
  ];

  const handleColorSelect = (color: string) => {
    if (selectedProjectForColor) {
      updateProjectColor(selectedProjectForColor, color);
      setShowColorPicker(false);
      setSelectedProjectForColor(null);
    }
  };

  const handleDeletePersonConfirm = () => {
    console.log('handleDeletePersonConfirm called with personToDelete:', personToDelete);
    if (personToDelete) {
      deletePerson(personToDelete);
      setShowDeletePersonDialog(false);
      setPersonToDelete(null);
    }
  };

  const handleDeletePersonCancel = () => {
    setShowDeletePersonDialog(false);
    setPersonToDelete(null);
  };


  const renderHomeView = () => (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Project Manager
        </h1>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousWeek}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ‹ Previous
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Next ›
            </button>
            <span className="text-gray-700">
              Week of {selectedWeek.toLocaleDateString('en-US')} to {new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}
            </span>
          </div>
          <div>
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Admin
              </button>
            )}
          </div>
        </div>

         <div className="mb-6 flex space-x-4">
          {isAdmin && (
            <>
              <button
                onClick={() => setAssignmentDialogOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Assignment
              </button>
               <button
                onClick={() => setCurrentView('view-users')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                View Users
              </button>
              <button
                onClick={() => setCurrentView('edit-projects')}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                View Projects
              </button>

              <button
                onClick={syncWithKimai}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Sync with Kimai
              </button>

            </>
          )}
        </div>

         <div className="flex space-x-6">
          <div className="flex-1">
            {/* Header */}
            <div className="mb-4 flex">
              <div className="w-48 p-2 font-semibold text-gray-700 bg-gray-100 border rounded">Person</div>
              {weeksInfo.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className={`flex-1 p-2 text-center font-semibold text-gray-700 bg-gray-100 border rounded ${weekIndex < 7 ? 'ml-1' : ''}`}
                >
                  <div className="text-sm">Week {week.weekNumber}</div>
                  <div className="text-xs">{week.displayDate}</div>
                </div>
              ))}
            </div>

            {/* Person rows */}
            <div className="space-y-4">
              {filteredPeople.map((person) => {
                const personAssignments = assignments.filter(
                  (assignment) => assignment.personId === person.id
                );
                return (
                  <PersonRow
                    key={person.id}
                    person={person}
                    assignments={personAssignments}
                    weeksInfo={weeksInfo}
                    onPercentageChange={handlePercentageChange}
                    onDeleteAssignment={deleteAssignment}
                    onAddAssignment={addAssignment}
                    isViewOnly={!isAdmin}
                  />
                );
              })}
            </div>
          </div>
          <div className="sticky top-8 h-fit w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Filter People</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPeople.includes(person.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPeople([...selectedPeople, person.id]);
                        } else {
                          setSelectedPeople(selectedPeople.filter(id => id !== person.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label className="text-sm text-gray-700 flex-1">{person.name}</label>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">No matching people</div>
                )}
              </div>

              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">Saved Filters</h4>
                  </div>
                  <div className="space-y-1">
                    {savedFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        <button
                          onClick={() => {
                            setSelectedPeople(filter.personIds);
                            setFilteredPeople(people.filter(person => filter.personIds.includes(person.id)));
                          }}
                          className="text-sm text-gray-700 hover:text-blue-600 text-left flex-1"
                        >
                          {filter.name}
                        </button>
                        <button
                          onClick={() => deleteFilter(filter.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Actions */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setSelectedPeople([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    if (selectedPeople.length === 0) {
                      // If no one selected, show all
                      setFilteredPeople(people);
                    } else {
                      // Show only selected people
                      setFilteredPeople(people.filter(person => selectedPeople.includes(person.id)));
                    }
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>

              {/* Save Filter Button */}
              {selectedPeople.length > 0 && (
                <button
                  onClick={() => {
                    setNewFilterName('');
                    setSaveFilterDialogOpen(true);
                  }}
                  className="mt-2 w-full px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Save Filter
                </button>
              )}

            </div>
          </div>
        </div>

        <AddEditPersonDialog
          isOpen={personDialogOpen}
          onClose={() => setPersonDialogOpen(false)}
        />
        <AddEditProjectDialog
          isOpen={projectDialogOpen}
          onClose={() => setProjectDialogOpen(false)}
        />
        <AddEditAssignmentDialog
          isOpen={assignmentDialogOpen}
          onClose={() => setAssignmentDialogOpen(false)}
        />

        {/* Save Filter Dialog */}
        {saveFilterDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Save Filter</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Name
                </label>
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter filter name (e.g., Design Team)"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSaveFilterDialogOpen(false)}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newFilterName.trim()) {
                      saveFilter(newFilterName.trim(), selectedPeople);
                      setSaveFilterDialogOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Login Dialog */}
        {showLoginDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Admin Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter password"
                    required
                  />
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm mb-4">{loginError}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginDialog(false);
                      setLoginError('');
                    }}
                    className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderViewUsersView = () => {
    // Check if user is admin before rendering edit-persons view
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-8">You need to be an admin to access this page.</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

     return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
           <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">View Users</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDisabledUsers(!showDisabledUsers)}
                className={`px-4 py-2 rounded-md hover:bg-gray-700 ${showDisabledUsers ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                {showDisabledUsers ? 'Hide Disabled' : 'Show All'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Users List</h2>
              <button
                onClick={syncKimaiUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sync Users
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {people.filter(person => showDisabledUsers || person.enabled).map((person) => (
                <div key={person.id} className="p-6 hover:bg-gray-50 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={person.name}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={person.enabled}
                            disabled
                            className="w-4 h-4 text-gray-400 rounded bg-gray-200"
                          />
                          <span className={`text-sm ${person.enabled ? 'text-gray-700' : 'text-gray-500'}`}>
                            {person.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditProjectsView = () => {
    // Check if user is admin before rendering edit-projects view
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-8">You need to be an admin to access this page.</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }



    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">View Projects</h1>
             <div className="flex space-x-2">
              <button
                onClick={() => setShowInvisible(!showInvisible)}
                className={`px-4 py-2 rounded-md hover:bg-gray-700 ${showInvisible ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                {showInvisible ? 'Hide Invisible' : 'Show All'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Projects List</h2>
              <button
                onClick={syncKimaiProjects}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Sync Projects
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.filter(project => showInvisible || project.visible).map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 relative group">
                   <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-3 gap-4 mr-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={project.name}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-900"
                        />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                        <input
                          type="text"
                          value={project.customer || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-900"
                        />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visible</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={project.visible}
                            onChange={(e) => updateProject(project.id, { visible: e.target.checked })}
                            disabled={true}
                            className={`rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${!project.visible ? 'opacity-50 cursor-not-allowed' : 'opacity-50 cursor-not-allowed'}`}
                          />
                          <span className={`ml-2 text-sm ${!project.visible ? 'text-gray-400' : 'text-gray-700'}`}>
                            {project.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete button - appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete project button clicked for project:', project.id);
                      deleteProject(project.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                    title="Delete project"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'view-users') {
    return (
      <>
        {renderViewUsersView()}

        {/* Add Person Dialog */}
        <AddEditPersonDialog
          isOpen={personDialogOpen}
          onClose={() => setPersonDialogOpen(false)}
        />

        {/* Delete Person Confirmation Dialog */}
        {showDeletePersonDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Delete Person</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this person? This will also delete all their assignments and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeletePersonCancel}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Delete button clicked in dialog');
                    handleDeletePersonConfirm();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Choose Color</h3>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setSelectedProjectForColor(null);
                  }}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentView === 'edit-projects') {
    return (
      <>
        {renderEditProjectsView()}

        {/* Add Project Dialog */}
        <AddEditProjectDialog
          isOpen={projectDialogOpen}
          onClose={() => setProjectDialogOpen(false)}
        />

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Choose Color</h3>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setSelectedProjectForColor(null);
                  }}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return renderHomeView();
}
