/**
 * Central Environment Variables Validation (Fail-Closed)
 * 
 * Verifies that all mandatory environment variables are present and non-empty.
 * Throws an explicit error halting execution immediately if any mandatory variable is missing.
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

export interface ValidatedEnv {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  [key: string]: string | undefined;
}

export function validateEnv(): ValidatedEnv {
  const missing: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    const val = process.env[varName];
    if (!val || val.trim() === '') {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[Fail-Closed Environment Security] Missing or empty required environment variable(s): ${missing.join(', ')}`
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  };
}
