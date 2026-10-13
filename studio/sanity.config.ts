import {defineConfig} from 'sanity'
import {defineLocations, presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'

const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  (process.env.NODE_ENV === 'production' ? 'https://energyicons.com' : 'http://localhost:3000')

export default defineConfig({
  name: 'default',
  title: 'Energy Icons',

  projectId: 'oyh3ejkm',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Energy Icons')
          .items([S.documentTypeListItem('glossaryEntry').title('Glossary')]),
    }),
    presentationTool({
      previewUrl: {
        initial: `${previewOrigin}/glossary`,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
      allowOrigins: ['http://localhost:3000', 'https://energyicons.com'],
      resolve: {
        locations: {
          glossaryEntry: defineLocations({
            select: {title: 'term', slug: 'slug.current'},
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: doc?.slug ? `/glossary/${doc.slug}` : '/glossary',
                },
              ],
            }),
          }),
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
