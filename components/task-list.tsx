"use client"

import { type Task, type TaskGroup, groupTasks } from "@/lib/date-utils"
import { TaskCard } from "./task-card"

interface TaskListProps {
  tasks: Task[] 
  onToggleComplete: (id: string, completed: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddComment: (taskId: string, commentText: string) => void 
  showCompleted: boolean
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete, onAddComment, showCompleted }: TaskListProps) {
  
  const filteredTasks = tasks.filter((task) => showCompleted || !task.completed)

  const groupedTasks = groupTasks(filteredTasks)

  const groupOrder: TaskGroup[] = ["Today", "This Week", "Later", "No Due Date"]

  return (
    <div className="space-y-8">

      {groupOrder.map((groupName) => {
        const tasksInGroup = groupedTasks[groupName]
        if (tasksInGroup.length === 0) return null 

        return (
          <div key={groupName}>
            <h2 className="text-xl font-semibold mb-4 sticky top-16 bg-background py-2 z-10">{groupName}</h2>
            <div className="grid gap-4">
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
      {filteredTasks.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">No tasks to display. Add + to create a new task!</p>
      )}
    </div>
  )
}
