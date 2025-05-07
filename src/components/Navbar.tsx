
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Upload, User, Lock } from "lucide-react";
import { AuthState } from "@/types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
}

const Navbar = ({ auth, onLogout }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isStaff } = auth;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-airline-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-airline-accent font-bold text-2xl">Foto Contest</div>
            <div className="font-light text-xl">Aerosachs</div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-airline-accent transition-colors">
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-airline-accent transition-colors">
                  Dashboard
                </Link>
                <Link to="/upload" className="hover:text-airline-accent transition-colors">
                  Carica Foto
                </Link>
                {isStaff && (
                  <Link to="/staff" className="text-airline-accent hover:text-white transition-colors">
                    Area Staff
                  </Link>
                )}
                <Button variant="outline" onClick={handleLogout} className="border-white text-white hover:bg-white hover:text-airline-blue">
                  Logout
                </Button>
                <div className="px-3 py-1 rounded-full bg-airline-lightblue">
                  {user.callsign}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-airline-accent transition-colors">
                  Accedi
                </Link>
                <Link to="/register">
                  <Button className="bg-airline-accent text-airline-blue hover:bg-white">
                    Registrati
                  </Button>
                </Link>
                <Link to="/staff-login">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-airline-blue">
                    <Lock className="mr-2 h-4 w-4" />
                    Staff
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" className="text-white" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={cn("md:hidden", mobileMenuOpen ? "block" : "hidden")}>
          <div className="flex flex-col space-y-4 pb-4">
            <Link to="/" className="py-2 hover:text-airline-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="py-2 hover:text-airline-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/upload" className="py-2 hover:text-airline-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <Upload className="inline-block mr-2 h-4 w-4" />
                  Carica Foto
                </Link>
                {isStaff && (
                  <Link to="/staff" className="py-2 text-airline-accent hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Lock className="inline-block mr-2 h-4 w-4" />
                    Area Staff
                  </Link>
                )}
                <div className="py-2 flex items-center">
                  <User className="inline-block mr-2 h-4 w-4" />
                  {user.callsign} - {user.firstName}
                </div>
                <Button variant="outline" onClick={handleLogout} className="border-white text-white hover:bg-white hover:text-airline-blue">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 hover:text-airline-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Accedi
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-airline-accent text-airline-blue hover:bg-white">
                    Registrati
                  </Button>
                </Link>
                <Link to="/staff-login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-airline-blue">
                    <Lock className="mr-2 h-4 w-4" />
                    Staff
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
