"use client"

import { useState } from "react"
import useAuthHook from '../hooks/useAuth';
import { useTaskContext } from "@/components/task-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function DailyWeeklyView() {
  const { user } = useAuthHook();
  const { tasks, epics, updateTask, moveTask, addTask } = useTaskContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState("today")

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    epicId: "",
    productTeam: "",
    priority: 1,
    dueDate: format(today, "yyyy-MM-dd")
  })

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = parseISO(task.dueDate)
      return isSameDay(taskDate, date)
    })
  }

  const groupTasksByEpic = (tasksForDate: typeof tasks) => {
    const grouped = tasksForDate.reduce(
      (acc, task) => {
        const epic = epics.find((e) => e.id === task.epicId)
        if (!epic) return acc

        if (!acc[epic.id]) {
          acc[epic.id] = { epic, tasks: [] }
        }
        acc[epic.id].tasks.push(task)
        return acc
      },
      {} as Record<string, { epic: (typeof epics)[0]; tasks: typeof tasks }>,
    )

    // Sort tasks within each epic by priority
    Object.values(grouped).forEach((group) => {
      group.tasks.sort((a, b) => a.priority - b.priority)
    })

    return grouped
  }

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    updateTask(taskId, { status: completed ? "done" : "todo" })
  }

  const handleRescheduleTask = (taskId: string, newDate: string) => {
    moveTask(taskId, newDate)
  }

  const handleCreateTask = () => {
    if (user && newTask.name && newTask.epicId && newTask.dueDate) {
      addTask({
        name: newTask.name,
        dueDate: newTask.dueDate,
        epicId: newTask.epicId,
        productTeam: newTask.productTeam,
        status: "todo" as const,
        priority: newTask.priority,
        userId: user.uid
      })
      setNewTask({
        name: "",
        description: "",
        epicId: "",
        productTeam: "",
        priority: 1,
        dueDate: format(today, "yyyy-MM-dd"),
      })
      setIsTaskDialogOpen(false)
    }
  }

  const TaskCard = ({ task, showReschedule = false }: { task: (typeof tasks)[0]; showReschedule?: boolean }) => {
    const epic = epics.find((e) => e.id === task.epicId)

    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
            {task.name}
          </p>
          {task.productTeam && <p className="text-xs text-muted-foreground mt-1">{task.productTeam}</p>}
        </div>
        {showReschedule && (
          <Select onValueChange={(value) => handleRescheduleTask(task.id, value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Move to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={format(today, "yyyy-MM-dd")}>Today</SelectItem>
              <SelectItem value={format(tomorrow, "yyyy-MM-dd")}>Tomorrow</SelectItem>
              <SelectItem value={format(addDays(today, 2), "yyyy-MM-dd")}>Day After</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  const EpicGroup = ({
    epic,
    tasks: epicTasks,
    showReschedule = false,
  }: {
    epic: (typeof epics)[0]
    tasks: typeof tasks
    showReschedule?: boolean
  }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${epic.color}`} />
        <h4 className="font-medium text-sm">{epic.name}</h4>
        <Badge variant="secondary" className="text-xs">
          {epicTasks.filter((t) => t.status === "done").length}/{epicTasks.length}
        </Badge>
      </div>
      <div className="space-y-2 ml-5">
        {epicTasks.map((task) => (
          <TaskCard key={task.id} task={task} showReschedule={showReschedule} />
        ))}
      </div>
    </div>
  )

  const todayTasks = getTasksForDate(today)
  const tomorrowTasks = getTasksForDate(tomorrow)
  const todayGrouped = groupTasksByEpic(todayTasks)
  const tomorrowGrouped = groupTasksByEpic(tomorrowTasks)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily & Weekly Tasks</h1>
          <p className="text-muted-foreground">Tasks organized by Epic</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input
                    id="task-name"
                    value={newTask.name}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter task name"
                  />
                </div>
                <div>
                  <Label htmlFor="task-epic">Epic</Label>
                  <Select
                    value={newTask.epicId}
                    onValueChange={(value) => {
                      const selectedEpic = epics.find((e) => e.id === value)
                      setNewTask((prev) => ({
                        ...prev,
                        epicId: value,
                        productTeam: selectedEpic?.productTeam || "",
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select epic" />
                    </SelectTrigger>
                    <SelectContent>
                      {epics.map((epic) => (
                        <SelectItem key={epic.id} value={epic.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${epic.color}`} />
                            {epic.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-date">Due Date</Label>
                  <Input
                    id="task-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={newTask.priority.toString()}
                    onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: Number.parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">High Priority</SelectItem>
                      <SelectItem value="2">Medium Priority</SelectItem>
                      <SelectItem value="3">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Today - {format(today, "EEEE, MMMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Today&apos;s Tasks</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Quick Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Task for Today</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="quick-task-name">Task Name</Label>
                        <Input
                          id="quick-task-name"
                          placeholder="Enter task name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const taskName = e.currentTarget.value
                              if (user && taskName && epics.length > 0) {
                                addTask({
                                  name: taskName,
                                  dueDate: format(today, "yyyy-MM-dd"),
                                  epicId: epics[0].id,
                                  productTeam: epics[0].productTeam,
                                  status: "todo" as const,
                                  priority: 1,
                                  userId: user.uid
                                })
                                e.currentTarget.value = ""
                              }
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label>Epic</Label>
                        <Select defaultValue={epics[0]?.id}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {epics.map((epic) => (
                              <SelectItem key={epic.id} value={epic.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${epic.color}`} />
                                  {epic.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {Object.keys(todayGrouped).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks scheduled for today</p>
              ) : (
                Object.values(todayGrouped).map(({ epic, tasks }) => (
                  <EpicGroup key={epic.id} epic={epic} tasks={tasks} showReschedule />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tomorrow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tomorrow - {format(tomorrow, "EEEE, MMMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Tomorrow&apos;s Tasks</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Quick Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Task for Tomorrow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="quick-task-tomorrow">Task Name</Label>
                        <Input
                          id="quick-task-tomorrow"
                          placeholder="Enter task name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const taskName = e.currentTarget.value
                              if (user && taskName && epics.length > 0) {
                                addTask({
                                  name: taskName,
                                  dueDate: format(tomorrow, "yyyy-MM-dd"),
                                  epicId: epics[0].id,
                                  productTeam: epics[0].productTeam,
                                  status: "todo" as const,
                                  priority: 1,
                                  userId: user.uid
                                })
                                e.currentTarget.value = ""
                              }
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label>Epic</Label>
                        <Select defaultValue={epics[0]?.id}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {epics.map((epic) => (
                              <SelectItem key={epic.id} value={epic.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${epic.color}`} />
                                  {epic.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {Object.keys(tomorrowGrouped).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks scheduled for tomorrow</p>
              ) : (
                Object.values(tomorrowGrouped).map(({ epic, tasks }) => (
                  <EpicGroup key={epic.id} epic={epic} tasks={tasks} showReschedule />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day)
              const dayGrouped = groupTasksByEpic(dayTasks)
              const isToday = isSameDay(day, today)

              return (
                <Card key={day.toISOString()} className={isToday ? "ring-2 ring-blue-500" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {format(day, "EEE, MMM d")}
                        {isToday && <Badge className="ml-2 text-xs">Today</Badge>}
                      </CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Task for {format(day, "EEEE, MMMM d")}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Task Name</Label>
                              <Input
                                placeholder="Enter task name"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const taskName = e.currentTarget.value
                                    if (user && taskName && epics.length > 0) {
                                      addTask({
                                        name: taskName,
                                        dueDate: format(day, "yyyy-MM-dd"),
                                        epicId: epics[0].id,
                                        productTeam: epics[0].productTeam,
                                        status: "todo" as const,
                                        priority: 1,
                                        userId: user.uid
                                      })
                                      e.currentTarget.value = ""
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <Label>Epic</Label>
                              <Select defaultValue={epics[0]?.id}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {epics.map((epic) => (
                                    <SelectItem key={epic.id} value={epic.id}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${epic.color}`} />
                                        {epic.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {Object.keys(dayGrouped).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    ) : (
                      Object.values(dayGrouped).map(({ epic, tasks }) => (
                        <EpicGroup key={epic.id} epic={epic} tasks={tasks} />
                      ))
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
