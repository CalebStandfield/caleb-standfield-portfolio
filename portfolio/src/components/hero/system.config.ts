// The hero architecture diagram: resume rendered as a Rust service graph.
// Single source of truth for cards and connectors. Positions are percentages
// (x = center, y = top) inside the diagram canvas. Card sizes are measured at
// runtime, so connectors follow the real boxes.

import {
  Globe,
  TreeStructure,
  ShieldCheck,
  ArrowsLeftRight,
  Database,
  DeviceMobile,
  CloudArrowDown,
  HardDrives,
  Sparkle,
  PaintBrush,
  Cards,
  Keyboard,
  type Icon,
} from "@phosphor-icons/react";

import type { Lang } from "./codeHighlight";

export type CardKind = "core" | "rust" | "external" | "project";
export type Side = "top" | "bottom" | "left" | "right";

export interface CardData {
  id: string;
  kind: CardKind;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: Icon;
  tags?: string[];
  // Code snippet body (service cards). Project cards omit this and show images.
  lang?: Lang;
  code?: string;
  // Carousel images (project cards). Absolute /public paths. Empty = "coming soon".
  images?: string[];
  // Renders the framed photo placeholder (the core profile card only).
  photo?: boolean;
  x: number; // center, 0-100
  y: number; // top, 0-100
}

export interface Edge {
  from: string;
  fromSide: Side;
  to: string;
  toSide: Side;
}

