
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, AlertTriangle } from "lucide-react";
import { UploadState } from "@/types";
import { showErrorToast, showSuccessToast } from "@/lib/utils";

interface UploadPhotoProps {
  uploadState: UploadState;
  onUpload: (title: string, description: string, file: File) => Promise<void>;
}

const UploadPhoto = ({ uploadState, onUpload }: UploadPhotoProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  
  const { uploadCount, uploadLimit } = uploadState;
  const remainingUploads = uploadLimit - uploadCount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check if file is an image
    if (!selectedFile.type.match('image.*')) {
      showErrorToast("Seleziona un'immagine valida");
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      showErrorToast("L'immagine non deve superare i 5MB");
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const validateForm = () => {
    if (!title.trim()) {
      showErrorToast("Inserisci un titolo");
      return false;
    }
    
    if (!description.trim()) {
      showErrorToast("Inserisci una descrizione");
      return false;
    }
    
    if (!file) {
      showErrorToast("Seleziona un'immagine");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (remainingUploads <= 0) {
      showErrorToast("Hai raggiunto il limite di caricamenti per questo mese");
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsUploading(true);
    
    try {
      await onUpload(title, description, file as File);
      showSuccessToast("Foto caricata con successo! Verrà approvata dallo staff.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      showErrorToast("Errore durante il caricamento. Riprova.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Carica una nuova foto</CardTitle>
        <CardDescription>
          Carica la tua foto per partecipare al concorso mensile
        </CardDescription>
      </CardHeader>
      <CardContent>
        {remainingUploads > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-semibold">
                  Caricamenti rimasti: {remainingUploads}/{uploadLimit}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                placeholder="Titolo della foto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                placeholder="Descrivi la tua foto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photo">Foto</Label>
              <div className="border-2 border-dashed rounded-md border-muted p-6 flex flex-col items-center justify-center">
                {preview ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto object-contain rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Cambia immagine
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      Clicca per selezionare o trascina un'immagine
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF (max 5MB)
                    </p>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById("photo")?.click()}
                    >
                      Seleziona immagine
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Alert className="bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Informazione</AlertTitle>
                <AlertDescription>
                  La tua foto sarà visibile dopo l'approvazione dello staff. La classifica viene azzerata ogni mese.
                </AlertDescription>
              </Alert>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-airline-blue hover:bg-airline-lightblue"
              disabled={isUploading}
            >
              {isUploading ? "Caricamento in corso..." : "Carica foto"}
            </Button>
          </form>
        ) : (
          <div className="py-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Limite raggiunto</AlertTitle>
              <AlertDescription>
                Hai raggiunto il limite di {uploadLimit} foto per questo mese.
                Potrai caricare altre foto il prossimo mese.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
        >
          Torna alla dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UploadPhoto;
