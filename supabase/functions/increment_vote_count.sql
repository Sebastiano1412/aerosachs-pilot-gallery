
-- Funzione per incrementare il contatore dei voti in modo sicuro
CREATE OR REPLACE FUNCTION public.increment_vote_count(photo_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.photos
  SET vote_count = vote_count + 1
  WHERE id = photo_id;
$$;
