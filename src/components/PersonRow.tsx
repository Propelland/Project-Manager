'use client';

import React, { useState } from 'react';
import { Person, Assignment } from '@/types';
import { WeekInfo } from '@/utils/calendarUtils';
import { useCalendarStore } from '@/stores/calendarStore';

interface PersonRowProps {
  person: Person;
  assignments: Assignment[];
  weeksInfo: WeekInfo[];
  onPercentageChange?: (assignmentId: string, percentage: number) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
  onAddAssignment?: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  isViewOnly?: boolean;
}

/**
 * PersonRow component displays a single person's row with weekly capacity colors
 * Follows Single Responsibility Principle: only handles person row display
 */
export const PersonRow: React.FC<PersonRowProps> = ({ person, assignments, weeksInfo, onPercentageChange, onDeleteAssignment, onAddAssignment, isViewOnly = false }) => {
  const projects = useCalendarStore((state) => state.projects);
  const vacations = useCalendarStore((state) => state.vacations);
  const [showDropdowns, setShowDropdowns] = useState<{ [weekIndex: number]: boolean }>({});
  const [addingAssignment, setAddingAssignment] = useState<{ [weekIndex: number]: boolean }>({});
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedPercentage, setSelectedPercentage] = useState(50);

  const getWeekPTO = (weekStart: Date): number => {
    const d = weekStart;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return vacations[person.id]?.[key] || 0;
  };

  // Calculate capacity for a specific week
  const getWeekCapacity = (weekStart: Date, weekEnd: Date): number => {
    // Normalize dates to start of day for consistent comparison
    const normalizeToStartOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const normalizedWeekStart = normalizeToStartOfDay(weekStart);
    const normalizedWeekEnd = normalizeToStartOfDay(weekEnd);

    const relevantAssignments = assignments.filter((assignment) => {
      const normalizedStart = normalizeToStartOfDay(assignment.startDate);
      const normalizedEnd = normalizeToStartOfDay(assignment.endDate);
      return normalizedStart <= normalizedWeekEnd && normalizedEnd >= normalizedWeekStart;
    });

    // Calculate maximum capacity on any single day of the week
    let maxDailyCapacity = 0;
    const currentDate = new Date(normalizedWeekStart);
    
    while (currentDate <= normalizedWeekEnd) {
      const dayCapacity = relevantAssignments.reduce((sum: number, assignment: Assignment) => {
        const normalizedStart = normalizeToStartOfDay(assignment.startDate);
        const normalizedEnd = normalizeToStartOfDay(assignment.endDate);
        
        if (currentDate >= normalizedStart && currentDate <= normalizedEnd) {
          return sum + assignment.percentage;
        }
        
        return sum;
      }, 0);
      
      if (dayCapacity > maxDailyCapacity) {
        maxDailyCapacity = dayCapacity;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return maxDailyCapacity + getWeekPTO(normalizedWeekStart);
  };

  // Get assignments for a specific week
  const getWeekAssignments = (weekStart: Date, weekEnd: Date): Assignment[] => {
    const normalizeToStartOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const normalizedWeekStart = normalizeToStartOfDay(weekStart);
    const normalizedWeekEnd = normalizeToStartOfDay(weekEnd);

    return assignments.filter((assignment) => {
      const normalizedStart = normalizeToStartOfDay(assignment.startDate);
      const normalizedEnd = normalizeToStartOfDay(assignment.endDate);
      return normalizedStart <= normalizedWeekEnd && normalizedEnd >= normalizedWeekStart;
    });
  };

  return (
    <div className="flex gap-1 items-center">
      {/* Person info */}
      <div className="w-48 p-3 bg-white border rounded-lg shadow-sm">
        <div className="font-medium text-gray-900">{person.name}</div>
      </div>

      {/* Weekly cells */}
      {weeksInfo.map((week, weekIndex) => {
        const capacity = getWeekCapacity(week.startDate, week.endDate);
        const weekAssignments = getWeekAssignments(week.startDate, week.endDate);
        const pto = getWeekPTO(week.startDate);
        
        return (
          <div key={weekIndex} className="flex-1 relative bg-gray-50 border rounded-lg p-1 group" style={{ 
            height: '64px'
          }}>
            {/* Hover tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-500 bg-opacity-90 text-white font-medium px-4 py-2 rounded-lg shadow-lg z-50 min-w-[150px] text-center pointer-events-none">
              {(weekAssignments.length > 0 || pto > 0) ? (
                <div className="space-y-1">
                  {pto > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex-1 text-left">🏖️ PTO</span>
                      <span className="ml-2 font-semibold">{pto}%</span>
                    </div>
                  )}
                  {weekAssignments.map((assignment) => {
                    const project = projects.find(p => p.id === assignment.projectId);
                    return (
                      <div key={assignment.id} className="flex justify-between items-center text-sm">
                        <span className="flex-1 text-left">{project?.customer || project?.name || 'Unknown Project'}</span>
                        <span className="ml-2 font-semibold">{assignment.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm">No assignments</div>
              )}
              {/* Arrow pointing up */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-500"></div>
            </div>
            
            {/* Week cell with color coding */}
            <div
              className={`w-full h-full rounded-lg cursor-pointer flex items-center justify-center transition-colors duration-200 ${
                capacity > 100 ? 'bg-red-600 hover:bg-red-700' :
                capacity < 50 ? 'bg-red-100 hover:bg-red-200' :
                capacity < 75 ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-green-100 hover:bg-green-200'
              }`}
              onClick={() => setShowDropdowns(prev => ({
                ...prev,
                [weekIndex]: !prev[weekIndex]
              }))}
            >
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  capacity > 100 ? 'text-white' : 'text-gray-800'
                }`}>{capacity}%</div>
                <div className={`text-xs ${
                  capacity > 100 ? 'text-white' : 'text-gray-600'
                }`}>
                  {capacity > 100 ? 'Overloaded' :
                   capacity < 50 ? 'Low' : 
                   capacity < 75 ? 'Medium' : 'High'}
                </div>
              </div>
            </div>

            {/* Pop-up with assignments */}
            {showDropdowns[weekIndex] && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold text-gray-900">Assignments - Week {week.weekNumber}</div>
                    <button
                      onClick={() => setShowDropdowns(prev => ({
                        ...prev,
                        [weekIndex]: false
                      }))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pto > 0 && (
                      <div className="p-3 bg-teal-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded bg-teal-400"></div>
                          <div className="text-sm text-gray-700">🏖️ PTO</div>
                        </div>
                        <div className="text-sm font-semibold text-teal-700">{pto}%</div>
                      </div>
                    )}
                    {weekAssignments.map((assignment) => {
                      const project = projects.find(p => p.id === assignment.projectId);
                      return (
                        <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-3 flex-1">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: project?.color || '#ccc' }}
                              ></div>
                              <div className="text-sm text-gray-700 flex-1">{project?.name || 'Unknown Project'}</div>
                            </div>
                            {!isViewOnly && (
                               <button
                                 onClick={() => {
                                   // If assignment spans multiple weeks, only remove it from current week
                                   const normalizedWeekStart = new Date(week.startDate);
                                   normalizedWeekStart.setUTCHours(0, 0, 0, 0);
                                   
                                   const normalizedWeekEnd = new Date(week.endDate);
                                   normalizedWeekEnd.setUTCHours(0, 0, 0, 0);
                                   
                                   const normalizedStart = new Date(assignment.startDate);
                                   normalizedStart.setUTCHours(0, 0, 0, 0);
                                   
                                   const normalizedEnd = new Date(assignment.endDate);
                                   normalizedEnd.setUTCHours(0, 0, 0, 0);
                                   
                                   // Check if assignment spans beyond current week
                                   const spansMultipleWeeks = normalizedStart < normalizedWeekStart || normalizedEnd > normalizedWeekEnd;
                                   
                                   if (spansMultipleWeeks) {
                                     // Create new assignments for weeks before and after current week
                                     if (normalizedStart < normalizedWeekStart) {
                                       const beforeWeekAssignment = {
                                         personId: assignment.personId,
                                         projectId: assignment.projectId,
                                         startDate: new Date(Date.UTC(normalizedStart.getFullYear(), normalizedStart.getMonth(), normalizedStart.getDate())),
                                         endDate: new Date(Date.UTC(normalizedWeekStart.getFullYear(), normalizedWeekStart.getMonth(), normalizedWeekStart.getDate() - 1)),
                                         percentage: assignment.percentage
                                       };
                                       if (onAddAssignment) {
                                         onAddAssignment(beforeWeekAssignment);
                                       }
                                     }
                                     
                                     if (normalizedEnd > normalizedWeekEnd) {
                                       const afterWeekAssignment = {
                                         personId: assignment.personId,
                                         projectId: assignment.projectId,
                                         startDate: new Date(Date.UTC(normalizedWeekEnd.getFullYear(), normalizedWeekEnd.getMonth(), normalizedWeekEnd.getDate() + 1)),
                                         endDate: new Date(Date.UTC(normalizedEnd.getFullYear(), normalizedEnd.getMonth(), normalizedEnd.getDate())),
                                         percentage: assignment.percentage
                                       };
                                       if (onAddAssignment) {
                                         onAddAssignment(afterWeekAssignment);
                                       }
                                     }
                                   }
                                   
                                   // Delete the original assignment
                                   onDeleteAssignment?.(assignment.id);
                                 }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isViewOnly ? (
                              <div className="w-20 px-2 py-1 text-sm border rounded bg-gray-100 text-gray-900 font-semibold">
                                {assignment.percentage}
                              </div>
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={assignment.percentage}
                                className="w-20 px-2 py-1 text-sm border rounded bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                  // If assignment spans multiple weeks, split it into individual week assignment
                                  const normalizedWeekStart = new Date(week.startDate);
                                  normalizedWeekStart.setUTCHours(0, 0, 0, 0);
                                  
                                  const normalizedWeekEnd = new Date(week.endDate);
                                  normalizedWeekEnd.setUTCHours(0, 0, 0, 0);
                                  
                                  const normalizedStart = new Date(assignment.startDate);
                                  normalizedStart.setUTCHours(0, 0, 0, 0);
                                  
                                  const normalizedEnd = new Date(assignment.endDate);
                                  normalizedEnd.setUTCHours(0, 0, 0, 0);
                                  
                                  // Check if assignment spans beyond current week
                                  const spansMultipleWeeks = normalizedStart < normalizedWeekStart || normalizedEnd > normalizedWeekEnd;
                                  
                                  if (spansMultipleWeeks) {
                                    // Split assignment for current week only
                                    const newPercentage = parseInt(e.target.value) || 0;
                                    const currentWeekAssignment = {
                                      personId: assignment.personId,
                                      projectId: assignment.projectId,
                                      startDate: new Date(Date.UTC(week.startDate.getFullYear(), week.startDate.getMonth(), week.startDate.getDate())),
                                      endDate: new Date(Date.UTC(week.endDate.getFullYear(), week.endDate.getMonth(), week.endDate.getDate())),
                                      percentage: newPercentage
                                    };
                                    
                                    // Create new assignments for weeks before and after current week
                                    if (normalizedStart < normalizedWeekStart) {
                                      const beforeWeekAssignment = {
                                        personId: assignment.personId,
                                        projectId: assignment.projectId,
                                        startDate: new Date(Date.UTC(normalizedStart.getFullYear(), normalizedStart.getMonth(), normalizedStart.getDate())),
                                        endDate: new Date(Date.UTC(normalizedWeekStart.getFullYear(), normalizedWeekStart.getMonth(), normalizedWeekStart.getDate() - 1)),
                                        percentage: assignment.percentage
                                      };
                                      if (onAddAssignment) {
                                        onAddAssignment(beforeWeekAssignment);
                                      }
                                    }
                                    
                                    if (normalizedEnd > normalizedWeekEnd) {
                                      const afterWeekAssignment = {
                                        personId: assignment.personId,
                                        projectId: assignment.projectId,
                                        startDate: new Date(Date.UTC(normalizedWeekEnd.getFullYear(), normalizedWeekEnd.getMonth(), normalizedWeekEnd.getDate() + 1)),
                                        endDate: new Date(Date.UTC(normalizedEnd.getFullYear(), normalizedEnd.getMonth(), normalizedEnd.getDate())),
                                        percentage: assignment.percentage
                                      };
                                      if (onAddAssignment) {
                                        onAddAssignment(afterWeekAssignment);
                                      }
                                    }
                                    
                                    // Delete original assignment
                                    onDeleteAssignment?.(assignment.id);
                                    
                                    // Add new assignment for current week
                                    if (onAddAssignment) {
                                      onAddAssignment(currentWeekAssignment);
                                    }
                                  } else {
                                    // Update percentage normally if assignment is only for this week
                                    onPercentageChange?.(assignment.id, parseInt(e.target.value) || 0);
                                }
                              }}
                            />
                            )}
                            <span className="text-sm text-gray-900 font-semibold">%</span>
                          </div>
                        </div>
                      );
                    })}
                    {weekAssignments.length === 0 && pto === 0 && (
                      <div className="p-6 text-sm text-gray-500 text-center bg-gray-50 rounded-lg">
                        No assignments
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    {!isViewOnly && addingAssignment[weekIndex] ? (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                          <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          >
                            <option value="">Select a project</option>
                            {projects.filter(project => project.visible).map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Percentage</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={selectedPercentage}
                            onChange={(e) => setSelectedPercentage(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setAddingAssignment(prev => ({ ...prev, [weekIndex]: false }));
                              setSelectedProject('');
                              setSelectedPercentage(50);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (selectedProject) {
                                const newAssignment = {
                                  personId: person.id,
                                  projectId: selectedProject,
                                  startDate: week.startDate,
                                  endDate: week.endDate,
                                  percentage: selectedPercentage
                                };
                                console.log('Adding assignment:', newAssignment);
                                onAddAssignment?.(newAssignment);
                                setAddingAssignment(prev => ({ ...prev, [weekIndex]: false }));
                                setSelectedProject('');
                                setSelectedPercentage(50);
                              }
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        {!isViewOnly && (
                          <button
                            onClick={() => setAddingAssignment(prev => ({ ...prev, [weekIndex]: true }))}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Add Assignment
                          </button>
                        )}
                        <button
                          onClick={() => setShowDropdowns(prev => ({
                            ...prev,
                            [weekIndex]: false
                          }))}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
