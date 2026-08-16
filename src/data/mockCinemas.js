// Mock cinemas + showtimes, keyed loosely by movie for the demo flow.

export const mockCity = 'Bengaluru'

export const cinemas = [
  {
    id: 'cn-001',
    name: 'PVR Marquee — Orion Mall',
    distance: '2.3 km',
    address: 'Rajajinagar, Bengaluru',
    showtimes: [
      { id: 'st-1', time: '10:30 AM', format: '2D', price: 220 },
      { id: 'st-2', time: '1:45 PM', format: 'IMAX', price: 380 },
      { id: 'st-3', time: '6:15 PM', format: '2D', price: 240 },
      { id: 'st-4', time: '9:40 PM', format: 'IMAX', price: 400 },
    ],
  },
  {
    id: 'cn-002',
    name: 'INOX Grand — Garuda Mall',
    distance: '4.1 km',
    address: 'Magrath Road, Bengaluru',
    showtimes: [
      { id: 'st-5', time: '11:00 AM', format: '2D', price: 200 },
      { id: 'st-6', time: '3:20 PM', format: '3D', price: 320 },
      { id: 'st-7', time: '7:00 PM', format: '2D', price: 230 },
    ],
  },
  {
    id: 'cn-003',
    name: 'Cinepolis — Nexus Koramangala',
    distance: '6.8 km',
    address: 'Koramangala, Bengaluru',
    showtimes: [
      { id: 'st-8', time: '12:15 PM', format: '2D', price: 210 },
      { id: 'st-9', time: '4:50 PM', format: '2D', price: 220 },
      { id: 'st-10', time: '8:30 PM', format: 'IMAX', price: 390 },
      { id: 'st-11', time: '11:15 PM', format: '2D', price: 190 },
    ],
  },
]

export const getCinemasNearby = () => cinemas
