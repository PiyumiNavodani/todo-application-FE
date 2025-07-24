// This file contains utility functions and type definitions used across the application.

import { format, isToday, isThisWeek, parseISO, startOfWeek } from "date-fns"

// Defines the structure for a single To-Do Task.
export interface Task {
  id: string // Unique identifier for the task
  title: string // Main title of the task
  description?: string // Optional detailed description
  dueDate?: string // Optional due date, stored as an ISO date string (e.g., "2023-10-27T10:00:00.000Z")
  completed: boolean // Status of the task (true if completed, false otherwise)
  priority?: "low" | "medium" | "high" // Optional priority level
  comments: Comment[] // Array of comments associated with the task
}

// Defines the structure for a single Comment.
export interface Comment {
  id: string // Unique identifier for the comment
  text: string // The content of the comment
  timestamp: string // When the comment was added, stored as an ISO date string
}

// Defines the possible groups for tasks based on their due date.
export type TaskGroup = "Today" | "This Week" | "Later" | "No Due Date"

/**
 * Groups tasks into categories based on their due date relative to the current date.
 * @param tasks An array of Task objects to be grouped.
 * @returns An object where keys are TaskGroup names and values are arrays of Tasks.
 */
export const groupTasks = (tasks: Task[]): Record<TaskGroup, Task[]> => {
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday as start of week

  const grouped: Record<TaskGroup, Task[]> = {
    Today: [],
    "This Week": [],
    Later: [],
    "No Due Date": [],
  }

  tasks.forEach((task) => {
    if (!task.dueDate) {
      grouped["No Due Date"].push(task)
      return
    }

    const dueDate = parseISO(task.dueDate)

    if (isToday(dueDate)) {
      grouped.Today.push(task)
    } else if (isThisWeek(dueDate, { weekStartsOn: 1 })) {
      // Check if it's in the current week but not today
      if (dueDate.getTime() > today.getTime()) {
        // Only future dates in this week
        grouped["This Week"].push(task)
      } else {
        // Past dates in this week, treat as 'Later' or 'No Due Date' if not completed
        grouped.Later.push(task)
      }
    } else {
      grouped.Later.push(task)
    }
  })

  // Sort tasks within each group by due date
  for (const key in grouped) {
    grouped[key as TaskGroup].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
    })
  }

  return grouped
}

/**
 * Formats a date string into a human-readable format, indicating "Today" if applicable.
 * @param dateString An optional ISO date string.
 * @returns A formatted date string (e.g., "Oct 27, 2023", "Today", or "No due date").
 */
export const getFormattedDate = (dateString?: string) => {
  if (!dateString) return "No due date"
  const date = parseISO(dateString)
  if (isToday(date)) return "Today"
  return format(date, "MMM dd, yyyy")
}

/**
 * Returns Tailwind CSS classes for priority badges based on the priority level.
 * @param priority The priority level ("low", "medium", "high").
 * @returns Tailwind CSS class string.
 */
export const getPriorityColor = (priority?: "low" | "medium" | "high") => {
  switch (priority) {
    case "high":
      return "bg-red-500 text-white"
    case "medium":
      return "bg-yellow-500 text-white"
    case "low":
      return "bg-blue-500 text-white"
    default:
      return "bg-gray-200 text-gray-800"
  }
}
