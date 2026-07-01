import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('https://super-duper-parakeet-qj57x5jrg59hxxq7-5173.app.github.dev'),
  TRUST_PROXY: z
    .string()
    .regex(/^(\d+|true|false)$/, 'TRUST_PROXY deve ser um número, "true" ou "false"')
    .default('1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Variáveis de ambiente inválidas:\n');
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  console.error('\nVerifique seu arquivo .env\n');
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET.includes('mude_isso')) {
  console.error('\n❌ JWT_SECRET com valor padrão em produção! Defina um valor seguro.\n');
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
