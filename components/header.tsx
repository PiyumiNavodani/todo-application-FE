"use client"
// This component serves as the application header, including search, filters, and statistics.

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Toggle } from "@/components/ui/toggle"
import { CalendarIcon, CheckCircle2, ListTodo, Search, Sun, Moon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface HeaderProps {
  totalTasks: number // Total number of tasks.
  completedTasks: number // Number of completed tasks.
  searchQuery: string // Current search query.
  onSearchChange: (query: string) => void // Callback for search input changes.
  showCompleted: boolean // Flag to show/hide completed tasks.
  onToggleShowCompleted: () => void // Callback to toggle showCompleted.
  filterDate: Date | undefined // Currently selected filter date.
  onFilterDateChange: (date: Date | undefined) => void // Callback for date filter changes.
  onFilterThisWeek: () => void // Callback for "This Week" filter button.
  onFilterThisMonth: () => void // Callback for "This Month" filter button.
  onClearFilters: () => void // Callback to clear all filters.
}

export function Header({
  totalTasks,
  completedTasks,
  searchQuery,
  onSearchChange,
  showCompleted,
  onToggleShowCompleted,
  filterDate,
  onFilterDateChange,
  onFilterThisWeek,
  onFilterThisMonth,
  onClearFilters,
}: HeaderProps) {
  const tasksRemaining = totalTasks - completedTasks
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100

  return (
    // Sticky header for persistent navigation and controls.
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b py-4 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">To Do Tasks</h1> {/* Changed title here */}
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {/* Stats Section (Total, Completed, Remaining tasks with progress bar) */}
        <Card className="w-full md:w-auto flex-shrink-0">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="font-semibold">{totalTasks}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="font-semibold">{completedTasks}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="font-semibold">{tasksRemaining}</div>
              </div>
            </div>
            <div className="w-24">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% Done</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
        {/* Date picker filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[180px] justify-start text-left font-normal", !filterDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={filterDate} onSelect={onFilterDateChange} initialFocus />
          </PopoverContent>
        </Popover>
        {/* "This Week" filter button */}
        <Button variant="outline" onClick={onFilterThisWeek}>
          This Week
        </Button>
        {/* "This Month" filter button */}
        <Button variant="outline" onClick={onFilterThisMonth}>
          This Month
        </Button>
        {/* Toggle to show/hide completed tasks */}
        <Toggle
          pressed={showCompleted}
          onPressedChange={onToggleShowCompleted}
          aria-label="Toggle show completed tasks"
        >
          {showCompleted ? "Show All" : "Show Pending"}
        </Toggle>
        {/* Clear Filters button, shown only when filters are active */}
        {(filterDate || searchQuery || showCompleted) && (
          <Button variant="ghost" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </header>
  )
}
