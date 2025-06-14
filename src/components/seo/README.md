# SEO Implementation - DRY & SOLID Principles

This SEO implementation follows DRY (Don't Repeat Yourself) and SOLID principles to create maintainable, extensible, and reusable SEO components.

## Architecture Overview

### SOLID Principles Applied

1. **Single Responsibility Principle (SRP)**
   - `MetaTags.astro`: Handles only meta tag generation
   - `StructuredData.astro`: Handles only JSON-LD schema output
   - `PerformanceHints.astro`: Handles only performance-related hints
   - `SeoService`: Handles SEO data processing and validation
   - `SchemaBuilder`: Handles schema generation

2. **Open/Closed Principle (OCP)**
   - Schema builders can be extended for new schema types without modifying existing code
   - New SEO components can be added without changing existing ones

3. **Dependency Inversion Principle (DIP)**
   - Components depend on interfaces/types rather than concrete implementations
   - Service layer abstracts business logic from presentation

### DRY Principles Applied

- **Centralized Configuration**: All SEO defaults in `seo_config.ts`
- **Reusable Schema Generation**: `SchemaBuilder` eliminates duplicate schema creation
- **Service Layer**: `SeoService` provides common SEO operations
- **Type Safety**: Shared types prevent inconsistencies

## File Structure

```
src/
├── types/
│   └── seo.ts                  # Type definitions
├── services/
│   ├── seo_config.ts          # Centralized configuration
│   ├── seo_service.ts         # SEO business logic
│   └── schema_builder.ts      # Schema generation service
└── components/
    ├── seo.astro              # Main SEO orchestrator
    └── seo/
        ├── meta_tags.astro    # Meta tag generation
        ├── structured_data.astro # JSON-LD schema output
        └── performance_hints.astro # Performance hints
```

## Usage Examples

### Basic Page SEO
```astro
---
import { SchemaBuilder } from '../services/schema_builder';

const schema = SchemaBuilder.createHomePersonSchema([
  'Additional Skill 1',
  'Additional Skill 2'
]);
---

<MainLayout
  title="Custom Page Title"
  description="Custom description"
  schema={schema}
>
  <!-- Page content -->
</MainLayout>
```

### Project Page SEO
```astro
---
import { SchemaBuilder } from '../services/schema_builder';

const projectSchema = SchemaBuilder.createProjectSchema({
  name: 'Project Name',
  description: 'Project description',
  programmingLanguage: ['TypeScript', 'React'],
  tools: ['Next.js', 'Tailwind CSS'],
  keywords: ['web development', 'react'],
  dateCreated: '2024'
});
---

<ProjectLayout
  title="Project Title"
  description="Project description"
  schema={projectSchema}
>
  <!-- Project content -->
</ProjectLayout>
```

### About Page SEO
```astro
---
import { SchemaBuilder } from '../services/schema_builder';
import type { WorkExperience } from '../types/seo';

const workHistory: WorkExperience[] = [
  {
    '@type': 'Organization',
    name: 'Company Name',
    jobTitle: 'Position',
    startDate: '2020-01',
    endDate: '2024-01',
    location: 'City, State',
    description: 'Job description'
  }
];

const aboutSchema = SchemaBuilder.createAboutPersonSchema(workHistory);
---

<AboutLayout schema={aboutSchema}>
  <!-- About content -->
</AboutLayout>
```

## Benefits

### Maintainability
- Single source of truth for SEO configuration
- Clear separation of concerns
- Type safety prevents runtime errors

### Extensibility
- Easy to add new schema types
- New SEO components can be added modularly
- Service layer can be extended with new functionality

### Reusability
- Schema builders eliminate code duplication
- Common SEO patterns are abstracted
- Configuration is centralized and reusable

### Performance
- Modular components reduce bundle size
- Performance hints are centralized
- Validation only runs in development

## Extending the System

### Adding New Schema Types
1. Define new interfaces in `types/seo.ts`
2. Add builder methods to `SchemaBuilder`
3. Update layout Props interfaces as needed

### Adding New SEO Features
1. Create focused component in `components/seo/`
2. Import and use in main `seo.astro`
3. Add configuration to `seo_config.ts` if needed

### Customizing for Different Sites
1. Update `seo_config.ts` with site-specific values
2. Modify schema builders for different person/organization data
3. Extend types as needed for site-specific schemas

## Validation

The system includes built-in SEO validation that only runs in development:
- Title length validation (10-60 characters)
- Description length validation (50-160 characters)
- Required field validation
- Schema structure validation

## TypeScript Support

Full TypeScript support with:
- Strict type definitions for all SEO metadata
- IntelliSense for schema properties
- Compile-time validation of schema structures
- Union types for flexible schema acceptance 