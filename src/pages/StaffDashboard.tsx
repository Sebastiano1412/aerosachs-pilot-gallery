
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2, Users, Calendar, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { User, Photo, AuthState } from "@/types";
import { getCurrentMonthYear, getMonthName, showErrorToast, showSuccessToast } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Placeholders for Supabase functions
const fetchUsers = async (): Promise<User[]> => {
  // Simulating network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the demo, returning empty array
  // In production, this would be a Supabase query
  return [];
};

const fetchPendingPhotos = async (): Promise<Photo[]> => {
  // Simulating network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the demo, returning empty array
  // In production, this would be a Supabase query
  return [];
};

const fetchAllPhotos = async (): Promise<Photo[]> => {
  // Simulating network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the demo, returning empty array
  // In production, this would be a Supabase query
  return [];
};

interface StaffDashboardProps {
  auth: AuthState;
  onLogout: () => void;
  onApprovePhoto: (photoId: string) => Promise<void>;
  onRejectPhoto: (photoId: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onCreateUser: (email: string, callsign: string, firstName: string, lastName: string, password: string) => Promise<void>;
  onEditUser: (userId: string, userData: Partial<User>) => Promise<void>;
  onResetPhotos: () => Promise<void>;
}

const StaffDashboard = ({ 
  auth, 
  onLogout, 
  onApprovePhoto, 
  onRejectPhoto, 
  onDeletePhoto, 
  onDeleteUser,
  onCreateUser,
  onEditUser,
  onResetPhotos
}: StaffDashboardProps) => {
  const { isStaff, isLoading: isAuthLoading } = auth;
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // User form state
  const [userForm, setUserForm] = useState({
    email: "",
    callsign: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  
  // Get current month/year
  const { month, year } = getCurrentMonthYear();
  
  // Redirect if not staff
  useEffect(() => {
    if (!isAuthLoading && !isStaff) {
      navigate("/");
    }
  }, [isStaff, isAuthLoading, navigate]);
  
  // Fetch data using React Query
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isStaff,
  });
  
  const { data: pendingPhotos = [], isLoading: isPendingPhotosLoading } = useQuery({
    queryKey: ['pendingPhotos'],
    queryFn: fetchPendingPhotos,
    enabled: isStaff,
  });
  
  const { data: allPhotos = [], isLoading: isAllPhotosLoading } = useQuery({
    queryKey: ['allPhotos'],
    queryFn: fetchAllPhotos,
    enabled: isStaff,
  });
  
  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
  
  // Selected user for editing
  const selectedUser = users.find(user => user.id === selectedUserId) || null;
  
  // Selected photo for viewing
  const selectedPhoto = allPhotos.find(photo => photo.id === selectedPhotoId) || 
                        pendingPhotos.find(photo => photo.id === selectedPhotoId) || 
                        null;
  
  // Handle user form change
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle create user
  const handleCreateUser = async () => {
    try {
      await onCreateUser(
        userForm.email,
        userForm.callsign,
        userForm.firstName,
        userForm.lastName,
        userForm.password
      );
      setIsCreateUserDialogOpen(false);
      setUserForm({
        email: "",
        callsign: "",
        firstName: "",
        lastName: "",
        password: "",
      });
      showSuccessToast("Utente creato con successo");
    } catch (error) {
      console.error("Create user error:", error);
      showErrorToast("Errore nella creazione dell'utente");
    }
  };
  
  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUserId) return;
    
