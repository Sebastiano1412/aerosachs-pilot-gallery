
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Calendar, User } from "lucide-react";
import { Photo } from "@/types";
import { cn, formatDate, showErrorToast, showSuccessToast } from "@/lib/utils";

interface PhotoDetailProps {
  photo: Photo;
  currentUserId: string | null;
  votesRemaining: number;
  onVote: (photoId: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const PhotoDetail = ({ photo, currentUserId, votesRemaining, onVote, isOpen, onClose }: PhotoDetailProps) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!currentUserId) {
      showErrorToast("Accedi per votare");
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
    isVoting || 
    !currentUserId || 
    photo.userId === currentUserId || 
    votesRemaining <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{photo.title}</DialogTitle>
          <DialogDescription className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>
              {photo.callsign} - {photo.uploaderName}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-hidden rounded-md">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full object-contain max-h-[60vh]"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(photo.createdAt)}</span>
            </div>
            <div className="flex items-center text-airline-accent">
              <Star className="h-5 w-5 fill-airline-accent text-airline-accent mr-1" />
              <span className="font-bold text-lg">{photo.voteCount}</span>
            </div>
          </div>
          
          <p className="text-muted-foreground">{photo.description}</p>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
            
            {currentUserId && (
              <Button
                className={cn(
                  "flex items-center gap-2",
                  isVoteDisabled ? "bg-muted text-muted-foreground" : "bg-airline-accent text-airline-blue hover:bg-airline-accent/80"
                )}
                onClick={handleVote}
                disabled={isVoteDisabled}
              >
                <Star className={cn("h-4 w-4", !isVoteDisabled && "fill-airline-blue")} />
                {isVoteDisabled && photo.userId === currentUserId ? "Tua foto" : `Vota (${votesRemaining} rimasti)`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDetail;
