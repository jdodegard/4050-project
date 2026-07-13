/** The little ticket header + tear line that tops every auth card.
    Styles live in AuthPages.css with the rest of the ticket treatment. */
export default function TicketStub({ label }) {
  return (
    <>
      <div className="ticket-stub">
        <span className="ticket-brand">CinemaBook</span>
        <span className="ticket-admit">{label}</span>
        <span className="ticket-barcode" aria-hidden="true" />
      </div>
      <div className="ticket-perf" aria-hidden="true" />
    </>
  );
}
