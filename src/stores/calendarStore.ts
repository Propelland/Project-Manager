import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Person, Project, Assignment } from '@/types';
import { snapToWeek } from '@/utils/calendarUtils';

const API_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
};

// Helper function to check if two assignments overlap in time
function assignmentsOverlap(assignment1: Omit<Assignment, 'id'>, assignment2: Omit<Assignment, 'id'>): boolean {
  // Convert dates to Date objects if they are strings
  const getDate = (date: Date | string): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  };

  const start1 = getDate(assignment1.startDate).getTime();
  const end1 = getDate(assignment1.endDate).getTime();
  const start2 = getDate(assignment2.startDate).getTime();
  const end2 = getDate(assignment2.endDate).getTime();

  return start1 <= end2 && start2 <= end1;
}

// Helper function to split an assignment into weekly segments
function splitAssignmentIntoWeeks(assignment: Omit<Assignment, 'id'>): Omit<Assignment, 'id'>[] {
  const { startDate, endDate, ...rest } = assignment;
  const weeklyAssignments: Omit<Assignment, 'id'>[] = [];

  // Convert dates to Date objects if they are strings
  const getDate = (date: Date | string): Date => {
    return typeof date === 'string' ? new Date(date) : date;
  };

  // The dates from the dialog are already in ISO week format (Monday to Sunday),
  // so we can directly use them without any modification
  const dialogStart = new Date(getDate(startDate).getTime());
  dialogStart.setHours(0, 0, 0, 0);
  const dialogEnd = new Date(getDate(endDate).getTime());
  dialogEnd.setHours(0, 0, 0, 0);

  // Check if assignment is already a single week
  const durationInDays = Math.ceil((dialogEnd.getTime() - dialogStart.getTime()) / (1000 * 60 * 60 * 24));
  if (durationInDays <= 7) {
    weeklyAssignments.push({
      ...rest,
      startDate: dialogStart,
      endDate: dialogEnd,
    });
    return weeklyAssignments;
  }

  // Split into weekly assignments
  let currentStart = new Date(dialogStart);
  const maxIterations = 53; // Maximum number of weeks in a year to prevent infinite loop
  let iterationCount = 0;
  
  while (currentStart <= dialogEnd && iterationCount < maxIterations) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);
    currentEnd.setHours(0, 0, 0, 0);

    // If the week ends after the assignment's end date, use the assignment's end date
    if (currentEnd > dialogEnd) {
      currentEnd.setTime(dialogEnd.getTime());
    }

    // Add the weekly assignment
    weeklyAssignments.push({
      ...rest,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
    });

    // Move to the next week (Monday)
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentEnd.getDate() + 1);
    currentStart.setHours(0, 0, 0, 0);
    
    iterationCount++;
  }

  return weeklyAssignments;
}

// Custom reviver to convert date strings back to Date objects
const dateReviver = (key: string, value: unknown) => {
  if (key === 'startDate' || key === 'endDate' || key === 'selectedWeek') {
    return typeof value === 'string' ? new Date(value) : value;
  }
  return value;
};

interface CalendarState {
  people: Person[];
  projects: Project[];
  assignments: Assignment[];
  selectedWeek: Date;
  savedFilters: { id: string; name: string; personIds: string[] }[];
  // personId -> weekStart (YYYY-MM-DD) -> PTO percentage
  vacations: Record<string, Record<string, number>>;
}

