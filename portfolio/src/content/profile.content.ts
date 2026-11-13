// Single source for who I am and what I've built. Plain data with no imports,
// so both the React app and the build-time agent files (llms.txt, sitemap,
// robots.txt) read from it.

export type ProjectStatus = "complete" | "in_progress";

// One carousel slide. `images` shows its srcs side by side (phone shots).
// Videos and posters live in public/ like images; run `npm run images` after
// adding a poster so it gets WebP variants.
export type ProjectMedia =
  | { type: "image"; src: string }
  | { type: "images"; srcs: string[] }
  | { type: "video"; src: string; poster?: string };

export interface ProjectData {
  id: string;
  status: ProjectStatus;
  title: string;
  /** Short blurb. Leads the card and llms.txt. */
  summary?: string;
  /** Longer paragraphs shown under the summary on the card. */
  details?: string[];
  tags: string[];
  /** One entry per slide, in order. */
  media: ProjectMedia[];
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
    "New grad software engineer (Dec 2026), full stack + ML. Software Engineer Intern at Adobe in summer 2026, built an LLM code migration pipeline. University of Utah: B.S. Computer Science (AI track), Japanese minor, Data Science Certificate.",
  // Paragraphs, rendered in order.
  about: [
    "I'm a full-stack engineer with a backend and systems lean, and I've owned LLM features at Adobe and on my capstone. At Adobe I built an end-to-end LLM code migration pipeline that moves AppMeasurement analytics code to the Web SDK, from ingest through deterministic and LLM translation to writeback. On Cadenza, my capstone Apple Music companion app, I own LLM song tagging from the backend service to the mobile UI. On the systems side, I built Cadenza's transactional event ingestion with dedup so retries don't double count, and I'm writing a multithreaded HTTP server from scratch in Rust.",
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
    media: [
      {
        type: "images",
        srcs: [
          "/cadenza/library_left.jpg",
          "/cadenza/account_middle.jpg",
          "/cadenza/search_right.jpg",
        ],
      },
      {
        type: "images",
        srcs: [
          "/cadenza/media_left.jpg",
          "/cadenza/media_middle.jpg",
          "/cadenza/media_right.jpg",
        ],
      },
      {
        type: "images",
        srcs: [
          "/cadenza/query_left.jpg",
          "/cadenza/query_middle.jpg",
          "/cadenza/query_right.jpg",
        ],
      },
      {
        type: "images",
        srcs: [
          "/cadenza/analytics_left.jpg",
          "/cadenza/analytics_middle.jpg",
          "/cadenza/analytics_right.jpg",
        ],
      },
    ],
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
    media: [{ type: "image", src: "/web-server/load-test.png" }],
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
    media: [
      { type: "image", src: "/blackjack/blackjack_main.png" },
      { type: "image", src: "/blackjack/blackjack_bet.png" },
      { type: "image", src: "/blackjack/blackjack_playing.png" },
      { type: "image", src: "/blackjack/blackjack_blackjack.png" },
      { type: "image", src: "/blackjack/blackjack_won.png" },
      { type: "image", src: "/blackjack/blackjack_lost.png" },
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
    media: [
      { type: "image", src: "/learn-vim/learn-vim-home.png" },
      { type: "image", src: "/learn-vim/learn-vim-level-select.png" },
      { type: "image", src: "/learn-vim/learn-vim-arena.png" },
      { type: "image", src: "/learn-vim/learn-vim-solved.png" },
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
    "Built an end-to-end LLM code migration pipeline in Python and TypeScript that converts AppMeasurement analytics code to the Web SDK, extending support beyond Adobe Tags to standalone JavaScript implementations.",
    "Made the pipeline source-agnostic, so JavaScript files, code snippets, and Adobe Tags custom code share the same ingest, translation, and writeback stages, with output as snippets, files, or zip archives.",
    "Used Tree-sitter, dependency graphs, and topological sorting to find analytics code and its context, then combined deterministic processing with LLM translation to generate native Web SDK code.",
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
