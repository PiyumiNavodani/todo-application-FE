"use client"

// This component represents a modal dialog for adding or editing a task.
// It uses the `Dialog` component from `shadcn/ui`.

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

interface AddEditTaskDialogProps {
  isOpen: boolean // Controls the visibility of the dialog
  onClose: () => void // Callback function when the dialog is closed
  onSave: (task: Task) => void // Callback function when a task is saved (new or updated)
  initialTask?: Task | null // Optional: Task object to pre-fill the form for editing
}

export function AddEditTaskDialog({ isOpen, onClose, onSave, initialTask }: AddEditTaskDialogProps) {
  // Component local state for form fields using React's useState hook.
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<"low" | "medium" | "high" | undefined>(undefined)

  // useEffect hook to initialize form fields when `initialTask` or `isOpen` changes.
  // This ensures the form is pre-filled correctly for editing or reset for adding.
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setDescription(initialTask.description || "")
      setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate) : undefined)
      setPriority(initialTask.priority)
    } else {
      // Reset form for adding a new task
      setTitle("")
      setDescription("")
      setDueDate(undefined)
      setPriority(undefined)
    }
  }, [initialTask, isOpen]) // Dependencies: re-run effect if initialTask or isOpen changes

  // Handles the save action, creating/updating a task object and calling the `onSave` callback.
  const handleSave = () => {
    if (!title.trim()) return // Basic validation: task title cannot be empty

    const newTask: Task = {
      id: initialTask?.id || crypto.randomUUID(), // Use existing ID for edit, generate new for add
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined, // Convert Date object to ISO string
      completed: initialTask?.completed || false, // Preserve completion status for edits
      priority: priority,
      comments: initialTask?.comments || [], // Preserve comments for edits
    }
    onSave(newTask) // Emit the saved task to the parent component
    onClose() // Close the dialog
  }

  return (
    // Dialog component from shadcn/ui for the modal interface.
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Form fields for title, description, due date, and priority */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Task title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("col-span-3 justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select onValueChange={(value: "low" | "medium" | "high") => setPriority(value)} value={priority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