    try {
      await onEditUser(selectedUserId, {
        email: userForm.email,
        callsign: userForm.callsign,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
      });
      setIsUserDialogOpen(false);
      showSuccessToast("Utente modificato con successo");
    } catch (error) {
      console.error("Edit user error:", error);
      showErrorToast("Errore nella modifica dell'utente");
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      await onDeleteUser(userId);
      showSuccessToast("Utente eliminato con successo");
    } catch (error) {
      console.error("Delete user error:", error);
      showErrorToast("Errore nell'eliminazione dell'utente");
    }
  };
  
  // Handle photo approval
  const handleApprovePhoto = async (photoId: string) => {
    try {
      await onApprovePhoto(photoId);
      showSuccessToast("Foto approvata con successo");
    } catch (error) {
      console.error("Approve photo error:", error);
      showErrorToast("Errore nell'approvazione della foto");
    }
  };
  
  // Handle photo rejection
  const handleRejectPhoto = async (photoId: string) => {
    try {
      await onRejectPhoto(photoId);
      showSuccessToast("Foto rifiutata con successo");
    } catch (error) {
      console.error("Reject photo error:", error);
      showErrorToast("Errore nel rifiuto della foto");
    }
  };
  
  // Handle photo deletion
  const handleDeletePhoto = async (photoId: string) => {
    try {
      await onDeletePhoto(photoId);
      showSuccessToast("Foto eliminata con successo");
    } catch (error) {
      console.error("Delete photo error:", error);
      showErrorToast("Errore nell'eliminazione della foto");
    }
  };
  
  // Handle reset of all photos (end of month)
  const handleResetPhotos = async () => {
    try {
      await onResetPhotos();
      setIsResetDialogOpen(false);
      showSuccessToast("Foto resettate con successo per il nuovo mese");
    } catch (error) {
      console.error("Reset photos error:", error);
      showErrorToast("Errore nel reset delle foto");
    }
  };
  
  // Set user form data when selecting a user
  useEffect(() => {
    if (selectedUser) {
      setUserForm({
        email: selectedUser.email,
        callsign: selectedUser.callsign,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        password: "", // Don't set password when editing
      });
    }
  }, [selectedUser]);
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
      </div>
    );
  }
  
  if (!isStaff) {
    return null; // The useEffect will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar auth={auth} onLogout={onLogout} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-2 md:mb-0">Area Staff</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="border-airline-blue text-airline-blue hover:bg-airline-blue hover:text-white"
              onClick={() => setIsCreateUserDialogOpen(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              Crea Utente
            </Button>
            
            <Button 
              variant="destructive"
              onClick={() => setIsResetDialogOpen(true)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Reset Mensile Foto
            </Button>
          </div>
        </div>
        
        <div className="bg-airline-blue text-white p-4 rounded-md mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-xl font-bold">Dashboard Staff</h2>
              <p className="opacity-80">Gestione foto e utenti della virtual airline</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="opacity-80">Contest attuale:</span>{" "}
              <span className="font-semibold">{getMonthName(month)} {year}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Utenti</span>
                <Users className="h-5 w-5 text-airline-blue" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">Piloti registrati</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>In attesa</span>
                <Eye className="h-5 w-5 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPhotos.length}</div>
              <p className="text-sm text-muted-foreground">Foto da approvare</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Totale foto</span>
                <Calendar className="h-5 w-5 text-airline-lightblue" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allPhotos.length}</div>
              <p className="text-sm text-muted-foreground">Caricate questo mese</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="pending">
              In attesa {pendingPhotos.length > 0 && `(${pendingPhotos.length})`}
            </TabsTrigger>
            <TabsTrigger value="photos">Tutte le foto</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Foto in attesa di approvazione</h2>
            </div>
            
            {isPendingPhotosLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
              </div>
            ) : pendingPhotos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Anteprima</th>
                      <th className="p-3 text-left">Titolo</th>
                      <th className="p-3 text-left">Pilota</th>
                      <th className="p-3 text-left">Data</th>
                      <th className="p-3 text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPhotos.map((photo) => (
                      <tr key={photo.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="relative w-16 h-16">
                            <img
                              src={photo.imageUrl}
                              alt={photo.title}
                              className="w-16 h-16 object-cover rounded-md cursor-pointer"
                              onClick={() => {
                                setSelectedPhotoId(photo.id);
                                setIsPhotoDialogOpen(true);
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{photo.title}</div>
                        </td>
                        <td className="p-3">
                          <div>{photo.callsign}</div>
                          <div className="text-sm text-muted-foreground">{photo.uploaderName}</div>
                        </td>
                        <td className="p-3">
                          <div>{new Date(photo.createdAt).toLocaleDateString('it-IT')}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprovePhoto(photo.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectPhoto(photo.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPhotoId(photo.id);
                                setIsPhotoDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="text-center py-8 px-4">
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Check className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nessuna foto in attesa</h3>
                    <p className="text-muted-foreground">
                      Tutte le foto sono state approvate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="photos" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tutte le foto</h2>
              
              <Input
                placeholder="Cerca..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isAllPhotosLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
              </div>
            ) : allPhotos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Anteprima</th>
                      <th className="p-3 text-left">Titolo</th>
                      <th className="p-3 text-left">Pilota</th>
                      <th className="p-3 text-left">Voti</th>
                      <th className="p-3 text-left">Stato</th>
                      <th className="p-3 text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPhotos
                      .filter(photo => 
                        !searchTerm || 
                        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        photo.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        photo.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((photo) => (
                        <tr key={photo.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="relative w-16 h-16">
                              <img
                                src={photo.imageUrl}
                                alt={photo.title}
                                className="w-16 h-16 object-cover rounded-md cursor-pointer"
                                onClick={() => {
                                  setSelectedPhotoId(photo.id);
                                  setIsPhotoDialogOpen(true);
                                }}
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{photo.title}</div>
                          </td>
                          <td className="p-3">
                            <div>{photo.callsign}</div>
                            <div className="text-sm text-muted-foreground">{photo.uploaderName}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-airline-accent fill-airline-accent mr-1" />
                              <span>{photo.voteCount}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {photo.approved ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Approvata
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                In attesa
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPhotoId(photo.id);
                                  setIsPhotoDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePhoto(photo.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="text-center py-8 px-4">
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Calendar className="h-12 w-12 text-airline-blue mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nessuna foto</h3>
                    <p className="text-muted-foreground">
                      Non ci sono foto caricate per questo mese.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Gestione Utenti</h2>
              
              <Input
                placeholder="Cerca utente..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isUsersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Callsign</th>
                      <th className="p-3 text-left">Nome</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Data registrazione</th>
                      <th className="p-3 text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium">{user.callsign}</div>
                        </td>
                        <td className="p-3">
                          <div>{user.firstName} {user.lastName}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="p-3">
                          <div>{new Date(user.createdAt).toLocaleDateString('it-IT')}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-airline-blue text-airline-blue"
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setIsUserDialogOpen(true);
                              }}
                            >
                              Modifica
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="text-center py-8 px-4">
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-airline-blue mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nessun utente trovato</h3>
                    <p className="text-muted-foreground">
                      Non ci sono utenti corrispondenti alla ricerca.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Edit User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifica Utente</DialogTitle>
              <DialogDescription>
                Modifica i dati dell'utente {selectedUser?.callsign}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-callsign">Callsign</Label>
                <Input
                  id="edit-callsign"
                  name="callsign"
                  value={userForm.callsign}
                  onChange={handleUserFormChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Nome</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    value={userForm.firstName}
                    onChange={handleUserFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Cognome</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    value={userForm.lastName}
                    onChange={handleUserFormChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Annulla
              </Button>
              <Button className="bg-airline-blue hover:bg-airline-lightblue" onClick={handleEditUser}>
                Salva modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Create User Dialog */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Utente</DialogTitle>
              <DialogDescription>
                Inserisci i dati per creare un nuovo utente pilota
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  placeholder="email@esempio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-callsign">Callsign</Label>
                <Input
                  id="create-callsign"
                  name="callsign"
                  value={userForm.callsign}
                  onChange={handleUserFormChange}
                  placeholder="ASX123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-firstName">Nome</Label>
                  <Input
                    id="create-firstName"
                    name="firstName"
                    value={userForm.firstName}
                    onChange={handleUserFormChange}
                    placeholder="Nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Cognome</Label>
                  <Input
                    id="create-lastName"
                    name="lastName"
                    value={userForm.lastName}
                    onChange={handleUserFormChange}
                    placeholder="Cognome"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                Annulla
              </Button>
              <Button className="bg-airline-blue hover:bg-airline-lightblue" onClick={handleCreateUser}>
                Crea Utente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Photo Detail Dialog */}
        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            {selectedPhoto && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedPhoto.title}</DialogTitle>
                  <DialogDescription>
                    Caricata da {selectedPhoto.callsign} - {selectedPhoto.uploaderName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-md">
                    <img
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.title}
                      className="w-full object-contain max-h-[60vh]"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Caricata il {new Date(selectedPhoto.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-airline-accent fill-airline-accent mr-1" />
                      <span className="font-bold">{selectedPhoto.voteCount} voti</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">{selectedPhoto.description}</p>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
                      Chiudi
                    </Button>
                    
                    {!selectedPhoto.approved ? (
                      <div className="space-x-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            handleApprovePhoto(selectedPhoto.id);
                            setIsPhotoDialogOpen(false);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approva
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleRejectPhoto(selectedPhoto.id);
                            setIsPhotoDialogOpen(false);
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rifiuta
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDeletePhoto(selectedPhoto.id);
                          setIsPhotoDialogOpen(false);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina foto
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Reset Photos Dialog */}
        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset mensile delle foto</AlertDialogTitle>
              <AlertDialogDescription>
                Stai per eliminare tutte le foto caricate per il mese corrente e resettare la classifica.
                Questa azione è irreversibile. Vuoi continuare?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={handleResetPhotos}
              >
                Conferma Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default StaffDashboard;
