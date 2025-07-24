"use client"

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
  totalTasks: number 
  completedTasks: number 
  searchQuery: string 
  onSearchChange: (query: string) => void 
  showCompleted: boolean 
  onToggleShowCompleted: () => void 
  filterDate: Date | undefined 
  onFilterDateChange: (date: Date | undefined) => void 
  onFilterThisWeek: () => void 
  onFilterThisMonth: () => void
  onClearFilters: () => void 
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
    
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b py-4 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">To Do Tasks</h1>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
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

    
      <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
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
        
        <Button variant="outline" onClick={onFilterThisWeek}>
          This Week
        </Button>

        <Button variant="outline" onClick={onFilterThisMonth}>
          This Month
        </Button>
        
        <Toggle
          pressed={showCompleted}
          onPressedChange={onToggleShowCompleted}
          aria-label="Toggle show completed tasks"
        >
          {showCompleted ? "Show All" : "Show Pending"}
        </Toggle>
        
        {(filterDate || searchQuery || showCompleted) && (
          <Button variant="ghost" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </header>
  )
}
