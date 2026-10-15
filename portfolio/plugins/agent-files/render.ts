// Pure renderers for the machine-readable files. Each takes content in and
// returns a string, so they can be reused or tested without Vite.

import type {
  ContactLink,
  ProjectData,
} from "../../src/content/profile.content";

export interface SiteProfile {
  site: {
    name: string;
    url: string;
    title: string;
    tagline: string;
    about: readonly string[];
    resumeUrl: string;
  };
  projects: readonly ProjectData[];
  resume: {
    education: {
      school: string;
      location: string;
      degree: string;
      details: readonly string[];
      graduation: string;
      gpa: string;
    };
    skills: readonly { label: string; values: readonly string[] }[];
    work: string;
  };
  contactLinks: readonly ContactLink[];
  /** Site-relative paths for every page, e.g. "/", "/projects". */
  pages: readonly string[];
}

const statusLabel: Record<ProjectData["status"], string> = {
  complete: "complete",
  in_progress: "in progress",
};

function absolute(base: string, path: string): string {
  return new URL(path, base).href;
}

function renderProject(project: ProjectData): string {
  const lines = [`### ${project.title} (${statusLabel[project.status]})`, ""];
  if (project.summary) lines.push(project.summary, "");
  lines.push(`Tech: ${project.tags.join(", ")}`);
  if (project.repositoryUrl) lines.push(`Source: ${project.repositoryUrl}`);
  if (project.demoUrl) lines.push(`Demo: ${project.demoUrl}`);
  return lines.join("\n");
}

// Follows the llms.txt convention (https://llmstxt.org): H1 name, blockquote
// summary, then H2 sections. The site is small, so everything is inline.
export function renderLlmsTxt(profile: SiteProfile): string {
  const { site, projects, resume, contactLinks } = profile;
  const { education } = resume;

  return [
    `# ${site.name}`,
    "",
    `> ${site.tagline}`,
    "",
    site.about.join("\n\n"),
    "",
    "## Experience",
    "",
    `- ${resume.work}`,
    "",
    "## Education",
    "",
    `- ${education.degree}, ${education.school} (${education.location})`,
    `- ${education.graduation}, ${education.gpa}`,
    ...education.details.map((detail) => `- ${detail}`),
    "",
    "## Skills",
    "",
    ...resume.skills.map(
      (group) => `- ${group.label}: ${group.values.join(", ")}`,
    ),
    "",
    "## Projects",
    "",
    projects.map(renderProject).join("\n\n"),
    "",
    "## Contact",
    "",
    ...contactLinks.map(
      (link) => `- ${link.label}: ${link.href.replace(/^mailto:/, "")}`,
    ),
    "",
    "## Links",
    "",
    `- [Website](${absolute(site.url, "/")})`,
    `- [Resume (PDF)](${absolute(site.url, site.resumeUrl)})`,
    "",
  ].join("\n");
}

export function renderRobotsTxt(profile: SiteProfile): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${absolute(profile.site.url, "/sitemap.xml")}`,
    "",
  ].join("\n");
}

export function renderSitemap(profile: SiteProfile): string {
  const urls = profile.pages
    .map((path) => `  <url><loc>${absolute(profile.site.url, path)}</loc></url>`)
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

// schema.org Person, embedded in index.html so crawlers that skip JS still get
// the basics.
export function renderPersonJsonLd(profile: SiteProfile): string {
  const { site, resume, contactLinks } = profile;
  const email = contactLinks.find((link) => link.href.startsWith("mailto:"));
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: absolute(site.url, "/"),
    description: site.tagline,
    email: email?.href,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: resume.education.school,
    },
    knowsAbout: resume.skills.flatMap((group) => group.values),
    sameAs: contactLinks
      .filter((link) => link.href.startsWith("http"))
      .map((link) => link.href),
  };
  // Escape "<" so content can never close the script tag early.
  return JSON.stringify(person, null, 2).replace(/</g, "\\u003c");
}