interface CalendarActions {
  addPerson: (person: Omit<Person, 'id'>) => Promise<void>;
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id'>>) => void;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  saveFilter: (name: string, personIds: string[]) => void;
  deleteFilter: (filterId: string) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  updateProjectColor: (id: string, color: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id'>>) => void;
  deleteAssignment: (id: string) => void;
  deletePerson: (id: string) => void;
  deleteProject: (id: string) => void;
  getPersonCapacity: (personId: string) => number;
  validateCapacity: (personId: string, additionalPercentage?: number, startDate?: Date, endDate?: Date) => boolean;
  setSelectedWeek: (week: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  loadData: () => Promise<void>;
  saveAllData: () => Promise<void>;
  syncWithKimai: () => Promise<void>;
  syncKimaiUsers: () => Promise<void>;
  syncKimaiProjects: () => Promise<void>;
  testKimaiConnection: () => Promise<boolean>;
}

export const useCalendarStore = create<CalendarState & CalendarActions>()(
  persist(
    (set, get) => ({
      selectedWeek: snapToWeek(new Date()),
      vacations: {},
      people: [],
      savedFilters: [],
  projects: [],
  assignments: [],
  addPerson: async (person) => {
    const newPerson = { ...person, id: Date.now().toString() };
    set((state) => ({
      people: [...state.people, newPerson],
    }));

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ name: person.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add person to CSV');
      }
    } catch (error) {
      console.error('Error adding person to CSV:', error);
      // Revert the addition
      set((state) => ({
        people: state.people.filter(p => p.id !== newPerson.id),
      }));
    }
  },
  updatePerson: (id, updates) => set((state) => ({
    people: state.people.map(p => p.id === id ? { 
      ...p, 
      ...updates 
    } : p),
  })),
  addProject: async (project) => {
    const newProject = { 
      ...project, 
      id: Date.now().toString(),
      visible: project.visible !== undefined ? project.visible : true
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ 
          name: project.name,
          visible: project.visible 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add project to CSV');
      }
    } catch (error) {
      console.error('Error adding project to CSV:', error);
      // Revert the addition
      set((state) => ({
        projects: state.projects.filter(p => p.id !== newProject.id),
      }));
    }
  },
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  updateProjectColor: (id, color) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, color } : p),
  })),
  addAssignment: async (assignment: Omit<Assignment, 'id'>) => {
    console.log('addAssignment called with:', assignment);

    // Split assignment into weekly segments
    const weeklyAssignments = splitAssignmentIntoWeeks(assignment);
    console.log('Split into weekly assignments:', weeklyAssignments);

    // Check for existing assignments with the same projectId in the same week
    const state = get();
    
    // Normalize weekly assignments to UTC for comparison with database assignments
    const normalizedWeeklyAssignments = weeklyAssignments.map(weekly => ({
      ...weekly,
      startDate: new Date(Date.UTC(
        weekly.startDate.getFullYear(),
        weekly.startDate.getMonth(),
        weekly.startDate.getDate(),
        0, 0, 0, 0
      )),
      endDate: new Date(Date.UTC(
        weekly.endDate.getFullYear(),
        weekly.endDate.getMonth(),
        weekly.endDate.getDate(),
        0, 0, 0, 0
      ))
    }));
    
    const existingAssignments = normalizedWeeklyAssignments.filter(weeklyAssignment => {
      const existing = state.assignments.find(a => 
        a.personId === weeklyAssignment.personId && 
        a.projectId === weeklyAssignment.projectId && 
        assignmentsOverlap(weeklyAssignment, a)
      );
      return existing;
    });

    if (existingAssignments.length > 0) {
      console.warn('Cannot add the same project twice in the same week');
      return;
    }

    // Check capacity for each week before adding
    const isValid = weeklyAssignments.every(weeklyAssignment => {
      return get().validateCapacity(weeklyAssignment.personId, weeklyAssignment.percentage, weeklyAssignment.startDate, weeklyAssignment.endDate);
    });

    if (!isValid) {
      console.warn('Capacity limit exceeded, assignment not added');
      return;
    }

    // Save all weekly assignments to database first to get real IDs
    const savedAssignments: Assignment[] = [];
    try {
      for (const weeklyAssignment of weeklyAssignments) {
        // Normalize dates to UTC start of day (00:00:00)
        const startDate = new Date(Date.UTC(
          weeklyAssignment.startDate.getFullYear(),
          weeklyAssignment.startDate.getMonth(),
          weeklyAssignment.startDate.getDate(),
          0, 0, 0, 0
        ));
        
        const endDate = new Date(Date.UTC(
          weeklyAssignment.endDate.getFullYear(),
          weeklyAssignment.endDate.getMonth(),
          weeklyAssignment.endDate.getDate(),
          0, 0, 0, 0
        ));
        
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({
            personId: weeklyAssignment.personId,
            projectId: weeklyAssignment.projectId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            percentage: weeklyAssignment.percentage,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add assignment to database');
        }
        
        const savedAssignment = await response.json();
        savedAssignments.push(savedAssignment);
        console.log('Saved assignment with ID:', savedAssignment.id);
      }
      
      // Add to store only after all have been saved successfully
      set((state) => ({
        assignments: [...state.assignments, ...savedAssignments],
      }));
      
    } catch (error) {
      console.error('Error adding assignment to database:', error);
      // Revert - but since we didn't add to store yet, just return
      return;
    }
  },
  updateAssignment: async (id: string, updates: Partial<Omit<Assignment, 'id'>>) => {
    const state = get();
    const updatedAssignments = state.assignments.map(a => a.id === id ? { ...a, ...updates } : a);
    const updatedAssignment = updatedAssignments.find(a => a.id === id);
    if (updatedAssignment && !state.validateCapacity(updatedAssignment.personId)) {
      console.warn('Capacity limit exceeded, assignment not updated');
      return;
    }

    set({
      assignments: updatedAssignments,
    });

    // Save all assignments to CSV after update
    try {
      const assignmentsResponse = await fetch('/api/assignments', {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify({
          assignments: updatedAssignments.map(a => ({
            personId: a.personId,
            projectId: a.projectId,
            startDate: a.startDate instanceof Date && !isNaN(a.startDate.getTime()) ? a.startDate.toISOString() : a.startDate,
            endDate: a.endDate instanceof Date && !isNaN(a.endDate.getTime()) ? a.endDate.toISOString() : a.endDate,
            percentage: a.percentage,
            layer: a.layer, // Include layer information when saving
          }))
        }),
      });

      if (!assignmentsResponse.ok) {
        throw new Error('Failed to save assignments');
      }
    } catch (error) {
      console.error('Error saving assignments after update:', error);
    }
  },
  getPersonCapacity: (personId: string) => {
    const state = get();
    const weekStart = state.selectedWeek;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 1 week - 1 day

    // Normalize dates to start of day for consistent comparison
    const normalizeToStartOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const normalizedWeekStart = normalizeToStartOfDay(weekStart);
    const normalizedWeekEnd = normalizeToStartOfDay(weekEnd);

    const relevantAssignments = state.assignments
      .filter((assignment: Assignment) => assignment.personId === personId)
      .filter((assignment: Assignment) => {
        const normalizedStart = normalizeToStartOfDay(assignment.startDate);
        const normalizedEnd = normalizeToStartOfDay(assignment.endDate);
        const overlaps = normalizedStart <= normalizedWeekEnd && normalizedEnd >= normalizedWeekStart;
        return overlaps;
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
    
    return maxDailyCapacity;
  },
  validateCapacity: (personId: string, additionalPercentage: number = 0, startDate?: Date, endDate?: Date) => {
    const state = get();
    
    // If start and end dates are provided, check capacity for the entire assignment duration
    if (startDate && endDate) {
      const normalizeToStartOfDay = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const normalizedStart = normalizeToStartOfDay(startDate);
      const normalizedEnd = normalizeToStartOfDay(endDate);
      
      // Check capacity for each day in the assignment duration
      const currentDate = new Date(normalizedStart);
      while (currentDate <= normalizedEnd) {
        const dayCapacity = state.assignments.reduce((sum: number, assignment: Assignment) => {
          if (assignment.personId === personId) {
            const aStart = normalizeToStartOfDay(assignment.startDate);
            const aEnd = normalizeToStartOfDay(assignment.endDate);
            
            if (currentDate >= aStart && currentDate <= aEnd) {
              sum += assignment.percentage;
            }
          }
          return sum;
        }, 0);

        if (dayCapacity + additionalPercentage > 150) {
          console.warn(`Capacity limit exceeded on ${currentDate.toISOString().split('T')[0]}: ${dayCapacity} + ${additionalPercentage} = ${dayCapacity + additionalPercentage}%`);
          return false;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return true;
    }

    // Fallback to checking only the currently selected week if no dates provided
    const currentCapacity = state.getPersonCapacity(personId);
    return currentCapacity + additionalPercentage <= 150;
  },
  setSelectedWeek: (week: Date) => set({ selectedWeek: snapToWeek(week) }),
  goToPreviousWeek: () => set((state) => {
    const prevWeek = new Date(state.selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    return { selectedWeek: prevWeek };
  }),
  goToNextWeek: () => set((state) => {
    const nextWeek = new Date(state.selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return { selectedWeek: nextWeek };
  }),
  goToToday: () => set({ selectedWeek: snapToWeek(new Date()) }),
  saveFilter: async (name: string, personIds: string[]) => {
    try {
      const response = await fetch('/api/filters', {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ name, personIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save filter');
      }
      
      const newFilter = await response.json();
      set((state) => ({
        savedFilters: [...state.savedFilters, newFilter],
      }));
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  },
  deleteFilter: async (filterId: string) => {
    try {
      const response = await fetch('/api/filters', {
        method: 'DELETE',
        headers: API_HEADERS,
        body: JSON.stringify({ id: filterId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete filter');
      }
      
      set((state) => ({
        savedFilters: state.savedFilters.filter((f) => f.id !== filterId),
      }));
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  },
    loadData: async () => {
      try {
        // Load projects
        const projectsResponse = await fetch('/api/projects', {
          headers: API_HEADERS
        });
        const projectsData = await projectsResponse.json();

        // Load users
        const usersResponse = await fetch('/api/users', {
          headers: API_HEADERS
        });
        const usersData = await usersResponse.json();

        // Load assignments
        const assignmentsResponse = await fetch('/api/assignments', {
          headers: API_HEADERS
        });
        const assignmentsData = await assignmentsResponse.json();

        // Load filters
        const filtersResponse = await fetch('/api/filters', {
          headers: API_HEADERS
        });
        const filtersData = await filtersResponse.json();

        // Load vacations from Kimai
        const vacationsResponse = await fetch('/api/absences', { headers: API_HEADERS });
        const vacationsData = await vacationsResponse.json();

        // Convert assignment dates from strings to Date objects
        const parsedAssignments = (assignmentsData.assignments || []).map((assignment: {
          startDate: string;
          endDate: string;
          [key: string]: unknown;
        }) => ({
          ...assignment,
          startDate: new Date(assignment.startDate),
          endDate: new Date(assignment.endDate)
        }));

        set({
          people: (usersData.users as Person[] || []).sort((a: Person, b: Person) => a.name.localeCompare(b.name)),
          projects: (projectsData.projects as Project[] || []).sort((a: Project, b: Project) => a.name.localeCompare(b.name)),
          assignments: parsedAssignments,
          savedFilters: filtersData.filters || [],
          vacations: vacationsData.vacations || {},
        });
      } catch (error) {
        console.error('Error loading data from database:', error);
      }
    },
   deleteAssignment: async (id) => {
    console.log('deleteAssignment called with id:', id);
    const state = get();
    const assignmentToDelete = state.assignments.find(a => a.id === id);
    if (!assignmentToDelete) {
      console.log('Assignment not found:', id);
      return;
    }

    console.log('Deleting assignment:', assignmentToDelete);
    set((state) => ({
      assignments: state.assignments.filter(a => a.id !== id),
    }));

    try {
      const response = await fetch('/api/assignments', {
        method: 'DELETE',
        headers: API_HEADERS,
        body: JSON.stringify({ id }),
      });

      console.log('Delete API response status:', response.status);
      console.log('Delete API response:', await response.text());

      if (!response.ok) {
        throw new Error('Failed to delete assignment from CSV');
      }
    } catch (error) {
      console.error('Error deleting assignment from CSV:', error);
      // Revert the deletion
      set((state) => ({
        assignments: [...state.assignments, assignmentToDelete],
      }));
    }
  },
  deletePerson: (id) => {
    console.log('deletePerson called with id:', id);
    const state = get();
    const personToDelete = state.people.find(p => p.id === id);
    if (!personToDelete) {
      console.log('Person not found:', id);
      return;
    }

    console.log('Deleting person:', personToDelete);
    // Remove all assignments for this person
    const updatedAssignments = state.assignments.filter(a => a.personId !== id);

    set((state) => ({
      people: state.people.filter(p => p.id !== id),
      assignments: updatedAssignments,
    }));
  },
  deleteProject: (id) => {
    console.log('deleteProject called with id:', id);
    const state = get();
    const projectToDelete = state.projects.find(p => p.id === id);
    if (!projectToDelete) {
      console.log('Project not found:', id);
      return;
    }

    console.log('Deleting project:', projectToDelete);
    // Remove all assignments for this project
    const updatedAssignments = state.assignments.filter(a => a.projectId !== id);

    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      assignments: updatedAssignments,
    }));
  },
   saveAllData: async () => {
    const state = get();
    try {
      // Save users
      const usersResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify({ users: state.people }),
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to save users');
      }

      // Save projects
      const projectsResponse = await fetch('/api/projects', {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify({
          projects: state.projects.map(p => ({
            id: p.id,
            name: p.name,
            color: p.color,
          }))
        }),
      });

      if (!projectsResponse.ok) {
        throw new Error('Failed to save projects');
      }

      // Save assignments
      const assignmentsResponse = await fetch('/api/assignments', {
        method: 'PUT',
        headers: API_HEADERS,
        body: JSON.stringify({
          assignments: state.assignments.map(a => ({
            personId: a.personId,
            projectId: a.projectId,
            startDate: a.startDate instanceof Date && !isNaN(a.startDate.getTime()) ? a.startDate.toISOString() : a.startDate,
            endDate: a.endDate instanceof Date && !isNaN(a.endDate.getTime()) ? a.endDate.toISOString() : a.endDate,
            percentage: a.percentage,
          }))
        }),
      });

      if (!assignmentsResponse.ok) {
        throw new Error('Failed to save assignments');
      }

      console.log('All data saved successfully');
    } catch (error) {
      console.error('Error saving all data:', error);
    }
  },
  syncWithKimai: async () => {
    console.log('Starting synchronization with Kimai database...');
    try {
      const response = await fetch('/api/kimai/sync', {
        method: 'POST',
        headers: API_HEADERS,
      });
      
      if (!response.ok) {
        throw new Error('Failed to synchronize with Kimai');
      }

      const data = await response.json();
      console.log('Kimai synchronization completed:', data);

      // Update store with synchronized data
      set({
        people: (data.users.data as Person[]).sort((a, b) => a.name.localeCompare(b.name)),
        projects: (data.projects.data as Project[]).sort((a, b) => a.name.localeCompare(b.name)),
      });

    } catch (error) {
      console.error('Error synchronizing with Kimai:', error);
    }
  },
  syncKimaiUsers: async () => {
    console.log('Starting Kimai users synchronization...');
    try {
      const response = await fetch('/api/kimai/users', {
        method: 'POST',
        headers: API_HEADERS,
      });
      
      if (!response.ok) {
        throw new Error('Failed to synchronize Kimai users');
      }

      const data = await response.json();
      console.log('Kimai users synchronization completed:', data);

      // Update store with synchronized users
      set({
        people: (data.users as Person[]).sort((a, b) => a.name.localeCompare(b.name)),
      });

    } catch (error) {
      console.error('Error synchronizing Kimai users:', error);
    }
  },
  syncKimaiProjects: async () => {
    console.log('Starting Kimai projects synchronization...');
    try {
      const response = await fetch('/api/kimai/projects', {
        method: 'POST',
        headers: API_HEADERS,
      });
      
      if (!response.ok) {
        throw new Error('Failed to synchronize Kimai projects');
      }

      const data = await response.json();
      console.log('Kimai projects synchronization completed:', data);

      // Update store with synchronized projects
      set({
        projects: (data.projects as Project[]).sort((a, b) => a.name.localeCompare(b.name)),
      });

    } catch (error) {
      console.error('Error synchronizing Kimai projects:', error);
    }
  },
  testKimaiConnection: async () => {
    try {
      const response = await fetch('/api/kimai/sync', {
        headers: API_HEADERS
      });
      return response.ok;
    } catch (error) {
      console.error('Error testing Kimai connection:', error);
      return false;
    }
  },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: dateReviver,
      }),
      partialize: (state) => ({
        selectedWeek: state.selectedWeek,
      }),
    }
  )
);