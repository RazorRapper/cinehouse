// Movie data itself now comes from the backend's TMDB proxy (see
// src/api/moviesApi.js). Only the static filter-chip label lists remain
// here — they're UI configuration, not movie data.

export const filterOptions = {
  language: ['English', 'Hindi'],
  genre: ['Thriller', 'Drama', 'Sci-Fi', 'Adventure', 'Comedy', 'Action', 'Horror', 'Mystery', 'Crime'],
  format: ['2D', '3D', 'IMAX'],
}
