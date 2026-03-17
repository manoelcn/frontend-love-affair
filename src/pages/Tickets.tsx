import { useState, useEffect } from 'react';
import { tickets as ticketsApi, type Ticket } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Ticket as TicketIcon, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function TicketsPage() {
  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    setLoading(true);
    ticketsApi.list(page)
      .then(data => {
        setTicketList(data.results);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      })
      .catch(() => toast.error('Erro ao carregar ingressos'))
      .finally(() => setLoading(false));
  }, [page]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
          <TicketIcon className="h-6 w-6 text-primary" />
          Meus Ingressos
        </h1>
        <p className="text-muted-foreground text-sm mb-8">Seus ingressos comprados</p>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="cinema-card p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && ticketList.length === 0 && (
          <div className="cinema-card p-8 text-center">
            <p className="text-muted-foreground">Você ainda não possui ingressos.</p>
          </div>
        )}

        {!loading && ticketList.length > 0 && (
          <>
            <div className="space-y-3">
              {ticketList.map((ticket) => (
                <div key={ticket.id} className="cinema-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Código do ingresso</p>
                      <p className="font-mono text-sm text-foreground">{ticket.code}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyCode(ticket.code)} title="Copiar código">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>Comprado em {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              ))}
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
