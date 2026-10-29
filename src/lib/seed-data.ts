import { Book } from "@/types";

export const INITIAL_BOOKS: Book[] = [
  // --- STORY CATEGORY (5) ---
  {
    id: "story-great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A lyrical Jazz Age masterpiece exploring high-society wealth, obsession, disillusionment, and the fleeting promise of the American Dream in 1920s Long Island.",
    category: "Story",
    available_quantity: 5,
    image_url:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    featured: true,
    pages: 180,
    published_year: 1925,
    isbn: "978-0743273565",
  },
  {
    id: "story-mockingbird",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description:
      "The unforgettable Pulitzer Prize-winning Southern drama of racial prejudice, compassion, and unshakeable moral integrity seen through the eyes of young Scout Finch.",
    category: "Story",
    available_quantity: 4,
    image_url:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 336,
    published_year: 1960,
    isbn: "978-0061120084",
  },
  {
    id: "story-1984",
    title: "1984",
    author: "George Orwell",
    description:
      "The haunting dystopian classic that introduced Oceania, Big Brother, and Thoughtcrime, depicting Winston Smith's perilous quest for truth and humanity.",
    category: "Story",
    available_quantity: 3,
    image_url:
      "https://images.unsplash.com/photo-1532012164546-f432f2e37273?auto=format&fit=crop&q=80&w=800",
    featured: true,
    pages: 328,
    published_year: 1949,
    isbn: "978-0451524935",
  },
  {
    id: "story-solitude",
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    description:
      "A luminous landmark of magical realism tracing seven generations of the Buendía dynasty amidst love, war, alchemy, and miracles in mythical Macondo.",
    category: "Story",
    available_quantity: 6,
    image_url:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 417,
    published_year: 1967,
    isbn: "978-0060883287",
  },
  {
    id: "story-midnight-library",
    title: "The Midnight Library",
    author: "Matt Haig",
    description:
      "A heartwarming and profound tale exploring regrets, parallel possibilities, and what truly makes an ordinary life beautiful beyond measure.",
    category: "Story",
    available_quantity: 2,
    image_url:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 304,
    published_year: 2020,
    isbn: "978-0525559474",
  },

  // --- TECH CATEGORY (5) ---
  {
    id: "tech-designing-data-intensive",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    description:
      "The definitive guide to distributed architectures, consistency models, replication strategies, stream processing, and resilient data storage engines.",
    category: "Tech",
    available_quantity: 4,
    image_url:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    featured: true,
    pages: 616,
    published_year: 2017,
    isbn: "978-1449373320",
  },
  {
    id: "tech-clean-code",
    title: "Clean Code",
    author: "Robert C. Martin",
    description:
      "An essential software craftsmanship handbook detailing meaningful naming, robust error handling, unit testing, and refactoring techniques.",
    category: "Tech",
    available_quantity: 5,
    image_url:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 464,
    published_year: 2008,
    isbn: "978-0132350884",
  },
  {
    id: "tech-pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    description:
      "Timeless engineering philosophy that spans career longevity, modular design, defensive programming, and avoiding the broken window syndrome.",
    category: "Tech",
    available_quantity: 3,
    image_url:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 352,
    published_year: 2019,
    isbn: "978-0135957059",
  },
  {
    id: "tech-system-design-interview",
    title: "System Design Interview",
    author: "Alex Xu",
    description:
      "An insider's visual blueprint covering high-availability distributed systems, caching tiers, rate limiting, key-value stores, and distributed messaging.",
    category: "Tech",
    available_quantity: 2,
    image_url:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 322,
    published_year: 2020,
    isbn: "979-8664653403",
  },
  {
    id: "tech-ai-modern-approach",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell & Peter Norvig",
    description:
      "The world standard textbook for machine learning foundations, search heuristics, probabilistic reasoning, reinforcement learning, and neural nets.",
    category: "Tech",
    available_quantity: 1,
    image_url:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 1152,
    published_year: 2020,
    isbn: "978-0134610993",
  },

  // --- SCIENCE CATEGORY (5) ---
  {
    id: "sci-brief-history-time",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description:
      "Stephen Hawking's internationally celebrated exploration of spacetime singularities, the Big Bang, quantum gravity, and the arrows of time.",
    category: "Science",
    available_quantity: 4,
    image_url:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    featured: true,
    pages: 256,
    published_year: 1988,
    isbn: "978-0553380163",
  },
  {
    id: "sci-cosmos",
    title: "Cosmos",
    author: "Carl Sagan",
    description:
      "A lyrical, transcendent cosmic voyage tracing the origins of consciousness, interplanetary exploration, and the wonder of scientific discovery.",
    category: "Science",
    available_quantity: 5,
    image_url:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 384,
    published_year: 1980,
    isbn: "978-0345539434",
  },
  {
    id: "sci-the-gene",
    title: "The Gene: An Intimate History",
    author: "Siddhartha Mukherjee",
    description:
      "A magisterial history of human genetics intertwining poignant family biography, scientific triumphs, and ethical dilemmas of CRISPR gene editing.",
    category: "Science",
    available_quantity: 3,
    image_url:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 608,
    published_year: 2016,
    isbn: "978-1476733524",
  },
  {
    id: "sci-sapiens",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description:
      "How an insignificant African ape became master of planet Earth through the cognitive revolution, agriculture, currency, and scientific mastery.",
    category: "Science",
    available_quantity: 6,
    image_url:
      "https://images.unsplash.com/photo-1507842229451-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 464,
    published_year: 2014,
    isbn: "978-0062316097",
  },
  {
    id: "sci-silent-spring",
    title: "Silent Spring",
    author: "Rachel Carson",
    description:
      "The courageous ecological exposé that mobilized global environmentalism by unmasking the catastrophic fallout of unregulated synthetic chemicals.",
    category: "Science",
    available_quantity: 2,
    image_url:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800",
    featured: false,
    pages: 400,
    published_year: 1962,
    isbn: "978-0618249060",
  },
];
