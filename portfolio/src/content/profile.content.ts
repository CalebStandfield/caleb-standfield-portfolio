// Single source for who I am and what I've built. Plain data with no imports,
// so both the React app and the build-time agent files (llms.txt, sitemap,
// robots.txt) read from it.

export type ProjectStatus = "complete" | "in_progress";

export interface ProjectData {
  id: string;
  status: ProjectStatus;
  title: string;
  summary?: string;
  tags: string[];
  images: string[];
  /** Images shown together per carousel slide, e.g. 3 for phone shots. Default 1. */
  imagesPerSlide?: number;
  repositoryUrl?: string;
  demoUrl?: string;
}

export type ContactId = "email" | "github" | "linkedin";

export interface ContactLink {
  id: ContactId;
  label: string;
  value: string;
  href: string;
}

export const site = {
  name: "Caleb Standfield",
  url: "https://calebstandfield.dev",
  title: "Software Engineer Portfolio",
  tagline:
    "Software engineer graduating from the University of Utah in December 2026 (B.S. Computer Science, AI track). Software Engineer Intern at Adobe, summer 2026.",
  // Paragraphs, rendered in order.
  about: [
    "My recent work is mostly backend and LLM-integrated systems. At Adobe I owned the translation stage of a code migration pipeline that pairs static analysis with LLM translation, and on my capstone (Cadenza) I own the LLM song-tagging integration end to end.",
    "Projects took me further into backend and systems work: transactional ingestion and SQL analytics on PostgreSQL, concurrency and async I/O in a Rust HTTP server built from scratch, and object-oriented, state-machine design in C++ on a six-person agile team. I pick the language that fits the problem.",
  ],
  resumeUrl: "/Caleb_Standfield_Resume.pdf",
} as const;

export const contactLinks: ContactLink[] = [
  {
    id: "email",
    label: "Email",
    value: "calebjstandfield@gmail.com",
    href: "mailto:calebjstandfield@gmail.com",
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/CalebStandfield",
    href: "https://github.com/CalebStandfield",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/caleb-standfield",
    href: "https://www.linkedin.com/in/caleb-standfield/",
  },
];

export const projectSlots: ProjectData[] = [
  {
    id: "cadenza",
    status: "in_progress",
    title: "Cadenza",
    summary:
      "Apple Music companion app for song tagging, query-based playlists, and listening analytics. Capstone project. I own the LLM song-tagging integration end to end, and built a persistent listening-event queue with deduplicated ingestion so retries never double count. SQL-backed analytics drive calendar heatmaps, tag filters, and ranked listening history.",
    tags: [
      "Rust",
      "TypeScript",
      "React Native",
      "PostgreSQL",
      "LLM Integration",
      "System Architecture",
      "Caching",
    ],
    images: [
      "/cadenza/library_left.jpg",
      "/cadenza/account_middle.jpg",
      "/cadenza/search_right.jpg",
      "/cadenza/media_left.jpg",
      "/cadenza/media_middle.jpg",
      "/cadenza/media_right.jpg",
      "/cadenza/query_left.jpg",
      "/cadenza/query_middle.jpg",
      "/cadenza/query_right.jpg",
      "/cadenza/analytics_left.jpg",
      "/cadenza/analytics_middle.jpg",
      "/cadenza/analytics_right.jpg",
    ],
    imagesPerSlide: 3,
  },
  {
    id: "web-server",
    status: "in_progress",
    title: "Web Server",
    summary:
      "Multithreaded HTTP server built from scratch in Rust. Thread pooling and concurrency primitives handle requests, with async I/O and low-latency static file serving. Currently load testing on physical hardware to see how it holds up under concurrent load. Results coming soon.",
    tags: [
      "Rust",
      "Concurrency",
      "Thread Pooling",
      "Async I/O",
      "HTTP",
      "Performance",
    ],
    images: ["/web-server/load-test.png"],
    repositoryUrl: "https://github.com/CalebStandfield/custom-http",
  },
  {
    id: "blackjack",
    status: "complete",
    title: "blackjack",
    summary:
      "Complete blackjack game engine built from scratch in C++ and Qt, with AI-controlled opponents. Object-oriented design and a finite state machine manage game state transitions and event handling. Built on a six-person team following agile practices with daily scrum meetings.",
    tags: [
      "C++",
      "Qt",
      "Object-Oriented Design",
      "Finite State Machines",
      "Event-Driven Programming",
      "Game AI",
      "Scrum",
    ],
    images: [
      "/blackjack/blackjack_main.png",
      "/blackjack/blackjack_bet.png",
      "/blackjack/blackjack_playing.png",
      "/blackjack/blackjack_blackjack.png",
      "/blackjack/blackjack_won.png",
      "/blackjack/blackjack_lost.png",
    ],
    // Placeholders. Drop either field to hide that button.
    repositoryUrl:
      "https://github.com/CalebStandfield/full-blackjack-game-engine-with-UI",
  },
  {
    id: "learn-vim",
    status: "complete",
    title: "learn-vim",
    summary:
      "An interactive Vim trainer built around real edits, not quizzes. Transform text and/or code in as few keystrokes as you can, with instant feedback and par scores to beat. Used for an organization lunch and learn, as a Vim refresher and a talk on how to keep using Vim in the age of AI.",
    tags: [
      "JavaScript",
      "React",
      "Vim Emulation",
      "Interactive Learning",
      "Gamification",
      "UX Design",
    ],
    images: [
      "/learn-vim/learn-vim-home.png",
      "/learn-vim/learn-vim-level-select.png",
      "/learn-vim/learn-vim-arena.png",
      "/learn-vim/learn-vim-solved.png",
    ],
    // Placeholders. Drop either field to hide that button.
    demoUrl: "https://learn-vim-ruddy.vercel.app/",
  },
];

