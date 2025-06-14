import { defineConfig, passthroughImageService } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    integrations: [
        svelte(),
        sitemap({
            customPages: [
                'https://stephenferguson.info/projects/next-js',
                'https://stephenferguson.info/projects/php-laravel',
                'https://stephenferguson.info/projects/wordpress',
                'https://stephenferguson.info/projects/dev-ops',
                'https://stephenferguson.info/projects/testing',
                'https://stephenferguson.info/projects/packages',
                'https://stephenferguson.info/projects/people-management',
                'https://stephenferguson.info/projects/other-stuff'
            ],
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date()
        }),
    ],
    site: "https://stephenferguson.info",
    scopedStyleStrategy: "where",
    image: {
        service: passthroughImageService()
    },
});
