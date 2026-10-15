// Generates llms.txt, robots.txt, and sitemap.xml from site content, and puts a
// JSON-LD Person block plus an llms.txt link into index.html. Files are served
// by the dev server and emitted into dist/ on build.

import type { Plugin } from "vite";

import {
  renderLlmsTxt,
  renderPersonJsonLd,
  renderRobotsTxt,
  renderSitemap,
  type SiteProfile,
} from "./render";

export type { SiteProfile } from "./render";

interface AgentFile {
  render: (profile: SiteProfile) => string;
  contentType: string;
}

const files: Record<string, AgentFile> = {
  "llms.txt": { render: renderLlmsTxt, contentType: "text/plain; charset=utf-8" },
  "robots.txt": { render: renderRobotsTxt, contentType: "text/plain; charset=utf-8" },
  "sitemap.xml": { render: renderSitemap, contentType: "application/xml; charset=utf-8" },
};

export function agentFiles(profile: SiteProfile): Plugin {
  return {
    name: "agent-files",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = files[req.url?.split("?")[0].slice(1) ?? ""];
        if (!file) return next();
        res.setHeader("Content-Type", file.contentType);
        res.end(file.render(profile));
      });
    },

    generateBundle() {
      for (const [fileName, file] of Object.entries(files)) {
        this.emitFile({ type: "asset", fileName, source: file.render(profile) });
      }
    },

    transformIndexHtml() {
      return [
        {
          tag: "link",
          attrs: {
            rel: "alternate",
            type: "text/plain",
            href: "/llms.txt",
            title: "LLM-readable profile",
          },
          injectTo: "head",
        },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: renderPersonJsonLd(profile),
          injectTo: "head",
        },
      ];
    },
  };
}
