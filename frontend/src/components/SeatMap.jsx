import { useState, useEffect } from 'react';
import './SeatMap.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 12;

// Hardcoded unavailable seats for realistic appearance
const UNAVAILABLE = new Set([
  'A3', 'A4', 'B7', 'B8', 'C1', 'C2', 'C5',
  'D9', 'D10', 'E3', 'E6', 'E7', 'F11', 'F12',
  'G2', 'G5', 'G6', 'H4', 'H8', 'H9',
]);

export default function SeatMap({ totalTickets, onSelectionChange }) {
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (selected.size > totalTickets) {
      const arr = Array.from(selected).slice(0, totalTickets);
      const next = new Set(arr);
      setSelected(next);
      onSelectionChange?.(next);
    }
  }, [totalTickets]);

  function toggleSeat(seatId) {
    if (UNAVAILABLE.has(seatId)) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= totalTickets && totalTickets > 0) return prev;
        next.add(seatId);
      }
      onSelectionChange?.(next);
      return next;
    });
  }

  const pct = totalTickets > 0 ? Math.min(100, (selected.size / totalTickets) * 100) : 0;

  return (
    <div className="seat-map-container">
      <div className="screen-stage">
        <div className="screen-curve" />
        <span className="screen-text">SCREEN</span>
      </div>

      <div className="seat-floor">
        <div className="seat-grid">
          {ROWS.map(row => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="seats">
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                const seatNum = i + 1;
                const seatId = `${row}${seatNum}`;
                const isUnavailable = UNAVAILABLE.has(seatId);
                const isSelected = selected.has(seatId);
                return (
                  <button
                    key={seatId}
                    className={`seat ${isUnavailable ? 'seat-taken' : isSelected ? 'seat-selected' : 'seat-available'}`}
                    onClick={() => toggleSeat(seatId)}
                    disabled={isUnavailable}
                    title={isUnavailable ? 'Unavailable' : isSelected ? `${seatId} (selected)` : seatId}
                    aria-label={`Seat ${seatId} ${isUnavailable ? 'unavailable' : isSelected ? 'selected' : 'available'}`}
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
            <span className="row-label">{row}</span>
          </div>
        ))}
        </div>
      </div>

      {totalTickets > 0 && (
        <div className="seat-progress">
          <div className="seat-progress-track">
            <div className="seat-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span>{selected.size} / {totalTickets} seats</span>
        </div>
      )}

      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-swatch swatch-available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch swatch-selected" />
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch swatch-taken" />
          <span>Unavailable</span>
        </div>
      </div>

      {selected.size > 0 && (
        <p className="selected-info">
          Selected: {Array.from(selected).sort().join(', ')}
        </p>
      )}
    </div>
  );
}
