import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  CheckSquare,
  Edit,
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  Flag,
  MessageSquare,
  Paperclip,
  Users,
  Filter,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, Task } from "@/contexts/SupabaseAppContext";
import { TaskForm } from "@/components/forms/TaskForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const priorityColors = {
  low: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-white",
  high: "bg-red-500 text-white",
  urgent: "bg-purple-500 text-white",
};

const statusColors = {
  pending: "bg-gray-500 text-white",
  "in-progress": "bg-blue-500 text-white",
  completed: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

const statusIcons = {
  pending: Circle,
  "in-progress": Clock,
  completed: CheckCircle,
  cancelled: AlertTriangle,
};

const priorityIcons = {
  low: Flag,
  medium: Flag,
  high: Flag,
  urgent: AlertTriangle,
};

export default function Tasks() {
  const { tasks, updateTask, deleteTask } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "all" || task.assignees.includes(assigneeFilter);

    if (selectedTab === "all")
      return (
        matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      );
    if (selectedTab === "my-tasks")
      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        task.assignees.includes("Game Master")
      );
    if (selectedTab === "overdue") {
      const isOverdue =
        new Date(task.deadline) < new Date() && task.status !== "completed";
      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        isOverdue
      );
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return Icon ? <Icon className="h-3 w-3" /> : null;
  };

  const getPriorityIcon = (priority: string) => {
    const Icon = priorityIcons[priority as keyof typeof priorityIcons];
    return Icon ? <Icon className="h-3 w-3" /> : null;
  };

  const isOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== "completed";
  };

  const allAssignees = Array.from(
    new Set(tasks.flatMap((task) => task.assignees)),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <CheckSquare className="h-8 w-8 text-fantasy-primary" />
              <span>Gestione Attività</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Organizza e monitora le attività di preparazione della campagna e
              le assegnazioni
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => {
              setEditingTask(undefined);
              setShowTaskForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crea Attività
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Attività Totali
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {tasks.length}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Corso
                  </p>
                  <p className="text-3xl font-bold text-blue-500">
                    {tasks.filter((t) => t.status === "in-progress").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completate
                  </p>
                  <p className="text-3xl font-bold text-fantasy-success">
                    {tasks.filter((t) => t.status === "completed").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-fantasy-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Ritardo
                  </p>
                  <p className="text-3xl font-bold text-fantasy-danger">
                    {
                      tasks.filter((t) => isOverdue(t.deadline, t.status))
                        .length
                    }
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-fantasy-danger" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="fantasy-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca attività per titolo, descrizione o tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli Stati</SelectItem>
                    <SelectItem value="pending">In Attesa</SelectItem>
                    <SelectItem value="in-progress">In Corso</SelectItem>
                    <SelectItem value="completed">Completate</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le Priorità</SelectItem>
                    <SelectItem value="low">Bassa</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={assigneeFilter}
                  onValueChange={setAssigneeFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli Assegnatari</SelectItem>
                    {allAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Tutte le Attività ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="my-tasks">
              Le Mie Attività (
              {tasks.filter((t) => t.assignees.includes("Game Master")).length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              In Ritardo (
              {tasks.filter((t) => isOverdue(t.deadline, t.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-6">
            {/* Task List */}
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`fantasy-card hover:shadow-fantasy-lg transition-all duration-300 ${
                    isOverdue(task.deadline, task.status)
                      ? "border-red-500 border-2"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 mb-2">
                          {task.title}
                          {isOverdue(task.deadline, task.status) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            className={
                              statusColors[
                                task.status as keyof typeof statusColors
                              ]
                            }
                          >
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">
                              {task.status === "pending"
                                ? "In Attesa"
                                : task.status === "in-progress"
                                  ? "In Corso"
                                  : task.status === "completed"
                                    ? "Completata"
                                    : task.status}
                            </span>
                          </Badge>
                          <Badge
                            className={
                              priorityColors[
                                task.priority as keyof typeof priorityColors
                              ]
                            }
                          >
                            {getPriorityIcon(task.priority)}
                            <span className="ml-1 capitalize">
                              {task.priority === "low"
                                ? "Bassa"
                                : task.priority === "medium"
                                  ? "Media"
                                  : task.priority === "high"
                                    ? "Alta"
                                    : task.priority === "urgent"
                                      ? "Urgente"
                                      : task.priority}
                            </span>
                          </Badge>
                          <Badge variant="outline">{task.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingTask(task);
                              setShowTaskForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica Attività
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Aggiungi Commento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {task.status !== "completed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateTask(task.id, { status: "completed" })
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Segna Completata
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setTaskToDelete(task)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Elimina Attività
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Assignees */}
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Assegnato a:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.assignees.map((assignee, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            <User className="h-3 w-3 mr-1" />
                            {assignee}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Tag:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Progress and Activity */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs">
                          <div className="font-medium">Scadenza</div>
                          <div
                            className={
                              isOverdue(task.deadline, task.status)
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }
                          >
                            {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs">
                          <div className="font-medium">Progresso</div>
                          <div className="text-muted-foreground">
                            {task.actual_hours}h / {task.estimated_hours}h
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs">
                          <div className="font-medium">Commenti</div>
                          <div className="text-muted-foreground">
                            {task.comments}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="text-xs">
                          <div className="font-medium">File</div>
                          <div className="text-muted-foreground">
                            {task.attachments}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingTask(task);
                          setShowTaskForm(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifica
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Commenta
                      </Button>
                      {task.status !== "completed" && (
                        <Button
                          size="sm"
                          className="fantasy-button"
                          onClick={() =>
                            updateTask(task.id, { status: "completed" })
                          }
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completa
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <Card className="fantasy-card">
                <CardContent className="p-12 text-center">
                  <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nessuna attività trovata
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    priorityFilter !== "all" ||
                    assigneeFilter !== "all"
                      ? "Prova ad aggiustare i criteri di ricerca o i filtri"
                      : "Crea la tua prima attività per iniziare"}
                  </p>
                  <Button
                    className="fantasy-button"
                    onClick={() => {
                      setEditingTask(undefined);
                      setShowTaskForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Attività
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modali */}
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
          task={editingTask}
        />

        {/* Alert Dialog per conferma eliminazione */}
        <AlertDialog
          open={!!taskToDelete}
          onOpenChange={() => setTaskToDelete(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare l'attività "{taskToDelete?.title}
                "? Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (taskToDelete) {
                    deleteTask(taskToDelete.id);
                    setTaskToDelete(undefined);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
