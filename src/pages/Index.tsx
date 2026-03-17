import { useState, useEffect } from 'react';
import { movies as moviesApi, type Movie } from '@/lib/api';
import { MovieCard } from '@/components/MovieCard';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MoviesPage() {
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    moviesApi.list(page)
      .then((data) => {
        setMovieList(data.results);
        setHasNext(!!data.next);
        setHasPrev(!!data.previous);
      })
      .catch(() => setError('Não foi possível carregar os filmes. Verifique se a API está rodando.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            Em Cartaz
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Escolha um filme para ver as sessões disponíveis</p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="cinema-card overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="cinema-card p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-muted-foreground text-sm mt-2">Certifique-se de que sua API está rodando em <code className="bg-muted px-1.5 py-0.5 rounded text-xs">localhost:8000</code></p>
          </div>
        )}

        {!loading && !error && movieList.length === 0 && (
          <div className="cinema-card p-8 text-center">
            <p className="text-muted-foreground">Nenhum filme disponível no momento.</p>
          </div>
        )}

        {!loading && !error && movieList.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
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