export interface ExperienceData {
  company: string;
  role: string;
  dates: string;
  highlights: string[];
}

const adobe: ExperienceData = {
  company: "Adobe",
  role: "Software Engineer Intern",
  dates: "May 2026 - Aug 2026",
  highlights: [
    "Built an AppMeasurement to Web SDK migration feature in Python and TypeScript, extending support beyond Adobe Tags to standalone JavaScript implementations.",
    "Used Tree-sitter, dependency graphs, and topological sorting to find analytics code and the context needed for safe conversion.",
    "Owned code translation: a source-agnostic pipeline that combines deterministic processing with LLM translation to generate native Web SDK code from parsed source and variable mappings.",
    "Built frontend and backend review workflows that surface conversion results and point users to the exact code needing manual fixes.",
  ],
};

export const experience: ExperienceData[] = [adobe];

export const resume = {
  education: {
    school: "University of Utah",
    location: "Salt Lake City, UT",
    degree: "Bachelor of Science in Computer Science",
    details: [
      "Artificial Intelligence Track",
      "Minor in Japanese",
      "Data Science Certificate",
    ],
    graduation: "Expected Dec 2026",
    gpa: "GPA: 3.788",
  },
  skills: [
    {
      label: "Relevant Coursework",
      values: [
        "Algorithms",
        "Data Structures",
        "Computer Systems",
        "Computer Organization",
        "Software Practice I & II",
        "Artificial Intelligence",
        "Machine Learning",
        "NLP",
        "Data Mining",
        "Linear Algebra",
        "Discrete Mathematics",
      ],
    },
    {
      label: "Languages",
      values: [
        "Rust",
        "C++",
        "C#",
        "Python",
        "Java",
        "TypeScript",
        "SQL",
        "HTML",
        "CSS",
      ],
    },
    {
      label: "Frameworks",
      values: [
        "Axum",
        "Tokio",
        "FastAPI",
        "React Native",
        "Next.js",
        "Flutter",
        "TailwindCSS",
        "PyTorch",
        "WebAssembly",
        "Blazor",
      ],
    },
    {
      label: "Tools",
      values: [
        "PostgreSQL",
        "MongoDB",
        "Docker",
        "Git",
        "Linux Command Line",
        "Tree-sitter",
        "LaTeX",
      ],
    },
    {
      label: "Engineering",
      values: [
        "Backend Development",
        "Full-Stack Development",
        "Concurrency",
        "API Design",
        "System Design",
        "ML Integration",
      ],
    },
  ],
  work: `${adobe.company}, ${adobe.role}, ${adobe.dates}`,
} as const;
