import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'oyh3ejkm',
    dataset: 'production',
  },
  deployment: {
    autoUpdates: true,
    appId: 'jhxtdalpdkcaegp6xsbkgxox',
  },
  typegen: {
    enabled: true,
    path: '../src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../src/sanity/types.ts',
    overloadClientMethods: true,
  },
})
