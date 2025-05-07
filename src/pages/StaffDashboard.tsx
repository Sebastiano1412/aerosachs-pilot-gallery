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
      // Replace with actual Supabase fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      return [] as Photo[];
    },
    enabled: auth.isStaff,
  });

  const { data: allPhotos, isLoading: isLoadingAllPhotos } = useQuery({
    queryKey: ['allPhotos'],
    queryFn: async () => {
      // Replace with actual Supabase fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      return [] as Photo[];
    },
    enabled: auth.isStaff,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Replace with actual Supabase fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      return [] as User[];
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
      if (!selectedUser) return Promise.reject("No user selected");
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
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <Button variant="destructive" onClick={onLogout}>Logout</Button>
      </div>

      <Tabs defaultValue="pending" className="w-[90%] mx-auto space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Photos</TabsTrigger>
          <TabsTrigger value="all">All Photos</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-2">
          <h2 className="text-xl font-semibold">Pending Photos</h2>
          {isLoadingPendingPhotos ? (
            <p>Loading pending photos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPhotos?.map((photo) => (
                <Card key={photo.id} className="bg-white shadow-md rounded-md overflow-hidden">
                  <CardContent className="p-4">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-48 object-cover mb-2 rounded-md" />
                    <h3 className="text-lg font-semibold">{photo.title}</h3>
                    <p className="text-gray-600">{photo.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4">
                    <Button variant="ghost" onClick={() => handleApprove(photo.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="ghost" onClick={() => handleReject(photo.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2">
          <h2 className="text-xl font-semibold">All Photos</h2>
          {isLoadingAllPhotos ? (
            <p>Loading all photos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPhotos?.map((photo) => (
                <Card key={photo.id} className="bg-white shadow-md rounded-md overflow-hidden">
                  <CardContent className="p-4">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-48 object-cover mb-2 rounded-md" />
                    <h3 className="text-lg font-semibold">{photo.title}</h3>
                    <p className="text-gray-600">{photo.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end p-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the photo from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Users</h2>
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                  <DialogDescription>
                    Create a new user account.
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
                      First Name
                    </Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Last Name
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
                  <Button onClick={handleCreateUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {isLoadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of your registered users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Callsign</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.callsign}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" onClick={() => handleOpenEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-2">
          <h2 className="text-xl font-semibold">Settings</h2>
          <Card className="bg-white shadow-md rounded-md overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Danger Zone</h3>
              <p className="text-gray-600 mb-4">Be careful with these actions.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Photos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all photos from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetPhotos}>Reset Photos</AlertDialogAction>
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
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit an existing user account.
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
                First Name
              </Label>
              <Input id="editFirstName" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editLastName" className="text-right">
                Last Name
              </Label>
              <Input id="editLastName" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isStaff" className="text-right">
                Is Staff
              </Label>
              <Input id="isStaff" type="checkbox" checked={isStaff} onChange={(e) => setIsStaff(e.target.checked)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditUser}>Edit User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
