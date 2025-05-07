
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { isStaffPassword, showErrorToast, showSuccessToast } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthState } from "@/types";

interface StaffLoginProps {
  onStaffLogin: (password: string) => void;
}

const StaffLogin = ({ onStaffLogin }: StaffLoginProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auth state for the Navbar
  const auth: AuthState = {
    user: null,
    isStaff: false,
    isLoading: false
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      showErrorToast("Inserisci la password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isStaffPassword(password)) {
        onStaffLogin(password);
        showSuccessToast("Accesso staff effettuato con successo!");
        navigate("/staff");
      } else {
        showErrorToast("Password staff non valida");
      }
    } catch (error) {
      console.error("Staff login error:", error);
      showErrorToast("Errore durante l'accesso staff");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar auth={auth} onLogout={() => {}} />
      <div className="flex-grow flex items-center justify-center p-4 my-8">
        <Card className="w-full max-w-md mx-auto border-l-4 border-airline-accent">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-airline-blue p-3 rounded-full">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Area Staff</CardTitle>
            <CardDescription className="text-center">
              Accedi all'area riservata allo staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staffPassword">Password Staff</Label>
                <Input
                  id="staffPassword"
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
                {isLoading ? "Accesso in corso..." : "Accedi come Staff"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              <Link to="/" className="text-airline-lightblue hover:underline">
                Torna alla home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default StaffLogin;
