import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One folder per project in src/content/projects: an index.md plus its images.
// Folder names set the order of the line (01-…, 02-…).
const projects = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      note: z.string(),
      year: z.number(),
      role: z.array(z.string()).optional(), // what you did, one tag per line, shown with the description
      description: z.string().optional(),
      link: z.string().url().optional(), // the live project, linked under the description
      cover: image(), // the thumbnail in the line (the poster frame, if there's a cover video)
      coverLive: z.enum(["globe"]).optional(), // a thumbnail the script draws live (transparent), instead of the cover image
      // unfolded after the cover when the project opens: an image, a video with its poster frame,
      // or a live piece the script runs (the spider)
      images: z.array(z.union([image(), z.object({ video: z.string(), poster: image() }), z.object({ live: z.enum(["spider"]) })])).default([]),
      placeholders: z.number().default(0), // grey slots after the images, until the real ones exist
    }),
});

export const collections = { projects };
