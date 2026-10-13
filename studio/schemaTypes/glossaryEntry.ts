import {BookIcon} from '@sanity/icons/Book'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A plain-English definition for one energy term, pointed at the icon that
 * depicts it. The SVG masters stay in git. This document is the language.
 */
export const glossaryEntry = defineType({
  name: 'glossaryEntry',
  title: 'Glossary entry',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'term',
      type: 'string',
      description: 'The name a reader would look up, such as “Curtailment” or “Power purchase agreement”.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'term', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon slug',
      type: 'string',
      description: 'The Energy Icons slug this term explains, matching a folder in /icons. Example: battery-storage.',
      validation: (rule) =>
        rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {name: 'kebab-case icon slug'}),
    }),
    defineField({
      name: 'aliases',
      title: 'Also called',
      type: 'array',
      description: 'Acronyms and other names, such as BESS or V2G.',
      of: [defineArrayMember({type: 'string', validation: (rule) => rule.required()})],
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      description: 'One or two sentences. This is the line on the glossary index.',
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'related',
      title: 'Related terms',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'glossaryEntry'}]})],
    }),
  ],
  preview: {
    select: {title: 'term', subtitle: 'icon'},
    prepare: ({title, subtitle}) => ({
      title,
      subtitle: subtitle ? `Icon · ${subtitle}` : 'No icon',
    }),
  },
})
