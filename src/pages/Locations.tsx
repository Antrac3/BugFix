import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  MapPin,
  Edit,
  MoreHorizontal,
  Calendar,
  Users,
  Navigation,
  Clock,
  Star,
  ExternalLink,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle,
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
import { useApp, Location } from "@/contexts/SupabaseAppContext";
import { LocationForm } from "@/components/forms/LocationForm";

const statusColors = {
  available: "bg-fantasy-success text-white",
  booked: "bg-yellow-500 text-white",
  maintenance: "bg-fantasy-danger text-white",
};

const statusIcons = {
  available: CheckCircle,
  booked: Clock,
  maintenance: AlertTriangle,
};

const typeColors = {
  outdoor: "border-green-500 text-green-700 bg-green-50",
  indoor: "border-blue-500 text-blue-700 bg-blue-50",
  industrial: "border-gray-500 text-gray-700 bg-gray-50",
  garden: "border-pink-500 text-pink-700 bg-pink-50",
};

export default function Locations() {
  const { locations, deleteLocation } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<
    Location | undefined
  >();
  const [locationToDelete, setLocationToDelete] = useState<
    Location | undefined
  >();

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;
    const matchesType = typeFilter === "all" || location.type === typeFilter;

    if (selectedTab === "all")
      return matchesSearch && matchesStatus && matchesType;
    if (selectedTab === "available")
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        location.status === "available"
      );
    if (selectedTab === "unavailable")
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        location.status !== "available"
      );

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return Icon ? <Icon className="h-3 w-3" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-fantasy-primary" />
              <span>Gestione Location</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci location, coordina prenotazioni e organizza le location
              delle sessioni
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => {
              setEditingLocation(undefined);
              setShowLocationForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Location
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale Location
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {locations.length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Available Now
                  </p>
                  <p className="text-3xl font-bold text-fantasy-success">
                    {locations.filter((l) => l.status === "available").length}
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
                    Upcoming Events
                  </p>
                  <p className="text-3xl font-bold text-fantasy-accent">
                    {locations.reduce(
                      (acc, l) => acc + (l.upcoming_events?.length || 0),
                      0,
                    )}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-fantasy-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Rating
                  </p>
                  <p className="text-3xl font-bold text-fantasy-gold">
                    {(
                      locations.reduce((acc, l) => acc + l.rating, 0) /
                      locations.length
                    ).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-fantasy-gold" />
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
                  placeholder="Search locations by name, address, or description..."
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="garden">Garden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Locations ({locations.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available (
              {locations.filter((l) => l.status === "available").length})
            </TabsTrigger>
            <TabsTrigger value="unavailable">
              Unavailable (
              {locations.filter((l) => l.status !== "available").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-6">
            {/* Location Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  className="fantasy-card hover:shadow-fantasy-lg transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2 mb-2">
                          {location.name}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-fantasy-gold fill-current" />
                            <span className="text-sm text-muted-foreground">
                              {location.rating}
                            </span>
                          </div>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            className={
                              statusColors[
                                location.status as keyof typeof statusColors
                              ]
                            }
                          >
                            {getStatusIcon(location.status)}
                            <span className="ml-1 capitalize">
                              {location.status}
                            </span>
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              typeColors[
                                location.type as keyof typeof typeColors
                              ]
                            }
                          >
                            {location.type}
                          </Badge>
                        </div>
                        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{location.address}</span>
                        </div>
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
                              setEditingLocation(location);
                              setShowLocationForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica Location
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Prenota Sessione
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Navigation className="h-4 w-4 mr-2" />
                            Ottieni Indicazioni
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Camera className="h-4 w-4 mr-2" />
                            Visualizza Foto
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setLocationToDelete(location)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Elimina Location
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {location.description}
                    </p>

                    {/* Capacity and Price */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Up to {location.capacity} people
                        </span>
                      </div>
                      <div className="text-sm font-medium text-fantasy-gold">
                        {location.price_range}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {location.amenities.map((amenity, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Events */}
                    {location.upcoming_events &&
                      location.upcoming_events.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Upcoming Events
                          </h4>
                          <div className="space-y-1">
                            {location.upcoming_events.map((event, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded"
                              >
                                <span className="font-medium">
                                  {event.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Contact and Notes */}
                    <div className="space-y-2 text-sm border-t pt-4">
                      <div>
                        <span className="font-medium">Contact: </span>
                        <span className="text-muted-foreground">
                          {location.contact}
                        </span>
                      </div>
                      {location.notes && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {location.notes}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Navigation className="h-3 w-3 mr-1" />
                        Directions
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Book
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredLocations.length === 0 && (
              <Card className="fantasy-card">
                <CardContent className="p-12 text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No locations found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your search criteria or filters"
                      : "Add your first location to get started"}
                  </p>
                  <Button className="fantasy-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modali */}
        <LocationForm
          isOpen={showLocationForm}
          onClose={() => {
            setShowLocationForm(false);
            setEditingLocation(undefined);
          }}
          location={editingLocation}
        />

        {/* Alert Dialog per conferma eliminazione */}
        <AlertDialog
          open={!!locationToDelete}
          onOpenChange={() => setLocationToDelete(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare la location "
                {locationToDelete?.name}"? Questa azione non può essere
                annullata e rimuoverà anche tutti gli eventi associati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (locationToDelete) {
                    deleteLocation(locationToDelete.id);
                    setLocationToDelete(undefined);
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
