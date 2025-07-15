"use client"

import { useState } from "react"
import useAuthHook from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Users, Calendar, CheckCircle2, Circle } from "lucide-react"
import { useTaskContext } from "@/components/task-context"

export function ProjectEpicView() {
  const { user } = useAuthHook();
  const { tasks, epics, productTeams, addEpic, addTask, updateTask } = useTaskContext()
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [newEpic, setNewEpic] = useState({ name: "", description: "", productTeam: "", color: "bg-blue-500" })
  const [newTask, setNewTask] = useState({ name: "", dueDate: "", epicId: "", productTeam: "", priority: 1 })
  const [isEpicDialogOpen, setIsEpicDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedEpicForTask, setSelectedEpicForTask] = useState<string>("")

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
  ]

  const filteredEpics = selectedTeam === "all" ? epics : epics.filter((epic) => epic.productTeam === selectedTeam)

  const getEpicProgress = (epicId: string) => {
    const epicTasks = tasks.filter((task) => task.epicId === epicId)
    if (epicTasks.length === 0) return 0
    const completedTasks = epicTasks.filter((task) => task.status === "done")
    return Math.round((completedTasks.length / epicTasks.length) * 100)
  }

  const getEpicTasks = (epicId: string) => {
    return tasks.filter((task) => task.epicId === epicId)
  }

  const handleCreateEpic = () => {
    console.log("Create Epic button clicked");
    if (newEpic.name && user) {
      console.log("About to call addEpic with:", { ...newEpic, userId: user.uid });
      addEpic({ ...newEpic, userId: user.uid })
      .catch((err) => {
        console.error("Error in addEpic:", err);
      });
      console.log("addEpic called");
      setNewEpic({ name: "", description: "", productTeam: "", color: "bg-blue-500" });
      setIsEpicDialogOpen(false);
    } else {
      console.log("Epic not created: missing fields or user");
    }
  }

  const handleCreateTask = () => {
    if (newTask.name && newTask.epicId && newTask.dueDate && user) {
      addTask({
        ...newTask,
        status: "todo" as const,
        userId: user.uid,
      })
      setNewTask({ name: "", dueDate: "", epicId: "", productTeam: "", priority: 1 })
      setIsTaskDialogOpen(false)
      setSelectedEpicForTask("")
    }
  }

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    updateTask(taskId, { status: completed ? "done" : "todo" })
  }

  const openTaskDialog = (epicId: string) => {
    const epic = epics.find((e) => e.id === epicId)
    setSelectedEpicForTask(epicId)
    setNewTask((prev) => ({
      ...prev,
      epicId,
      productTeam: epic?.productTeam || "",
    }))
    setIsTaskDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects & Epics</h1>
          <p className="text-muted-foreground">Manage your epics and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {productTeams.map((team) => (
                <SelectItem key={team.id} value={team.name}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isEpicDialogOpen} onOpenChange={setIsEpicDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Epic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Epic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="epic-name">Epic Name</Label>
                  <Input
                    id="epic-name"
                    value={newEpic.name}
                    onChange={(e) => setNewEpic((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter epic name"
                  />
                </div>
                <div>
                  <Label htmlFor="epic-description">Description</Label>
                  <Textarea
                    id="epic-description"
                    value={newEpic.description}
                    onChange={(e) => setNewEpic((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter epic description"
                  />
                </div>
                <div>
                  <Label htmlFor="epic-team">Product Team</Label>
                  <Select
                    value={newEpic.productTeam}
                    onValueChange={(value) => setNewEpic((prev) => ({ ...prev, productTeam: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTeams.map((team) => (
                        <SelectItem key={team.id} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full ${color} ${newEpic.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                        onClick={() => setNewEpic((prev) => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateEpic} className="w-full">
                  Create Epic
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEpics.map((epic) => {
          const progress = getEpicProgress(epic.id)
          const epicTasks = getEpicTasks(epic.id)
          const completedTasks = epicTasks.filter((task) => task.status === "done").length

          return (
            <Card key={epic.id} className="h-fit">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${epic.color}`} />
                    <CardTitle className="text-lg">{epic.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {completedTasks}/{epicTasks.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{epic.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {epic.productTeam}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Tasks</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openTaskDialog(epic.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {epicTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
                    ) : (
                      epicTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <button
                            onClick={() => handleTaskToggle(task.id, task.status === "todo")}
                            className="flex-shrink-0"
                          >
                            {task.status === "done" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                task.status === "done" ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {task.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Task Creation Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
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
    </div>
  )
}
