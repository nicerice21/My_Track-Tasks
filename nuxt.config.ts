// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  tailwindcss: {
    configPath: '~/tailwind.config.ts',
  },

  nitro: {
    preset: 'cloudflare_module',
    experimental: {
      wasm: true,
    },
  },

  runtimeConfig: {
    allowedEmail: process.env.ALLOWED_EMAIL || '',
    accessAudience: process.env.ACCESS_AUDIENCE || '',
    accessTeamDomain: process.env.ACCESS_TEAM_DOMAIN || '',
  },
});
