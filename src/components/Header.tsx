import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Film, Ticket, LogOut, LogIn, Clock } from 'lucide-react';

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Film className="h-5 w-5 text-primary" />
          <span>CineReserve</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reservations">
                  <Clock className="h-4 w-4 mr-1" />
                  Reservas
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tickets">
                  <Ticket className="h-4 w-4 mr-1" />
                  Ingressos
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-1" />
                Entrar
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
