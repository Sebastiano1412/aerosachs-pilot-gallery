
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Photo } from "@/types";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";

interface PhotoCardProps {
  photo: Photo;
  currentUserId: string | null;
  votesRemaining: number;
  onVote: (photoId: string) => Promise<void>;
  canVote: boolean;
}

const PhotoCard = ({ photo, currentUserId, votesRemaining, onVote, canVote }: PhotoCardProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/photo/${photo.id}`);
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUserId) {
      showErrorToast("Accedi per votare");
      navigate("/login");
      return;
    }
    
    if (photo.userId === currentUserId) {
      showErrorToast("Non puoi votare le tue foto");
      return;
    }
    
    if (votesRemaining <= 0) {
      showErrorToast("Hai esaurito i voti per questo mese");
      return;
    }
    
    setIsVoting(true);
    
    try {
      await onVote(photo.id);
      showSuccessToast(`Hai votato per "${photo.title}"`);
    } catch (error) {
      console.error("Vote error:", error);
      showErrorToast("Errore durante il voto");
    } finally {
      setIsVoting(false);
    }
  };

  // Determine if vote button should be disabled
  const isVoteDisabled = 
    !canVote || 
    isVoting || 
    !currentUserId || 
    photo.userId === currentUserId || 
    votesRemaining <= 0;

  return (
    <Card 
      className="h-full overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={handleViewDetails}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold line-clamp-1">{photo.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {photo.callsign} - {photo.uploaderName}
        </p>
        <div className="flex items-center mt-2">
          <div className="flex items-center text-airline-accent">
            <Star className="h-4 w-4 fill-airline-accent text-airline-accent mr-1" />
            <span className="font-semibold">{photo.voteCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetails}
        >
          Dettagli
        </Button>
        {canVote && (
          <Button
            size="sm"
            className={cn(
              "flex items-center gap-1",
              isVoteDisabled ? "bg-muted text-muted-foreground" : "bg-airline-accent text-airline-blue hover:bg-airline-accent/80"
            )}
            onClick={handleVote}
            disabled={isVoteDisabled}
          >
            <Star className={cn("h-4 w-4", !isVoteDisabled && "fill-airline-blue")} />
            Vota
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;
