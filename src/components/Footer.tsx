
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-airline-blue text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <span className="text-airline-skyblue font-bold text-xl">Foto Contest</span>
              <span className="font-light">Aerosachs</span>
            </div>
            <p className="text-sm mt-2">© {currentYear} Aerosachs Virtual Airline. Tutti i diritti riservati.</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/" className="hover:text-airline-skyblue transition-colors text-sm">
              Home
            </Link>
            <Link to="/dashboard" className="hover:text-airline-skyblue transition-colors text-sm">
              Dashboard
            </Link>
            <Link to="/upload" className="hover:text-airline-skyblue transition-colors text-sm">
              Carica Foto
            </Link>
            <Link to="/staff-login" className="hover:text-airline-skyblue transition-colors text-sm">
              Area Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
