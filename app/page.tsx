"use client"

// This is the main application component, acting as the "smart" container.
// It manages the overall application state and orchestrates interactions with child components and the backend API.

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { TaskList } from "@/components/task-list"
import { AddEditTaskDialog } from "@/components/add-edit-task-dialog"
import { FAB } from "@/components/fab"
import type { Task } from "@/lib/date-utils"
import { isSameDay, isSameMonth, isSameWeek, parseISO, startOfMonth, startOfWeek, format } from "date-fns"
import { ThemeProvider } from "next-themes" // For dark/light mode functionality

export default function HomePage() {
  // Application-level state for tasks, dialog visibility, filters, etc., managed using React's useState hook.
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null) // Stores the task object currently being edited
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)

  // API Integration Point: Fetch all tasks on component mount and when filters/search change.
  // This useEffect hook simulates fetching data from a backend API.
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // --- Spring Boot API Endpoint for fetching tasks ---
        // HTTP Method: GET
        // Endpoint: /api/tasks
        // Query Parameters (optional, for filtering/searching):
        //   - search: string (e.g., /api/tasks?search=keyword)
        //   - completed: boolean (e.g., /api/tasks?completed=true)
        //   - dueDate: string (ISO date, e.g., /api/tasks?dueDate=2023-10-26)
        //   - filterType: 'week' | 'month' (e.g., /api/tasks?filterType=week)
        // Expected Response: JSON array of Task objects
        //
        // Example API Binding:
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (showCompleted) params.append("completed", "true")
        if (filterDate) {
          // For specific date filter, send as YYYY-MM-DD
          params.append("dueDate", format(filterDate, "yyyy-MM-dd"))
        }
        // If you implement 'This Week'/'This Month' as backend filters, you'd add:
        // if (filterType === 'week') params.append('filterType', 'week');
        // if (filterType === 'month') params.append('filterType', 'month');

        // Uncomment the following lines to bind to your actual Spring Boot API:
        // const response = await fetch(`/api/tasks?${params.toString()}`);
        // if (!response.ok) {
        //   throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        // }
        // const data: Task[] = await response.json();
        // setTasks(data);

        // For now, load from localStorage (simulating initial data load and updates)
        const storedTasks = localStorage.getItem("todo-tasks")
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        // In a real app, you'd show a user-friendly error message (e.g., using a toast notification).
      }
    }
    fetchTasks()
  }, [searchQuery, showCompleted, filterDate]) // Dependencies: re-fetch tasks when these state variables change

  // This useEffect is for local storage persistence.
  // In a real backend-connected app, this local storage logic would be removed,
  // as the backend would be the single source of truth for data.
  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks))
  }, [tasks]) // Runs whenever the 'tasks' state changes

  // Handles saving a new task or updating an existing one.
  // This function will call the appropriate Spring Boot API endpoint.
  const handleSaveTask = async (taskToSave: Task) => {
    try {
      if (editingTask) {
        // --- Spring Boot API Endpoint for updating an existing task ---
        // HTTP Method: PUT (for full replacement) or PATCH (for partial update)
        // Endpoint: /api/tasks/{id}
        // Path Parameter: id (e.g., /api/tasks/123)
        // Request Body: Task object (for PUT) or partial Task object (for PATCH)
        // Expected Response: Updated Task object or 204 No Content
        //
        // Example API Binding (using PUT):
        // const response = await fetch(`/api/tasks/${taskToSave.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(taskToSave), // Send the entire updated task object
        // });
        // if (!response.ok) {
        //   throw new Error(`Failed to update task: ${response.statusText}`);
        // }
        // const updatedTask: Task = await response.json(); // If backend returns updated task
        // setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
        setTasks(tasks.map((task) => (task.id === taskToSave.id ? taskToSave : task))) // Local update for demo
      } else {
        // --- Spring Boot API Endpoint for creating a new task ---
        // HTTP Method: POST
        // Endpoint: /api/tasks
        // Request Body: Task object (without ID, as it's usually generated by backend)
        // Expected Response: Created Task object (with generated ID)
        //
        // Example API Binding:
        // const { id, ...taskDataToSend } = taskToSave; // Remove client-generated ID before sending
        // const response = await fetch('/api/tasks', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(taskDataToSend),
        // });
        // if (!response.ok) {
        //   throw new Error(`Failed to create task: ${response.statusText}`);
        // }
        // const createdTask: Task = await response.json(); // Backend returns the task with its new ID
        // setTasks([...tasks, createdTask]);
        setTasks([...tasks, taskToSave]) // Local update for demo
      }
    } catch (error) {
      console.error("Failed to save task:", error)
      // Handle error
    } finally {
      setEditingTask(null)
      setIsAddEditDialogOpen(false)
    }
  }

  // Handles toggling the completion status of a task.
  // This function will call the appropriate Spring Boot API endpoint.
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      // --- Spring Boot API Endpoint for updating task completion status ---
      // HTTP Method: PATCH (preferred for partial update) or PUT
      // Endpoint: /api/tasks/{id}
      // Path Parameter: id (e.g., /api/tasks/123)
      // Request Body: { "completed": true/false } (for PATCH) or full task object (for PUT)
      // Expected Response: Updated Task object or 204 No Content
      //
      // Example API Binding (using PATCH):
      // const response = await fetch(`/api/tasks/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ completed }), // Only send the 'completed' field
      // });
      // if (!response.ok) {
      //   throw new Error(`Failed to update completion status: ${response.statusText}`);
      // }
      // const updatedTask: Task = await response.json(); // If backend returns updated task
      // setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      setTasks(tasks.map((task) => (task.id === id ? { ...task, completed } : task))) // Local update for demo
    } catch (error) {
      console.error("Failed to toggle completion:", error)
      // Handle error
    }
  }

  // Sets the task to be edited and opens the dialog.
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsAddEditDialogOpen(true)
  }

  // Handles deleting a task.
  // This function will call the appropriate Spring Boot API endpoint.
  const handleDeleteTask = async (id: string) => {
    try {
      // --- Spring Boot API Endpoint for deleting a task ---
      // HTTP Method: DELETE
      // Endpoint: /api/tasks/{id}
      // Path Parameter: id (e.g., /api/tasks/123)
      // Expected Response: 204 No Content (typically)
      //
      // Example API Binding:
      // const response = await fetch(`/api/tasks/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) {
      //   throw new Error(`Failed to delete task: ${response.statusText}`);
      // }
      setTasks(tasks.filter((task) => task.id !== id)) // Local update for demo
    } catch (error) {
      console.error("Failed to delete task:", error)
      // Handle error
    }
  }

  // Handles adding a comment to a specific task.
  // This function will call the appropriate Spring Boot API endpoint.
  const handleAddComment = async (taskId: string, commentText: string) => {
    try {
      // --- Spring Boot API Endpoint for adding a comment to a task ---
      // HTTP Method: POST
      // Endpoint: /api/tasks/{taskId}/comments
      // Path Parameter: taskId (e.g., /api/tasks/456/comments)
      // Request Body: JSON object like { "text": "New comment", "timestamp": "ISO date string" }
      // Expected Response: Created Comment object or updated Task object
      //
      // Example API Binding:
      // const newComment = { text: commentText, timestamp: new Date().toISOString() };
      // const response = await fetch(`/api/tasks/${taskId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newComment),
      // });
      // if (!response.ok) {
      //   throw new Error(`Failed to add comment: ${response.statusText}`);
      // }
      // const addedComment = await response.json(); // If backend returns the new comment
      // setTasks(tasks.map(task =>
      //   task.id === taskId ? { ...task, comments: [...task.comments, addedComment] } : task
      // ));
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                comments: [
                  ...task.comments,
                  { id: crypto.randomUUID(), text: commentText, timestamp: new Date().toISOString() },
                ],
              }
            : task,
        ),
      ) // Local update for demo
    } catch (error) {
      console.error("Failed to add comment:", error)
      // Handle error
    }
  }

  // Filter handlers for "This Week" and "This Month"
  const handleFilterThisWeek = () => {
    setFilterDate(startOfWeek(new Date(), { weekStartsOn: 1 })) // Monday as start of week
  }

  const handleFilterThisMonth = () => {
    setFilterDate(startOfMonth(new Date()))
  }

  // Clears all active filters and search query.
  const handleClearFilters = () => {
    setSearchQuery("")
    setShowCompleted(false)
    setFilterDate(undefined)
  }

  // Memoized computation for filtered and searched tasks.
  // This client-side filtering is for the current localStorage-based implementation.
  // If using a backend, these filters would typically be sent as query parameters
  // to the GET /api/tasks endpoint, and the backend would return the already filtered data.
  const filteredAndSearchedTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFilterDate =
        !filterDate ||
        (task.dueDate && isSameDay(parseISO(task.dueDate), filterDate)) ||
        (filterDate &&
          filterDate.getDay() === 1 && // Check if filterDate is a Monday (start of week)
          task.dueDate &&
          isSameWeek(parseISO(task.dueDate), filterDate, { weekStartsOn: 1 })) ||
        (filterDate && filterDate.getDate() === 1 && task.dueDate && isSameMonth(parseISO(task.dueDate), filterDate))

      return matchesSearch && matchesFilterDate
    })
  }, [tasks, searchQuery, filterDate]) // Dependencies: re-compute if tasks, search query, or filter date changes

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length

  return (
    // ThemeProvider from next-themes for dark mode support.
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header component, passing down state and callbacks as props */}
        <Header
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
          filterDate={filterDate}
          onFilterDateChange={setFilterDate}
          onFilterThisWeek={handleFilterThisWeek}
          onFilterThisMonth={handleFilterThisMonth}
          onClearFilters={handleClearFilters}
        />
        <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          {/* TaskList component, passing down filtered tasks and action callbacks */}
          <TaskList
            tasks={filteredAndSearchedTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAddComment={handleAddComment}
            showCompleted={showCompleted}
          />
        </main>
        {/* Floating Action Button to open the Add Task dialog */}
        <FAB
          onClick={() => {
            setEditingTask(null) // Ensure no task is pre-filled for a new task
            setIsAddEditDialogOpen(true)
          }}
        />
        {/* Add/Edit Task Dialog */}
        <AddEditTaskDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => setIsAddEditDialogOpen(false)}
          onSave={handleSaveTask}
          initialTask={editingTask}
        />
      </div>
    </ThemeProvider>
  )
}
