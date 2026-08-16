import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import TicketStubCard from '../components/TicketStubCard.jsx'
import { useBooking } from '../context/BookingContext.jsx'

export function Ticket() {
  const navigate = useNavigate()
  const { movie, cinema, showtime, seats, bookingId, reset } = useBooking()

  if (!movie || !cinema || !showtime || !bookingId) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">No ticket to show.</p>
      </div>
    )
  }

  const seatLabels = seats
    .slice()
    .sort((a, b) => (a.row === b.row ? a.number - b.number : a.row.localeCompare(b.row)))
    .map((s) => s.id)
    .join(', ')

  const handleDone = () => {
    reset()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-4 py-10">
      {/* Motion rule #3: one-time scale-and-fade reveal on arrival. */}
      <div className="w-full max-w-sm animate-ticket-reveal motion-reduce:animate-none">
        <TicketStubCard
          variant="booking"
          movie={movie}
          footer={
            <div className="flex flex-col gap-4 mt-1">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg flex-shrink-0">
                  <QRCodeSVG value={bookingId} size={84} bgColor="#FFFFFF" fgColor="#0B0D12" />
                </div>
                <div className="min-w-0 flex flex-col gap-1.5">
                  <p className="font-mono text-[11px] text-text-secondary uppercase tracking-wide">Booking ID</p>
                  <p className="font-mono text-sm text-text-primary tracking-wide">{bookingId}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-border-subtle pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Cinema</span>
                  <span className="font-mono text-text-primary text-right">{cinema.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Showtime</span>
                  <span className="font-mono text-text-primary">{showtime.time}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Seats</span>
                  <span className="font-mono text-text-primary text-right">{seatLabels}</span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3 mt-6">
        <button
          type="button"
          onClick={handleDone}
          className="w-full rounded-lg bg-accent-marquee text-bg-base font-medium py-3.5 min-h-[44px]
            hover:bg-accent-marquee/90 active:scale-[0.99] transition-colors
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
        >
          Done
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="w-full text-center text-sm text-text-secondary py-2
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee rounded-lg"
        >
          View my tickets
        </button>
      </div>
    </div>
  )
}

export default Ticket
