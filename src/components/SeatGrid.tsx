import type { Seat } from '@/lib/api';

interface SeatGridProps {
  seats: Seat[];
  selectedSeatId: number | null;
  onSelectSeat: (seat: Seat) => void;
}

export function SeatGrid({ seats, selectedSeatId, onSelectSeat }: SeatGridProps) {
  const getSeatClass = (seat: Seat) => {
    if (seat.id === selectedSeatId) return 'seat-selected';
    switch (seat.status) {
      case 'available': return 'seat-available';
      case 'reserved': return 'seat-reserved';
      case 'purchased': return 'seat-purchased';
      default: return 'seat-available';
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen indicator */}
      <div className="mx-auto w-3/4 h-2 rounded-b-full bg-primary/20 mb-8" />
      <p className="text-center text-xs text-muted-foreground -mt-4 mb-6">TELA</p>

      {/* Seats */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {seats.map((seat) => (
          <button
            key={seat.id}
            className={getSeatClass(seat)}
            onClick={() => seat.status === 'available' && onSelectSeat(seat)}
            disabled={seat.status !== 'available' && seat.id !== selectedSeatId}
            title={`Assento ${seat.seat_number} - ${seat.status === 'available' ? 'Disponível' : seat.status === 'reserved' ? 'Reservado' : 'Comprado'}`}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-6">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border-2" style={{ borderColor: 'hsl(160 84% 39%)' }} />
          Disponível
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(217 91% 60%)' }} />
          Selecionado
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded opacity-70" style={{ background: 'hsl(38 92% 50%)' }} />
          Reservado
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded opacity-50" style={{ background: 'hsl(215 16% 47%)' }} />
          Comprado
        </div>
      </div>
    </div>
  );
}
