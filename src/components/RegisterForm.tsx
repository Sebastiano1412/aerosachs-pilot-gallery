import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthState } from "@/types";

interface RegisterFormProps {
  onRegister: (email: string, callsign: string, firstName: string, lastName: string, password: string) => Promise<void>;
}

const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [callsign, setCallsign] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auth state for the Navbar
  const auth: AuthState = {
    user: null,
    isStaff: false,
    isLoading: false
  };

  const validateForm = () => {
    if (!email || !callsign || !firstName || !lastName || !password || !confirmPassword) {
      showErrorToast("Compila tutti i campi");
      return false;
    }

    const callsignRegex = /^ASX\d{3}$/;
    if (!callsignRegex.test(callsign)) {
      showErrorToast("Il callsign deve essere nel formato ASX seguito da 3 numeri (es. ASX010)");
      return false;
    }

    if (password !== confirmPassword) {
      showErrorToast("Le password non coincidono");
      return false;
    }

    if (password.length < 6) {
      showErrorToast("La password deve contenere almeno 6 caratteri");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onRegister(email, callsign, firstName, lastName, password);
      showSuccessToast("Registrazione completata con successo!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      showErrorToast(error.message || "Errore durante la registrazione. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar auth={auth} onLogout={() => {}} />
      <div className="flex-grow flex items-center justify-center p-4 my-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Registrazione</CardTitle>
            <CardDescription className="text-center">
              Crea un nuovo account per partecipare al Foto Contest Aerosachs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="la-tua-email@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callsign">Callsign</Label>
                <Input
                  id="callsign"
                  type="text"
                  placeholder="ASX010"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Il callsign deve essere nel formato ASX seguito da 3 numeri (es. ASX010)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Nome"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Cognome"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-airline-blue hover:bg-airline-lightblue"
                disabled={isLoading}
              >
                {isLoading ? "Registrazione in corso..." : "Registrati"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Hai già un account?{" "}
              <Link to="/login" className="text-airline-lightblue hover:underline">
                Accedi
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterForm;
