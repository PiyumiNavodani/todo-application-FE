"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { type Task, getFormattedDate, getPriorityColor } from "@/lib/date-utils"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { format, parseISO } from "date-fns"

interface TaskCardProps {
  task: Task 
  onToggleComplete: (id: string, completed: boolean) => void 
  onEdit: (task: Task) => void 
  onDelete: (id: string) => void 
  onAddComment: (taskId: string, commentText: string) => void 
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete, onAddComment }: TaskCardProps) {

  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [newCommentText, setNewCommentText] = useState("")


  const handleAddComment = () => {
    if (newCommentText.trim()) {
      onAddComment(task.id, newCommentText.trim())
      setNewCommentText("")
    }
  }

  return (

    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
          />

          <CardTitle className={`text-lg font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          
          {task.priority && (
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}

          <Button variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label="Edit task">
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} aria-label="Delete task">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">

        <p className="text-sm text-muted-foreground mb-2">
          {task.dueDate ? getFormattedDate(task.dueDate) : "No due date"}
        </p>
        {task.description && <p className="text-sm text-gray-700 mb-2">{task.description}</p>}

        
        <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen} className="w-full space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground">
              <MessageSquare className="mr-2 h-4 w-4" />
              Comments ({task.comments.length})
              {isCommentsOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            <Separator />
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {task.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No comments yet.</p>
              ) : (

                task.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted p-2 rounded-md text-sm">
                    <p>{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {comment.timestamp}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddComment()
                  }
                }}
              />
              <Button size="icon" onClick={handleAddComment} aria-label="Send comment">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
