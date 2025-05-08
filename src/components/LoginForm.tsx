
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
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Auth state for the Navbar
  const auth: AuthState = {
    user: null,
    isStaff: false,
    isLoading: false
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showErrorToast("Inserisci email e password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onLogin(email, password);
      showSuccessToast("Accesso effettuato con successo!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      showErrorToast(error.message || "Errore di accesso. Controlla email e password.");
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
            <CardTitle className="text-2xl font-bold text-center">Accedi</CardTitle>
            <CardDescription className="text-center">
              Accedi al tuo account Foto Contest Aerosachs
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
              <Button
                type="submit"
                className="w-full bg-airline-blue hover:bg-airline-lightblue"
                disabled={isLoading}
              >
                {isLoading ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm">
              Non hai un account?{" "}
              <Link to="/register" className="text-airline-lightblue hover:underline">
                Registrati
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link to="/staff-login" className="text-airline-lightblue hover:underline">
                Accesso Staff
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default LoginForm;
