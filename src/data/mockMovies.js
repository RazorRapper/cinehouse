// Mock movie catalog. Poster/backdrop use picsum.photos seeded placeholders
// so every card gets a distinct, stable image without shipping binary assets.

export const nowShowing = [
  {
    id: 'mv-001',
    title: 'Midnight Marquee',
    genre: ['Thriller', 'Drama'],
    language: 'English',
    format: ['2D', 'IMAX'],
    rating: 'UA',
    duration: '142 MIN',
    poster: 'https://picsum.photos/seed/midnight-marquee/480/720',
    backdrop: 'https://picsum.photos/seed/midnight-marquee-bd/1200/675',
    synopsis:
      'A washed-up projectionist discovers the last reel of a film that was never meant to be finished — and the theater itself starts remembering things that never happened.',
    cast: [
      { name: 'Rosa Kade', avatar: 'https://i.pravatar.cc/120?img=47' },
      { name: 'Theo Marsh', avatar: 'https://i.pravatar.cc/120?img=12' },
      { name: 'Ines Volta', avatar: 'https://i.pravatar.cc/120?img=32' },
      { name: 'Sam Osei', avatar: 'https://i.pravatar.cc/120?img=15' },
    ],
  },
  {
    id: 'mv-002',
    title: 'Amber Horizon',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    format: ['3D', 'IMAX'],
    rating: 'U',
    duration: '128 MIN',
    poster: 'https://picsum.photos/seed/amber-horizon/480/720',
    backdrop: 'https://picsum.photos/seed/amber-horizon-bd/1200/675',
    synopsis:
      'The last generation ship crosses into a system that isn’t on any star chart — and the crew has to decide whether to trust a signal that sounds like home.',
    cast: [
      { name: 'Priya Nandan', avatar: 'https://i.pravatar.cc/120?img=5' },
      { name: 'Luca Ferro', avatar: 'https://i.pravatar.cc/120?img=51' },
      { name: 'Grace Odom', avatar: 'https://i.pravatar.cc/120?img=25' },
    ],
  },
  {
    id: 'mv-003',
    title: 'Paper Tigers',
    genre: ['Comedy'],
    language: 'Hindi',
    format: ['2D'],
    rating: 'U',
    duration: '118 MIN',
    poster: 'https://picsum.photos/seed/paper-tigers/480/720',
    backdrop: 'https://picsum.photos/seed/paper-tigers-bd/1200/675',
    synopsis:
      'Three childhood friends reunite for a wedding and accidentally reopen the family restaurant they burned down twenty years ago — on purpose, this time.',
    cast: [
      { name: 'Anaya Bhatt', avatar: 'https://i.pravatar.cc/120?img=9' },
      { name: 'Kabir Rana', avatar: 'https://i.pravatar.cc/120?img=13' },
      { name: 'Meher Suri', avatar: 'https://i.pravatar.cc/120?img=21' },
    ],
  },
  {
    id: 'mv-004',
    title: 'Iron Choir',
    genre: ['Action'],
    language: 'English',
    format: ['2D', 'IMAX'],
    rating: 'UA',
    duration: '135 MIN',
    poster: 'https://picsum.photos/seed/iron-choir/480/720',
    backdrop: 'https://picsum.photos/seed/iron-choir-bd/1200/675',
    synopsis:
      'A disbanded stunt crew is pulled back together for one impossible heist: steal back the film reel that got them all blacklisted.',
    cast: [
      { name: 'Dax Rimmer', avatar: 'https://i.pravatar.cc/120?img=33' },
      { name: 'Nadia Voss', avatar: 'https://i.pravatar.cc/120?img=44' },
    ],
  },
]

export const comingSoon = [
  {
    id: 'mv-005',
    title: 'Glass Orchard',
    genre: ['Drama'],
    language: 'English',
    format: ['2D'],
    rating: 'UA',
    duration: '121 MIN',
    poster: 'https://picsum.photos/seed/glass-orchard/480/720',
    backdrop: 'https://picsum.photos/seed/glass-orchard-bd/1200/675',
    releaseDate: 'SEP 12',
    synopsis:
      'A family orchard, a decade-long lawsuit, and one last harvest before the land is sold out from under them.',
    cast: [
      { name: 'Elin Marsh', avatar: 'https://i.pravatar.cc/120?img=27' },
      { name: 'Tobias Wren', avatar: 'https://i.pravatar.cc/120?img=8' },
    ],
  },
  {
    id: 'mv-006',
    title: 'Static Bloom',
    genre: ['Horror', 'Mystery'],
    language: 'English',
    format: ['2D', 'IMAX'],
    rating: 'A',
    duration: '109 MIN',
    poster: 'https://picsum.photos/seed/static-bloom/480/720',
    backdrop: 'https://picsum.photos/seed/static-bloom-bd/1200/675',
    releaseDate: 'SEP 26',
    synopsis:
      'Every flower in the town blooms the night before someone disappears. Nobody has asked why until now.',
    cast: [
      { name: 'Wren Castillo', avatar: 'https://i.pravatar.cc/120?img=36' },
      { name: 'Omar Delacroix', avatar: 'https://i.pravatar.cc/120?img=17' },
    ],
  },
  {
    id: 'mv-007',
    title: 'Sundown Ledger',
    genre: ['Crime', 'Thriller'],
    language: 'Hindi',
    format: ['2D'],
    rating: 'UA',
    duration: '132 MIN',
    poster: 'https://picsum.photos/seed/sundown-ledger/480/720',
    backdrop: 'https://picsum.photos/seed/sundown-ledger-bd/1200/675',
    releaseDate: 'OCT 03',
    synopsis:
      'A forensic accountant finds a decimal point that unravels the city’s most respected bank — and paints a target on her back.',
    cast: [
      { name: 'Divya Kunwar', avatar: 'https://i.pravatar.cc/120?img=29' },
      { name: 'Farhan Iqbal', avatar: 'https://i.pravatar.cc/120?img=52' },
    ],
  },
]

export const allMovies = [...nowShowing, ...comingSoon]

export const getMovieById = (id) => allMovies.find((m) => m.id === id)

export const filterOptions = {
  language: ['English', 'Hindi'],
  genre: ['Thriller', 'Drama', 'Sci-Fi', 'Adventure', 'Comedy', 'Action', 'Horror', 'Mystery', 'Crime'],
  format: ['2D', '3D', 'IMAX'],
}
