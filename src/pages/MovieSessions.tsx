import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movies as moviesApi, type Session, type Movie } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MovieSessions() {
  const { movieId } = useParams<{ movieId: string }>();
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    const id = parseInt(movieId);
    setLoading(true);

    Promise.all([
      moviesApi.sessions(id),
      moviesApi.list().then(data => data.results.find(m => m.id === id) || null),
    ]).then(([sessionsData, movieData]) => {
      setSessionList(sessionsData.results);
      setMovie(movieData ?? null);
    }).finally(() => setLoading(false));
  }, [movieId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link>
        </Button>

        {movie && (
          <div className="flex gap-6 mb-8">
            <img
              src={movie.banner}
              alt={movie.title}
              className="w-32 h-48 object-cover rounded-lg shadow-md hidden sm:block"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{movie.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">{movie.genre} • {movie.duration} min</p>
              <p className="text-muted-foreground text-sm mt-3 max-w-lg">{movie.description}</p>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground mb-4">Sessões Disponíveis</h2>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="cinema-card p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && sessionList.length === 0 && (
          <div className="cinema-card p-8 text-center">
            <p className="text-muted-foreground">Nenhuma sessão disponível para este filme.</p>
          </div>
        )}

        {!loading && sessionList.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessionList.map((session) => (
              <Link
                key={session.id}
                to={`/sessions/${session.id}/seats`}
                className="cinema-card p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2 text-foreground font-medium mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {format(new Date(session.session_datetime), "dd 'de' MMMM', às' HH:mm", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {session.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {session.total_seats} assentos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
