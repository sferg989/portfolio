export interface PersonSchema {
  '@context': string;
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  sameAs: string[];
  knowsAbout: string[];
  alumniOf: EducationalOrganization[];
  worksFor?: Organization;
  hasOccupation?: Occupation;
  workHistory?: WorkExperience[];
}

export interface CreativeWorkSchema {
  '@context': string;
  '@type': 'CreativeWork';
  name: string;
  description: string;
  author: PersonReference;
  programmingLanguage?: string[];
  tool?: string[];
  keywords?: string[];
  genre?: string;
  dateCreated?: string;
  provider?: Organization;
}

export interface EducationalOrganization {
  '@type': 'EducationalOrganization';
  name: string;
}

export interface Organization {
  '@type': 'Organization';
  name: string;
  description?: string;
}

export interface Occupation {
  '@type': 'Occupation';
  name: string;
  occupationLocation: Place;
  skills: string[];
}

export interface Place {
  '@type': 'Place';
  name: string;
}

export interface WorkExperience {
  '@type': 'Organization';
  name: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface PersonReference {
  '@type': 'Person';
  name: string;
  jobTitle: string;
  url: string;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: PersonSchema | CreativeWorkSchema | Record<string, unknown>;
}

export interface SeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultImage: string;
  defaultImageAlt: string;
  defaultAuthor: string;
  twitterHandle: string;
  linkedInProfile: string;
  githubProfile: string;
} 