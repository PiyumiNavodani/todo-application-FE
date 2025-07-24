"use client"

// This component is a Floating Action Button (FAB) for adding new tasks.

import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void // Callback function when the FAB is clicked.
}

export function FAB({ onClick }: FABProps) {
  return (
    // Fixed position button with rounded shape and shadow.
    <Button
      size="lg"
      className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14"
      onClick={onClick}
      aria-label="Add new task"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
