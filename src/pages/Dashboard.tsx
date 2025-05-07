
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Eye, Star, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { Photo, AuthState, UploadState } from "@/types";
import { getCurrentMonthYear, getMonthName } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// This is a placeholder - in production this would fetch from Supabase
const fetchUserPhotos = async (userId: string): Promise<Photo[]> => {
  // Simulating network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the demo, returning empty array
  // In production, this would be a Supabase query
  return [];
};

interface DashboardProps {
  auth: AuthState;
  uploadState: UploadState;
  onLogout: () => void;
  onVotePhoto: (photoId: string) => Promise<void>;
}

const Dashboard = ({ auth, uploadState, onLogout, onVotePhoto }: DashboardProps) => {
  const { user, isLoading: isAuthLoading } = auth;
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  
  const { month, year } = getCurrentMonthYear();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/login");
    }
  }, [user, isAuthLoading, navigate]);

  // Fetch user photos using React Query
  const { data: userPhotos = [], isLoading: isPhotosLoading } = useQuery({
    queryKey: ['userPhotos', user?.id, month, year],
    queryFn: () => fetchUserPhotos(user?.id || ''),
    enabled: !!user,
  });

  const pendingPhotos = userPhotos.filter(photo => !photo.approved);
  const approvedPhotos = userPhotos.filter(photo => photo.approved);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar auth={auth} onLogout={onLogout} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard Pilota</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Caricamenti</CardTitle>
              <CardDescription>Foto caricate questo mese</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{uploadState.uploadCount} / {uploadState.uploadLimit}</div>
                <Upload className="h-5 w-5 text-airline-blue" />
              </div>
              <div className="mt-2">
                {uploadState.uploadCount < uploadState.uploadLimit ? (
                  <Link to="/upload">
                    <Button size="sm" className="w-full bg-airline-blue hover:bg-airline-lightblue">
                      Carica foto
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" disabled className="w-full">
                    Limite raggiunto
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Voti</CardTitle>
              <CardDescription>I tuoi voti disponibili</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{uploadState.voteLimit - uploadState.votesUsed} / {uploadState.voteLimit}</div>
                <Star className="h-5 w-5 text-airline-accent" />
              </div>
              <div className="mt-2">
                <Link to="/">
                  <Button size="sm" className="w-full bg-airline-accent text-airline-blue hover:bg-airline-accent/80">
                    Vota foto
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Contest Attivo</CardTitle>
              <CardDescription>Mese corrente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{getMonthName(month)}</div>
                <Calendar className="h-5 w-5 text-airline-lightblue" />
              </div>
              <div className="mt-2">
                <Link to="/">
                  <Button size="sm" variant="outline" className="w-full">
                    Vedi classifica
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="my-photos" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="my-photos">Le mie foto</TabsTrigger>
            <TabsTrigger value="pending">In revisione {pendingPhotos.length > 0 && `(${pendingPhotos.length})`}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-photos" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Le mie foto pubblicate</h2>
            
            {isPhotosLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
              </div>
            ) : approvedPhotos.length > 0 ? (
              <div className="photo-grid">
                {approvedPhotos.map((photo) => (
                  <div key={photo.id} onClick={() => handlePhotoClick(photo)}>
                    <PhotoCard
                      photo={photo}
                      currentUserId={user.id}
                      votesRemaining={uploadState.voteLimit - uploadState.votesUsed}
                      onVote={onVotePhoto}
                      canVote={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8 px-4">
                <CardContent>
                  <Eye className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nessuna foto pubblicata</h3>
                  <p className="text-muted-foreground mb-6">
                    Non hai ancora foto approvate per questo mese.
                  </p>
                  <Link to="/upload">
                    <Button className="bg-airline-blue hover:bg-airline-lightblue">
                      Carica la tua prima foto
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Foto in attesa di approvazione</h2>
            
            {isPhotosLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
              </div>
            ) : pendingPhotos.length > 0 ? (
              <div className="photo-grid">
                {pendingPhotos.map((photo) => (
                  <div key={photo.id} onClick={() => handlePhotoClick(photo)}>
                    <PhotoCard
                      photo={photo}
                      currentUserId={user.id}
                      votesRemaining={uploadState.voteLimit - uploadState.votesUsed}
                      onVote={onVotePhoto}
                      canVote={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8 px-4">
                <CardContent>
                  <Eye className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nessuna foto in revisione</h3>
                  <p className="text-muted-foreground mb-6">
                    Non hai foto in attesa di approvazione.
                  </p>
                  {uploadState.uploadCount < uploadState.uploadLimit && (
                    <Link to="/upload">
                      <Button className="bg-airline-blue hover:bg-airline-lightblue">
                        Carica una nuova foto
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {selectedPhoto && (
          <PhotoDetail
            photo={selectedPhoto}
            currentUserId={user.id}
            votesRemaining={uploadState.voteLimit - uploadState.votesUsed}
            onVote={onVotePhoto}
            isOpen={isDetailOpen}
            onClose={handleCloseDetail}
          />
        )}
      </main>
      
      <footer className="bg-airline-blue text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm opacity-80">
          &copy; {new Date().getFullYear()} Aerosachs Virtual Airline. Tutti i diritti riservati.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
