import { z, defineCollection } from "astro:content";

const projects = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.optional(z.number()),
      category: z.enum([
        "product",
        "software",
        "architecture",
        "research",
        "exhibition",
        "creative & web",
      ]),
      subtitle: z.string(),
      cover: image(),
      order: z.number(),
      heroMesh: z.optional(z.string()),
      projectMesh: z.string(),
    }),
});

export const collections = {
  projects,
};
