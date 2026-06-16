# Weekly Resource Calendar - MVP Iteration 5

A dynamic weekly calendar application built with Next.js 14+ and TypeScript, featuring drag-and-drop assignment management, resize functionality, inline editing, capacity calculation with visual indicators, local persistence, and week navigation with 4-week view.

## Features

- **4-Week Calendar View**: Displays 4 weeks starting from the selected week with navigation controls
- **Week Navigation**: Navigate to previous/next weeks or jump to current week with "Hoy" button
- **Person Management**: Add and edit people with name and role
- **Project Management**: Add and edit projects with name and color
- **Assignment Creation**: Manually create assignments by selecting person, project, date range, and percentage
- **Drag and Drop**: Move assignment bars horizontally between weeks with weekly snap
- **Resize Assignments**: Adjust assignment duration by dragging the right edge
- **Percentage Editing**: Click on assignment bars to edit percentage allocation inline
- **Collision Prevention**: Automatic validation prevents overlapping assignments for the same person
- **Weekly Snap**: Assignments snap to day boundaries for precise positioning
- **Person Rows**: Each person has their own row showing their role, assignments, and capacity indicators
- **Assignment Bars**: Visual representation of project assignments with percentage-based widths and colors, supporting multiple overlapping assignments through vertical stacking
- **Project Legend**: Sidebar displaying all projects with their corresponding colors for easy reference
- **Capacity Calculation**: Automatic calculation of weekly capacity per person based on assignment percentages
- **Visual Semaphore**: Progress bar with color-coded capacity indicators (green ≤100%, amber 100-120%, red >120%)
- **Local Persistence**: Automatic save/load of people, projects, and assignments in localStorage
- **Capacity Validation**: Prevents assignments that would exceed 150% capacity limit
- **Modular Architecture**: Built following SOLID principles with single-responsibility components and custom hooks
- **Dynamic Data**: Zustand store with actions for adding/updating entities and persistence
- **Form Validations**: Basic validations in all CRUD forms including capacity checks

## Installation

1. Ensure you have Node.js 18+ installed
2. Clone or navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Use the buttons to manage data:
   - **Add Person**: Create new team members
   - **Add Project**: Create new projects with custom colors
   - **Add Assignment**: Manually assign people to projects for specific date ranges

4. Interact with assignments:
   - **Drag**: Click and drag assignment bars horizontally to move them between days
   - **Resize**: Drag the right edge of bars to adjust duration
   - **Edit Percentage**: Click on bars to open inline editor for percentage adjustment

5. Navigate weeks:
    - Use "Anterior" to go to previous week, "Siguiente" to next, "Hoy" to current week
    - View the selected 4-week range displayed

6. View the calendar with:
    - Person information on the left
    - 28 days (4 weeks) as columns starting from selected week
    - Colored bars representing project assignments with percentage allocation
    - Automatic snap to day boundaries and collision prevention

## Project Structure

```
src/
├── app/
│   └── page.tsx                    # Main page component
├── components/
│   ├── WeeklyGrid.tsx              # Calendar grid layout
│   ├── PersonRow.tsx               # Individual person row with capacity indicators
│   ├── AssignmentBar.tsx           # Project assignment visualization
│   ├── ProjectLegend.tsx           # Project color legend sidebar
│   ├── AddEditPersonDialog.tsx     # Person CRUD modal
│   ├── AddEditProjectDialog.tsx    # Project CRUD modal
│   └── AddEditAssignmentDialog.tsx # Assignment creation modal
├── hooks/
│   └── useCapacity.ts               # Custom hook for capacity calculations
├── stores/
│   └── calendarStore.ts            # Zustand store with persistence
├── utils/
│   └── calendarUtils.ts            # Calendar calculation utilities
└── types/
    └── index.ts                    # TypeScript type definitions
```

## Technologies Used

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management with persistence middleware
- **@dnd-kit/core**: Drag and drop functionality
- **@dnd-kit/modifiers**: Drag and drop modifiers
- **ESLint**: Code linting


- ✅ Dynamic CRUD for people and projects
- ✅ Manual assignment creation with person/project selection, date range, and percentage
- ✅ Assignment bars generated manually in the grid
- ✅ Drag and drop horizontal movement of bars between weeks with weekly snap
- ✅ Resize functionality for adjusting assignment duration
- ✅ Percentage editing via click on bars with modal input
- ✅ Collision prevention for overlapping assignments
- ✅ Validations for snap positions and percentage limits (0-100)
- ✅ Capacity calculation: sum percentages per person over 4-week range, compare to 100%
- ✅ Visual semaphore: progress bar per person row with colors (green ≤100%, amber 100-120%, red >120%)
- ✅ Local persistence: save/load state in localStorage including selected week
- ✅ Capacity validations: prevent assignments exceeding 150% limit
- ✅ Modal dialogs with form validations including capacity checks
- ✅ Zustand store with add/update actions, week navigation, and persistence
- ✅ Custom hooks for capacity calculations following SOLID principles
- ✅ Modular component structure following SOLID principles
- ✅ TypeScript implementation
- ✅ Week navigation: buttons for previous, next, today with 4-week view
- ✅ Project legend sidebar with dynamic color display
- ✅ Compiles without errors
- ✅ Updated documentation with week navigation, 4-week view, and project legend

version 0.2.0


> for deploy 

````
cd Project-Manager/
git pull origin main
chmod +x deploy.sh
sh deploy.sh
```