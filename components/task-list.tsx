"use client"
// This component displays a list of tasks, grouped by their due dates.

import { type Task, type TaskGroup, groupTasks } from "@/lib/date-utils"
import { TaskCard } from "./task-card"

interface TaskListProps {
  tasks: Task[] // Array of tasks to display.
  onToggleComplete: (id: string, completed: boolean) => void // Callback for toggling completion.
  onEdit: (task: Task) => void // Callback for editing.
  onDelete: (id: string) => void // Callback for deleting.
  onAddComment: (taskId: string, commentText: string) => void // Callback for adding a comment.
  showCompleted: boolean // Flag to determine if completed tasks should be shown.
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete, onAddComment, showCompleted }: TaskListProps) {
  // Filter tasks based on the 'showCompleted' prop.
  const filteredTasks = tasks.filter((task) => showCompleted || !task.completed)

  // Group the filtered tasks using the utility function.
  const groupedTasks = groupTasks(filteredTasks)

  // Define the order in which task groups should be displayed.
  const groupOrder: TaskGroup[] = ["Today", "This Week", "Later", "No Due Date"]

  return (
    <div className="space-y-8">
      {/* Iterate through the defined group order */}
      {groupOrder.map((groupName) => {
        const tasksInGroup = groupedTasks[groupName]
        if (tasksInGroup.length === 0) return null // Don't render empty groups

        return (
          <div key={groupName}>
            {/* Group title, sticky for better UX */}
            <h2 className="text-xl font-semibold mb-4 sticky top-16 bg-background py-2 z-10">{groupName}</h2>
            <div className="grid gap-4">
              {/* Iterate through tasks within each group and render TaskCard for each */}
              {tasksInGroup.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddComment={onAddComment}
                />
              ))}
            </div>
          </div>
        )
      })}
      {/* Message displayed when no tasks match the current filters/search */}
      {filteredTasks.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">No tasks to display. Add + to create a new task!</p>
      )}
    </div>
  )
}
