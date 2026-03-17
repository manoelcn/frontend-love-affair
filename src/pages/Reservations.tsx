import { useState, useEffect } from 'react';
import { reservations as reservationsApi, type Reservation } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, ShoppingCart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [reservationList, setReservationList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [checkingOut, setCheckingOut] = useState<number | null>(null);

  const fetchReservations = (p: number) => {
    setLoading(true);
    reservationsApi.list(p)
      .then(data => {
        setReservationList(data.results);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      })
      .catch(() => toast.error('Erro ao carregar reservas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations(page);
  }, [page]);

  const handleCheckout = async (reservation: Reservation) => {
    setCheckingOut(reservation.id);
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
      setCheckingOut(null);
    }
  };

  const isExpired = (reservedUntil: string) => new Date(reservedUntil) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Clock className="h-6 w-6 text-primary" />
          Minhas Reservas
        </h1>
        <p className="text-muted-foreground text-sm mb-8">Finalize a compra das suas reservas ativas</p>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && reservationList.length === 0 && (
          <div className="cinema-card p-8 text-center">
            <p className="text-muted-foreground">Você não possui reservas ativas.</p>
          </div>
        )}

        {!loading && reservationList.length > 0 && (
          <>
            <div className="space-y-3">
              {reservationList.map((reservation) => {
                const expired = isExpired(reservation.reserved_until);
                return (
                  <div key={reservation.id} className="cinema-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Assento: <span className="text-primary">{reservation.seat}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {expired ? (
                            <span className="text-destructive">Reserva expirada</span>
                          ) : (
                            <>Expira em {format(new Date(reservation.reserved_until), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</>
                          )}
                        </p>
                        {reservation.is_active && (
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Ativa
                          </span>
                        )}
                      </div>
                      {reservation.is_active && !expired && (
                        <Button
                          onClick={() => handleCheckout(reservation)}
                          disabled={checkingOut === reservation.id}
                          size="sm"
                        >
                          {checkingOut === reservation.id ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Processando...</>
                          ) : (
                            <><ShoppingCart className="h-4 w-4 mr-1" /> Comprar</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <span className="text-sm text-muted-foreground">Página {page}</span>
              <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage(p => p + 1)}>
                Próxima <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
