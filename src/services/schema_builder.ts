import type { 
  PersonSchema, 
  CreativeWorkSchema, 
  PersonReference, 
  WorkExperience,
  Organization 
} from '../types/seo';
import { seoConfig, commonSkills, educationBackground, currentEmployer } from './seo_config';

export class SchemaBuilder {
  private static readonly SCHEMA_CONTEXT = 'https://schema.org';

  /**
   * Creates the base person schema with common information
   */
  static createBasePersonSchema(): Omit<PersonSchema, 'description' | 'url'> {
    return {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'Person',
      name: seoConfig.defaultAuthor,
      jobTitle: 'Tech Lead & Full Stack Developer',
      image: `${seoConfig.siteUrl}${seoConfig.defaultImage}`,
      sameAs: [
        seoConfig.linkedInProfile,
        seoConfig.githubProfile
      ],
      knowsAbout: commonSkills,
      alumniOf: educationBackground,
      worksFor: currentEmployer
    };
  }

  /**
   * Creates a complete person schema for home page
   */
  static createHomePersonSchema(additionalSkills: string[] = []): PersonSchema {
    const baseSchema = this.createBasePersonSchema();
    
    return {
      ...baseSchema,
      description: seoConfig.defaultDescription,
      url: seoConfig.siteUrl,
      knowsAbout: [...baseSchema.knowsAbout, ...additionalSkills],
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Tech Lead',
        occupationLocation: {
          '@type': 'Place',
          name: 'West Bend, WI'
        },
        skills: [...baseSchema.knowsAbout, ...additionalSkills]
      }
    };
  }

  /**
   * Creates a person schema with work history for about page
   */
  static createAboutPersonSchema(workHistory: WorkExperience[]): PersonSchema {
    const baseSchema = this.createBasePersonSchema();
    
    return {
      ...baseSchema,
      description: `${seoConfig.defaultAuthor} is an experienced Tech Lead and Full-Stack Developer with expertise in ${commonSkills.slice(0, 6).join(', ')}, and team leadership.`,
      url: `${seoConfig.siteUrl}/about`,
      workHistory,
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Tech Lead & Full Stack Developer',
        occupationLocation: {
          '@type': 'Place',
          name: 'West Bend, WI'
        },
        skills: [
          ...baseSchema.knowsAbout,
          'Database Design',
          'API Development'
        ]
      }
    };
  }

  /**
   * Creates a creative work schema for project pages
   */
  static createProjectSchema(config: {
    name: string;
    description: string;
    programmingLanguage?: string[];
    tools?: string[];
    keywords?: string[];
    dateCreated?: string;
    provider?: Organization;
  }): CreativeWorkSchema {
    const authorReference: PersonReference = {
      '@type': 'Person',
      name: seoConfig.defaultAuthor,
      jobTitle: 'Tech Lead & Full Stack Developer',
      url: seoConfig.siteUrl
    };

    return {
      '@context': this.SCHEMA_CONTEXT,
      '@type': 'CreativeWork',
      name: config.name,
      description: config.description,
      author: authorReference,
      programmingLanguage: config.programmingLanguage || [],
      tool: config.tools || [],
      keywords: config.keywords || [],
      genre: 'Software Development',
      dateCreated: config.dateCreated || new Date().getFullYear().toString(),
      provider: config.provider || currentEmployer
    };
  }

  /**
   * Creates a person reference for use in other schemas
   */
  static createPersonReference(): PersonReference {
    return {
      '@type': 'Person',
      name: seoConfig.defaultAuthor,
      jobTitle: 'Tech Lead & Full Stack Developer',
      url: seoConfig.siteUrl
    };
  }
} 