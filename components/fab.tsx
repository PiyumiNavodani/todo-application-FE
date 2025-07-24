"use client"

import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void 
}

export function FAB({ onClick }: FABProps) {
  return (
    
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
