import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessions as sessionsApi, reservations, type Seat } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { SeatGrid } from '@/components/SeatGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function SessionSeats() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    sessionsApi.seats(parseInt(sessionId))
      .then(data => setSeats(data.results))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSelectSeat = (seat: Seat) => {
    setSelectedSeat(prev => prev?.id === seat.id ? null : seat);
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para reservar um assento.');
      navigate('/login');
      return;
    }
    if (!selectedSeat) return;

    setReserving(true);
    try {
      await reservations.create(selectedSeat.id);
      toast.success(`Assento ${selectedSeat.seat_number} reservado com sucesso!`);
      navigate('/reservations');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro';
      try {
        const parsed = JSON.parse(message);
        const firstError = Object.values(parsed).flat()[0];
        toast.error(String(firstError));
      } catch {
        toast.error('Erro ao reservar. Tente novamente.');
      }
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-2">Escolha seu Assento</h1>
        <p className="text-muted-foreground text-sm mb-8">Selecione um assento disponível e confirme sua reserva</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <SeatGrid
              seats={seats}
              selectedSeatId={selectedSeat?.id ?? null}
              onSelectSeat={handleSelectSeat}
            />

            <div className="mt-8 cinema-card p-5 flex items-center justify-between">
              <div>
                {selectedSeat ? (
                  <p className="text-foreground font-medium">
                    Assento selecionado: <span className="text-primary">{selectedSeat.seat_number}</span>
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhum assento selecionado</p>
                )}
              </div>
              <Button
                onClick={handleReserve}
                disabled={!selectedSeat || reserving}
              >
                {reserving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Processando...</>
                ) : (
                  'Reservar Assento'
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