export const cards: CardData[] = [
  // --- backend cluster (left column, requests flow down then into profile) ---
  {
    id: "load_balancer",
    kind: "external",
    title: "Load Balancer",
    subtitle: "Edge routing",
    icon: TreeStructure,
    tags: ["NGINX", "EDGE"],
    lang: "nginx",
    x: 11,
    y: 1,
    code: `upstream api_pool {
    server 10.0.4.11:8080;
    server 10.0.4.12:8080;
    least_conn;
}`,
  },
  {
    id: "api_gateway",
    kind: "rust",
    title: "API Gateway",
    subtitle: "axum::Router",
    icon: ArrowsLeftRight,
    tags: ["RUST", "AXUM"],
    lang: "rust",
    x: 11,
    y: 11.2,
    code: `async fn get_profile(
  State(db): State<Pool>,
) -> Result<Json<Profile>> {
  let row = db.query_one(SQL).await?;
  Ok(Json(row.into()))
}`,
  },
  {
    id: "auth",
    kind: "external",
    title: "Auth Service",
    subtitle: "Identity / OAuth",
    icon: ShieldCheck,
    tags: ["TYPESCRIPT", "JWT"],
    lang: "ts",
    x: 11,
    y: 21.4,
    code: `export async function verifyToken(
  jwt: string
): Promise<Claims> {
  const claims = await jwks.verify(jwt);
  if (claims.exp < now()) throw err;
  return claims;
}`,
  },
  {
    id: "postgres",
    kind: "rust",
    title: "Postgres",
    subtitle: "Primary datastore",
    icon: Database,
    tags: ["POSTGRESQL", "SQL"],
    lang: "sql",
    x: 11,
    y: 31.6,
    code: `CREATE TABLE profile (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  graduated_on DATE
);`,
  },

  // --- core (center, the dominant card; holds the photo) ---
  {
    id: "profile",
    kind: "core",
    title: "profile.rs",
    badge: "CORE",
    photo: true,
    lang: "rust",
    x: 50,
    y: 4,
    code: `struct Profile {
    name: "Caleb Standfield",
    school: "University of Utah",
    degree: "B.S. Computer Science",
    graduated: "Dec 2026",
}`,
  },

  // --- frontend cluster (right column, clients served from profile) ---
  {
    id: "web_app",
    kind: "external",
    title: "Web App (SPA)",
    subtitle: "Vite / React",
    icon: Globe,
    tags: ["TYPESCRIPT", "REACT"],
    lang: "ts",
    x: 89,
    y: 1,
    code: `async function loadProfile() {
  const res = await fetch(
    "/api/v1/profile",
    { headers: { auth } }
  );
  return res.json();
}`,
  },
  {
    id: "mobile",
    kind: "external",
    title: "Mobile App",
    subtitle: "iOS / Android",
    icon: DeviceMobile,
    tags: ["REST"],
    lang: "ts",
    x: 89,
    y: 11.2,
    code: `const profile = await api
  .get("/v1/profile")
  .then((r) => r.data);

render(<ProfileScreen {...profile} />);`,
  },
  {
    id: "cdn",
    kind: "external",
    title: "CDN",
    subtitle: "CloudFront / Fastly",
    icon: CloudArrowDown,
    tags: ["EDGE"],
    lang: "nginx",
    x: 89,
    y: 21.4,
    code: `location /assets/ {
    proxy_pass http://origin;
    proxy_cache edge_cache;
    add_header Cache-Control public;
}`,
  },
  {
    id: "static_assets",
    kind: "external",
    title: "Static Assets",
    subtitle: "Object storage",
    icon: HardDrives,
    tags: ["S3"],
    lang: "nginx",
    x: 89,
    y: 31.6,
    code: `# s3://assets.example.com/*
location / {
    root /var/www/static;
    expires max;
}`,
  },

  // --- projects (lower band; carousel cards fed by the trunk from profile) ---
  {
    id: "coming-soon",
    kind: "project",
    title: "coming_soon",
    subtitle: "More on the way",
    icon: Sparkle,
    tags: ["WIP"],
    x: 22,
    y: 44,
    images: [],
  },
  {
    id: "pixelify",
    kind: "project",
    title: "pixelify",
    subtitle: "Sprite editor",
    icon: PaintBrush,
    tags: ["RUST", "WASM"],
    x: 78,
    y: 56.5,
    images: [
      "/sprite/sprite_draw.png",
      "/sprite/sprite_cs.png",
      "/sprite/sprite_stoplight.png",
      "/sprite/sprite_save.png",
    ],
  },
  {
    id: "blackjack",
    kind: "project",
    title: "blackjack",
    subtitle: "Terminal card game",
    icon: Cards,
    tags: ["C++"],
    x: 22,
    y: 69,
    images: [
      "/blackjack/blackjack_main.png",
      "/blackjack/blackjack_bet.png",
      "/blackjack/blackjack_playing.png",
      "/blackjack/blackjack_blackjack.png",
      "/blackjack/blackjack_won.png",
      "/blackjack/blackjack_lost.png",
    ],
  },
  {
    id: "learn-vim",
    kind: "project",
    title: "learn_vim",
    subtitle: "In progress",
    icon: Keyboard,
    tags: ["WIP"],
    x: 78,
    y: 81.5,
    images: [],
  },
];

// Project cards, in trunk order (2 left, 2 right of the center trunk).
export const projectIds = ["coming-soon", "pixelify", "blackjack", "learn-vim"];

export const edges: Edge[] = [
  // backend cluster: load balancer feeds the gateway, everything into profile
  { from: "load_balancer", fromSide: "bottom", to: "api_gateway", toSide: "top" },
  { from: "api_gateway", fromSide: "right", to: "profile", toSide: "left" },
  { from: "auth", fromSide: "right", to: "profile", toSide: "left" },
  { from: "postgres", fromSide: "right", to: "profile", toSide: "left" },
  // frontend cluster: profile serves the clients, which pull assets via the CDN
  { from: "profile", fromSide: "right", to: "web_app", toSide: "left" },
  { from: "profile", fromSide: "right", to: "mobile", toSide: "left" },
  { from: "web_app", fromSide: "bottom", to: "cdn", toSide: "top" },
  { from: "cdn", fromSide: "bottom", to: "static_assets", toSide: "top" },
];
