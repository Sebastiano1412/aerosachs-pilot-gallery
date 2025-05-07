
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { Photo, AuthState, UploadState } from "@/types";
import { cn, getCurrentMonthYear, getMonthName } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// This is a placeholder - in production this would fetch from Supabase
const fetchApprovedPhotos = async (): Promise<Photo[]> => {
  // Simulating network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the demo, returning empty array
  // In production, this would be a Supabase query
  return [];
};

interface IndexProps {
  auth: AuthState;
  uploadState: UploadState;
  onLogout: () => void;
  onVotePhoto: (photoId: string) => Promise<void>;
}

const Index = ({ auth, uploadState, onLogout, onVotePhoto }: IndexProps) => {
  const { user, isLoading: isAuthLoading } = auth;
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { month, year } = getCurrentMonthYear();

  // Fetch photos using React Query
  const { data: photos = [], isLoading: isPhotosLoading } = useQuery({
    queryKey: ['photos', month, year],
    queryFn: fetchApprovedPhotos,
  });

  // Open photo detail modal when URL has photo ID
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const photoId = urlParams.get('photo');
      
      if (photoId) {
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
          setSelectedPhoto(photo);
          setIsDetailOpen(true);
        }
      } else {
        setIsDetailOpen(false);
      }
    };
    
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [photos]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDetailOpen(true);
    
    // Update URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('photo', photo.id);
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    
    // Remove photo param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('photo');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar auth={auth} onLogout={onLogout} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Foto Contest Aerosachs</h1>
          <div className="flex items-center justify-center space-x-2 text-lg mb-6">
            <Calendar className="h-5 w-5 text-airline-accent" />
            <span>
              Classifica <strong>{getMonthName(month)} {year}</strong>
            </span>
          </div>
          
          {user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button className="bg-airline-blue hover:bg-airline-lightblue">
                  Dashboard Pilota
                </Button>
              </Link>
              <Link to="/upload">
                <Button className="bg-airline-accent text-airline-blue hover:bg-airline-accent/80">
                  Carica Foto
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button className="bg-airline-blue hover:bg-airline-lightblue">
                  Accedi
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-airline-accent text-airline-blue hover:bg-airline-accent/80">
                  Registrati come Pilota
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isPhotosLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
          </div>
        ) : photos.length > 0 ? (
          <div className="photo-grid animate-fade-in">
            {photos.map((photo) => (
              <div key={photo.id} onClick={() => handlePhotoClick(photo)}>
                <PhotoCard
                  photo={photo}
                  currentUserId={user?.id || null}
                  votesRemaining={uploadState.voteLimit - uploadState.votesUsed}
                  onVote={onVotePhoto}
                  canVote={!!user}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className={cn("text-center py-16 px-4", isPhotosLoading ? "opacity-0" : "opacity-100 animate-fade-in")}>
            <CardContent>
              <h2 className="text-2xl font-semibold mb-4">Nessuna foto disponibile</h2>
              <p className="text-muted-foreground mb-6">
                {user ? (
                  <>Sii il primo a caricare una foto per il contest di questo mese!</>
                ) : (
                  <>Registrati e carica le tue foto per partecipare al contest mensile.</>
                )}
              </p>
              {user ? (
                <Link to="/upload">
                  <Button className="bg-airline-accent text-airline-blue hover:bg-airline-accent/80">
                    Carica la tua prima foto
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button className="bg-airline-accent text-airline-blue hover:bg-airline-accent/80">
                    Registrati ora
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
        
        {selectedPhoto && (
          <PhotoDetail
            photo={selectedPhoto}
            currentUserId={user?.id || null}
            votesRemaining={uploadState.voteLimit - uploadState.votesUsed}
            onVote={onVotePhoto}
            isOpen={isDetailOpen}
            onClose={handleCloseDetail}
          />
        )}
      </main>

      <footer className="bg-airline-blue text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Foto Contest Aerosachs</h2>
          <p className="text-sm opacity-80">
            La piattaforma ufficiale per condividere e votare le foto dei piloti della virtual airline Aerosachs.
          </p>
          <div className="mt-4 text-xs opacity-60">
            &copy; {new Date().getFullYear()} Aerosachs Virtual Airline. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
