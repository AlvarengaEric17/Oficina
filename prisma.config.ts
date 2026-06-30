import { defineConfig } from '@prisma/internals';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
