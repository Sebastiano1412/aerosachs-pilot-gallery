import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Star, Trash2, CheckCircle, XCircle, Edit, UserPlus, RefreshCw } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AuthState, User, Photo } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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

interface SupabasePhoto {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  callsign: string;
  uploader_name: string;
  upload_month: number;
  upload_year: number;
  approved: boolean;
  vote_count: number;
  created_at: string;
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [callsign, setCallsign] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCallsign, setEditCallsign] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    if (!auth.isStaff) {
      navigate("/");
    }
  }, [auth.isStaff, navigate]);

  const { data: pendingPhotos, isLoading: isLoadingPendingPhotos } = useQuery({
    queryKey: ['pendingPhotos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('approved', false)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Map Supabase data to our Photo type
        const photos = (data as SupabasePhoto[]).map(photo => ({
          id: photo.id,
          userId: photo.user_id,
          title: photo.title,
          description: photo.description,
          imageUrl: photo.image_url,
          callsign: photo.callsign,
          uploaderName: photo.uploader_name,
          approved: photo.approved,
          voteCount: photo.vote_count,
          uploadMonth: photo.upload_month,
          uploadYear: photo.upload_year,
          createdAt: photo.created_at
        }));
        
        return photos;
      } catch (error) {
        console.error('Error fetching pending photos:', error);
        return [] as Photo[];
      }
    },
    enabled: auth.isStaff,
  });

  const { data: allPhotos, isLoading: isLoadingAllPhotos } = useQuery({
    queryKey: ['allPhotos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Map Supabase data to our Photo type
        const photos = (data as SupabasePhoto[]).map(photo => ({
          id: photo.id,
          userId: photo.user_id,
          title: photo.title,
          description: photo.description,
          imageUrl: photo.image_url,
          callsign: photo.callsign,
          uploaderName: photo.uploader_name,
          approved: photo.approved,
          voteCount: photo.vote_count,
          uploadMonth: photo.upload_month,
          uploadYear: photo.upload_year,
          createdAt: photo.created_at
        }));
        
        return photos;
      } catch (error) {
        console.error('Error fetching all photos:', error);
        return [] as Photo[];
      }
    },
    enabled: auth.isStaff,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('callsign', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        return data.map(user => ({
          id: user.id,
          email: user.email,
          callsign: user.callsign,
          firstName: user.first_name,
          lastName: user.last_name,
          isStaff: user.is_staff,
          createdAt: user.created_at
        })) as User[];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [] as User[];
      }
    },
    enabled: auth.isStaff,
  });

  const approvePhotoMutation = useMutation({
    mutationFn: onApprovePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
    },
  });

  const rejectPhotoMutation = useMutation({
    mutationFn: onRejectPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: onDeletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: onDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: () => onCreateUser(email, callsign, firstName, lastName, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateUserOpen(false);
      setEmail("");
      setCallsign("");
      setFirstName("");
      setLastName("");
      setPassword("");
    },
  });

  const editUserMutation = useMutation({
    mutationFn: () => {
      if (!selectedUser) return Promise.reject("Nessun utente selezionato");
      const userData: Partial<User> = {};
      if (editEmail !== selectedUser.email) userData.email = editEmail;
      if (editCallsign !== selectedUser.callsign) userData.callsign = editCallsign;
      if (editFirstName !== selectedUser.firstName) userData.firstName = editFirstName;
      if (editLastName !== selectedUser.lastName) userData.lastName = editLastName;
      userData.isStaff = isStaff;
      return onEditUser(selectedUser.id, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUserOpen(false);
      setSelectedUser(null);
      setEditEmail("");
      setEditCallsign("");
      setEditFirstName("");
      setEditLastName("");
      setIsStaff(false);
    },
  });

  const resetPhotosMutation = useMutation({
    mutationFn: onResetPhotos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['allPhotos'] });
    },
  });

  const handleApprove = (photoId: string) => {
    approvePhotoMutation.mutate(photoId);
  };

  const handleReject = (photoId: string) => {
    rejectPhotoMutation.mutate(photoId);
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhotoMutation.mutate(photoId);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleCreateUser = () => {
    createUserMutation.mutate();
  };

  const handleEditUser = () => {
    editUserMutation.mutate();
  };

  const handleOpenEditUser = (user: User) => {
    setSelectedUser(user);
    setEditEmail(user.email);
    setEditCallsign(user.callsign);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setIsStaff(user.isStaff || false);
    setEditUserOpen(true);
  };

  const handleResetPhotos = () => {
    resetPhotosMutation.mutate();
  };

  if (!auth.isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Staff</h1>
        <Button variant="destructive" onClick={onLogout}>Logout</Button>
      </div>

      <Tabs defaultValue="pending" className="w-[90%] mx-auto space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Foto in Attesa</TabsTrigger>
          <TabsTrigger value="all">Tutte le Foto</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>
        
        
        <TabsContent value="pending" className="space-y-2">
          <h2 className="text-xl font-semibold">Foto in Attesa di Approvazione</h2>
          {isLoadingPendingPhotos ? (
            <p>Caricamento foto in attesa...</p>
          ) : pendingPhotos && pendingPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPhotos.map((photo) => (
                <Card key={photo.id} className="bg-white shadow-md rounded-md overflow-hidden">
                  <CardContent className="p-4">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-48 object-cover mb-2 rounded-md" />
                    <h3 className="text-lg font-semibold">{photo.title}</h3>
                    <p className="text-gray-600">{photo.description}</p>
                    <p className="text-sm mt-1">Di: {photo.callsign} - {photo.uploaderName}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4">
                    <Button variant="ghost" onClick={() => approvePhotoMutation.mutate(photo.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approva
                    </Button>
                    <Button variant="ghost" onClick={() => rejectPhotoMutation.mutate(photo.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Rifiuta
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>Nessuna foto in attesa di approvazione</p>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2">
          <h2 className="text-xl font-semibold">Tutte le Foto</h2>
          {isLoadingAllPhotos ? (
            <p>Caricamento di tutte le foto...</p>
          ) : allPhotos && allPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos.map((photo) => (
                <Card key={photo.id} className="bg-white shadow-md rounded-md overflow-hidden">
                  <CardContent className="p-4">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-48 object-cover mb-2 rounded-md" />
                    <h3 className="text-lg font-semibold">{photo.title}</h3>
                    <p className="text-gray-600">{photo.description}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-sm">Di: {photo.callsign}</p>
                      <p className="text-sm flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" /> {photo.voteCount}
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${photo.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {photo.approved ? 'Approvata' : 'In attesa'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end p-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione non può essere annullata. La foto verrà eliminata permanentemente dai nostri server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePhotoMutation.mutate(photo.id)}>Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>Nessuna foto presente</p>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Utenti</h2>
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crea Utente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crea Utente</DialogTitle>
                  <DialogDescription>
                    Crea un nuovo account utente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="callsign" className="text-right">
                      Callsign
                    </Label>
                    <Input id="callsign" value={callsign} onChange={(e) => setCallsign(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstName" className="text-right">
                      Nome
                    </Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Cognome
                    </Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateUser}>Crea Utente</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {isLoadingUsers ? (
            <p>Caricamento utenti...</p>
          ) : users && users.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableCaption>Elenco degli utenti registrati.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Callsign</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cognome</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.callsign}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => handleOpenEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Elimina
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Questa azione non può essere annullata. L'utente verrà eliminato permanentemente dai nostri server.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Elimina</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>Nessun utente registrato</p>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-2">
          <h2 className="text-xl font-semibold">Impostazioni</h2>
          <Card className="bg-white shadow-md rounded-md overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Area Pericolosa</h3>
              <p className="text-gray-600 mb-4">Fai attenzione con queste azioni.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Elimina Tutte le Foto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione non può essere annullata. Verranno eliminate tutte le foto dai nostri server.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetPhotos}>Elimina Tutte le Foto</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifica Utente</DialogTitle>
            <DialogDescription>
              Modifica un account utente esistente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmail" className="text-right">
                Email
              </Label>
              <Input id="editEmail" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editCallsign" className="text-right">
                Callsign
              </Label>
              <Input id="editCallsign" value={editCallsign} onChange={(e) => setEditCallsign(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editFirstName" className="text-right">
                Nome
              </Label>
              <Input id="editFirstName" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLastName" className="text-right">
                Cognome
              </Label>
              <Input id="editLastName" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isStaff" className="text-right">
                Staff
              </Label>
              <Input id="isStaff" type="checkbox" checked={isStaff} onChange={(e) => setIsStaff(e.target.checked)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditUser}>Salva Modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
