import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservations as reservationsApi, type Reservation } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reservations() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadReservations();
  }, [isAuthenticated]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationsApi.list();
      setReservationsList(data.results);
    } catch {
      toast.error('Erro ao carregar reservas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (reservation: Reservation) => {
    setCheckingOutId(reservation.id);
    try {
      await reservationsApi.checkout(reservation.id);
      toast.success('Ingresso gerado com sucesso! 🎬');
      navigate('/tickets');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro';
      try {
        const parsed = JSON.parse(message);
        const firstError = Object.values(parsed).flat()[0];
        toast.error(String(firstError));
      } catch {
        toast.error('Erro ao finalizar compra. Tente novamente.');
      }
    } finally {
      setCheckingOutId(null);
    }
  };

  const activeReservations = reservationsList.filter(r => r.is_active);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-2">Minhas Reservas</h1>
        <p className="text-muted-foreground text-sm mb-8">Finalize a compra das suas reservas ativas</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="cinema-card p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Nenhuma reserva ativa encontrada.</p>
            <Button variant="outline" onClick={() => navigate('/')}>Ver Filmes</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map(reservation => (
              <div key={reservation.id} className="cinema-card p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-foreground font-medium">
                    Assento: <span className="text-primary">#{reservation.seat}</span>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expira em {format(new Date(reservation.reserved_until), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Button
                  onClick={() => handleCheckout(reservation)}
                  disabled={checkingOutId === reservation.id}
                  size="sm"
                >
                  {checkingOutId === reservation.id ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Processando...</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4 mr-1" /> Comprar</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
