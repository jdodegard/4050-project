import './SeatMap.css';

// Renders whatever layout the showroom has. Selection state lives in
// BookingPage so it survives the trip through login/checkout.
export default function SeatMap({ seatRows, seatsPerRow, taken, selected, onToggle, totalTickets }) {
  const rows = Array.from({ length: seatRows }, (_, i) => String.fromCharCode(65 + i));
  const takenSet = new Set(taken);
  const pct = totalTickets > 0 ? Math.min(100, (selected.size / totalTickets) * 100) : 0;

  return (
    <div className="seat-map-container">
      <div className="screen-stage">
        <div className="screen-curve" />
        <span className="screen-text">SCREEN</span>
      </div>

      <div className="seat-floor">
        <div className="seat-grid">
          {rows.map(row => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="seats">
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatNum = i + 1;
                const seatId = `${row}${seatNum}`;
                const isTaken = takenSet.has(seatId);
                const isSelected = selected.has(seatId);
                return (
                  <button
                    key={seatId}
                    className={`seat ${isTaken ? 'seat-taken' : isSelected ? 'seat-selected' : 'seat-available'}`}
                    onClick={() => onToggle(seatId)}
                    disabled={isTaken}
                    title={isTaken ? 'Already booked' : isSelected ? `${seatId} (selected)` : seatId}
                    aria-label={`Seat ${seatId} ${isTaken ? 'already booked' : isSelected ? 'selected' : 'available'}`}
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
          <span>Booked</span>
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
