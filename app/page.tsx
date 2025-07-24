"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { TaskList } from "@/components/task-list"
import { AddEditTaskDialog } from "@/components/add-edit-task-dialog"
import { FAB } from "@/components/fab"
import type { Task } from "@/lib/date-utils"
import { isSameDay, isSameMonth, isSameWeek, parseISO, startOfMonth, startOfWeek, format } from "date-fns"

const API_BASE = "http://localhost:8080/api/tasks"

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompleted, setShowCompleted] = useState(false)
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append("search", searchQuery)
        if (showCompleted) params.append("completed", "true")
        if (filterDate) {
  const adjustedDate = new Date(
    filterDate.getFullYear(),
    filterDate.getMonth(),
    filterDate.getDate()
  )
  params.append("dueDate", format(adjustedDate, "yyyy-MM-dd"))
}

        const response = await fetch(`${API_BASE}?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`)
        }
        const data: Task[] = await response.json()
        setTasks(data)
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      }
    }
    fetchTasks()
  }, [searchQuery, showCompleted, filterDate])

  const handleSaveTask = async (taskToSave: Task) => {
    try {
      const { id, ...taskDataToSend } = taskToSave;

      if (editingTask) {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskToSave),
        });
        if (!response.ok) throw new Error("Update failed");
        const updatedTask = await response.json();
      } else {
        const response = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskDataToSend),
        });
        if (!response.ok) throw new Error("Create failed");
        const createdTask = await response.json();
      }

      const refreshed = await fetch(`${API_BASE}`);
      const latest = await refreshed.json();
      setTasks(latest);
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setEditingTask(null);
      setIsAddEditDialogOpen(false);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })
      if (!response.ok) throw new Error("Completion update failed")
      const updatedTask = await response.json()
      setTasks(tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)))
    } catch (error) {
      console.error("Failed to toggle completion:", error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsAddEditDialogOpen(true)
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");

      const refreshed = await fetch(`${API_BASE}`);
      const latest = await refreshed.json();
      setTasks(latest);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleAddComment = async (taskId: string, commentText: string) => {
    try {
      const newComment = {
        text: commentText,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch(`${API_BASE}/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      })
      if (!response.ok) throw new Error("Add comment failed")
      const updatedTask = await response.json()

      setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)))
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const handleFilterThisWeek = () => {
    setFilterDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const handleFilterThisMonth = () => {
    setFilterDate(startOfMonth(new Date()))
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setShowCompleted(false)
    setFilterDate(undefined)
  }

  const filteredAndSearchedTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFilterDate =
        !filterDate ||
        (task.dueDate && isSameDay(parseISO(task.dueDate), filterDate)) ||
        (filterDate &&
          filterDate.getDay() === 1 &&
          task.dueDate &&
          isSameWeek(parseISO(task.dueDate), filterDate, { weekStartsOn: 1 })) ||
        (filterDate && filterDate.getDate() === 1 && task.dueDate && isSameMonth(parseISO(task.dueDate), filterDate))

      return matchesSearch && matchesFilterDate
    })
  }, [tasks, searchQuery, filterDate])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length

  return (
      <div className="min-h-screen bg-background text-foreground">
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
          <TaskList
            tasks={filteredAndSearchedTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAddComment={handleAddComment}
            showCompleted={showCompleted}
          />
        </main>
        <FAB
          onClick={() => {
            setEditingTask(null)
            setIsAddEditDialogOpen(true)
          }}
        />
        <AddEditTaskDialog
          isOpen={isAddEditDialogOpen}
          onClose={() => setIsAddEditDialogOpen(false)}
          onSave={handleSaveTask}
          initialTask={editingTask}
        />
      </div>
  )
}
