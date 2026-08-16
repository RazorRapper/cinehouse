import { Routes, Route, Navigate } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext.jsx'
import Login from './screens/Login.jsx'
import Home from './screens/Home.jsx'
import MovieDetail from './screens/MovieDetail.jsx'
import SelectCinema from './screens/SelectCinema.jsx'
import SeatSelection from './screens/SeatSelection.jsx'
import Confirm from './screens/Confirm.jsx'
import Ticket from './screens/Ticket.jsx'

function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/cinemas" element={<SelectCinema />} />
        <Route path="/seats" element={<SeatSelection />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BookingProvider>
  )
}

export default App
