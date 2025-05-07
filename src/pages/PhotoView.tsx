
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PhotoDetail from "@/components/PhotoDetail";
import { Photo, AuthState, UploadState } from "@/types";
import { useQuery } from "@tanstack/react-query";

// This is a placeholder - in production this would fetch from Supabase
const fetchPhoto = async (photoId: string): Promise<Photo | null> => {
  // Simulating network request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For the demo, returning null
  // In production, this would be a Supabase query
  return null;
};

interface PhotoViewProps {
  auth: AuthState;
  uploadState: UploadState;
  onLogout: () => void;
  onVotePhoto: (photoId: string) => Promise<void>;
}

const PhotoView = ({ auth, uploadState, onLogout, onVotePhoto }: PhotoViewProps) => {
  const { photoId } = useParams<{ photoId: string }>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = auth;

  // Fetch photo using React Query
  const { data: photo, isLoading } = useQuery({
    queryKey: ['photo', photoId],
    queryFn: () => fetchPhoto(photoId || ''),
    enabled: !!photoId,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!photo) {
        // Photo not found, redirect to home
        navigate("/");
      } else {
        setIsDetailOpen(true);
      }
    }
  }, [photo, isLoading, navigate]);

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar auth={auth} onLogout={onLogout} />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-airline-blue"></div>
        </div>
      </div>
    );
  }

  if (!photo) {
    return null; // The useEffect will redirect
  }

  return (
    <div className="min-h-screen">
      <Navbar auth={auth} onLogout={onLogout} />
      <PhotoDetail
        photo={photo}
        currentUserId={user?.id || null}
        votesRemaining={uploadState.voteLimit - uploadState.votesUsed}
        onVote={onVotePhoto}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default PhotoView;
