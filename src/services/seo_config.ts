import type { SeoConfig } from '../types/seo';

export const seoConfig: SeoConfig = {
  siteName: 'Steve Ferguson - Full Stack Developer',
  siteUrl: 'https://stephenferguson.info',
  defaultTitle: 'Steve Ferguson - Full Stack Developer & Tech Lead | Next.js, React, TypeScript Expert',
  defaultDescription: 'Experienced Tech Lead and Full-Stack Developer specializing in Next.js, React, TypeScript, PHP, Laravel, and WordPress. Expert in DevOps, CI/CD, team leadership, and scalable web applications.',
  defaultKeywords: 'steve ferguson, full stack developer, tech lead, next.js, react, typescript, php, laravel, wordpress, devops, ci/cd, team leadership, software engineer, web development, cloudflare workers, ecommerce, headless cms',
  defaultImage: '/assets/steve-ferguson-portrait.jpg',
  defaultImageAlt: 'Steve Ferguson - Full Stack Developer and Tech Lead',
  defaultAuthor: 'Steve Ferguson',
  twitterHandle: '@stephenferguson',
  linkedInProfile: 'https://www.linkedin.com/in/stephen-ferguson-964a7b57',
  githubProfile: 'https://github.com/sferg989',
};

export const commonSkills = [
  'Next.js',
  'React',
  'TypeScript',
  'PHP',
  'Laravel',
  'WordPress',
  'DevOps',
  'CI/CD',
  'Team Leadership',
  'Software Engineering',
  'Web Development',
  'Cloudflare Workers',
  'E-commerce Development',
  'Headless CMS'
];

export const educationBackground = [
  {
    '@type': 'EducationalOrganization' as const,
    name: "Master's in Music Performance"
  },
  {
    '@type': 'EducationalOrganization' as const,
    name: 'MBA in Finance'
  }
];

export const currentEmployer = {
  '@type': 'Organization' as const,
  name: 'Delta Defense'
}; 