import { Link } from 'react-router-dom';
import type { Movie } from '@/lib/api';
import { Clock, Tag } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movies/${movie.id}/sessions`} className="cinema-card group overflow-hidden">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={movie.banner}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-1">{movie.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {movie.genre}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {movie.duration} min
          </span>
        </div>
      </div>
    </Link>
  );
}
