import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Contact,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Calendar,
  Tag,
  Building,
  User,
  Star,
  Clock,
  FileText,
  ExternalLink,
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
import { useApp, Contact as ContactType } from "@/contexts/SupabaseAppContext";
import { ContactForm } from "@/components/forms/ContactForm";

const typeColors = {
  vendor: "bg-blue-500 text-white",
  actor: "bg-purple-500 text-white",
  collaborator: "bg-green-500 text-white",
  supplier: "bg-orange-500 text-white",
};

const typeIcons = {
  vendor: Building,
  actor: User,
  collaborator: Star,
  supplier: Building,
};

export default function Contacts() {
  const { contacts, deleteContact } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<
    ContactType | undefined
  >();
  const [contactToDelete, setContactToDelete] = useState<
    ContactType | undefined
  >();

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    const matchesCategory =
      categoryFilter === "all" || contact.category === categoryFilter;

    if (selectedTab === "all")
      return matchesSearch && matchesType && matchesCategory;
    if (selectedTab === "vendors")
      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        contact.type === "vendor"
      );
    if (selectedTab === "people")
      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        (contact.type === "actor" || contact.type === "collaborator")
      );

    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type as keyof typeof typeIcons];
    return Icon ? <Icon className="h-3 w-3" /> : null;
  };

  const categories = Array.from(new Set(contacts.map((c) => c.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Contact className="h-8 w-8 text-fantasy-primary" />
              <span>Gestione Contatti</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci fornitori, attori, collaboratori e fornitori di servizi
            </p>
          </div>
          <Button
            className="fantasy-button"
            onClick={() => {
              setEditingContact(undefined);
              setShowContactForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Contatto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale Contatti
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {contacts.length}
                  </p>
                </div>
                <Contact className="h-8 w-8 text-fantasy-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fornitori
                  </p>
                  <p className="text-3xl font-bold text-blue-500">
                    {contacts.filter((c) => c.type === "vendor").length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Attori
                  </p>
                  <p className="text-3xl font-bold text-purple-500">
                    {contacts.filter((c) => c.type === "actor").length}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
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
                      contacts.reduce((acc, c) => acc + c.rating, 0) /
                      contacts.length
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
                  placeholder="Search contacts by name, email, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vendor">Vendors</SelectItem>
                    <SelectItem value="actor">Actors</SelectItem>
                    <SelectItem value="collaborator">Collaborators</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="vendors">
              Vendors ({contacts.filter((c) => c.type === "vendor").length})
            </TabsTrigger>
            <TabsTrigger value="people">
              People (
              {
                contacts.filter(
                  (c) => c.type === "actor" || c.type === "collaborator",
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-6">
            {/* Contact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="fantasy-card hover:shadow-fantasy-lg transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2 mb-2">
                          {contact.name}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-fantasy-gold fill-current" />
                            <span className="text-sm text-muted-foreground">
                              {contact.rating}
                            </span>
                          </div>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            className={
                              typeColors[
                                contact.type as keyof typeof typeColors
                              ]
                            }
                          >
                            {getTypeIcon(contact.type)}
                            <span className="ml-1 capitalize">
                              {contact.type}
                            </span>
                          </Badge>
                          <Badge variant="outline">{contact.category}</Badge>
                        </div>
                        {contact.contact_person !== contact.name && (
                          <p className="text-sm text-muted-foreground">
                            Contact: {contact.contact_person}
                          </p>
                        )}
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
                              setEditingContact(contact);
                              setShowContactForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica Contatto
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Invia Messaggio
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Programma Incontro
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Visualizza Storico
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setContactToDelete(contact)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Elimina Contatto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.website && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-fantasy-primary">
                            {contact.website}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Services and Price Range */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="text-sm">
                        <span className="font-medium">Servizi: </span>
                        <span className="text-muted-foreground">
                          {contact.services.join(", ")}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-fantasy-gold">
                        {contact.price_range}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tag</h4>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {contact.notes && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {contact.notes}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Ultimo contatto:{" "}
                          {new Date(contact.last_contact).toLocaleDateString()}
                        </span>
                      </div>
                      <div>{contact.total_interactions} interazioni</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      {contact.website && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <Card className="fantasy-card">
                <CardContent className="p-12 text-center">
                  <Contact className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No contacts found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ||
                    typeFilter !== "all" ||
                    categoryFilter !== "all"
                      ? "Try adjusting your search criteria or filters"
                      : "Add your first contact to get started"}
                  </p>
                  <Button className="fantasy-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modali */}
        <ContactForm
          isOpen={showContactForm}
          onClose={() => {
            setShowContactForm(false);
            setEditingContact(undefined);
          }}
          contact={editingContact}
        />

        {/* Alert Dialog per conferma eliminazione */}
        <AlertDialog
          open={!!contactToDelete}
          onOpenChange={() => setContactToDelete(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare il contatto "
                {contactToDelete?.name}"? Questa azione non può essere annullata
                e rimuoverà anche tutto lo storico associato.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (contactToDelete) {
                    deleteContact(contactToDelete.id);
                    setContactToDelete(undefined);
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
