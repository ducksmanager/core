#!/usr/bin/env node

import { execSync } from 'child_process';
import { resolve } from 'path';

const schemas = ['coa', 'cover_info', 'dm', 'dm_stats', 'edgecreator'] as const;
const command: string | undefined = process.argv[2];

if (!command) {
  console.error('Usage: bun scripts/prisma-all.ts <command>');
  console.error('Example: bun scripts/prisma-all.ts generate');
  process.exit(1);
}

for (const schema of schemas) {
  console.log(`Running prisma ${command} for schema: ${schema}`);
  try {
    const schemaPath = resolve(process.cwd(), 'schemas', schema);
    // Use the direct path to the local Prisma binary to avoid pnpm exec issues with cwd
    // This ensures we use Prisma 7 from node_modules and works reliably with cwd
    const prismaBin = resolve(process.cwd(), 'node_modules', '.bin', 'prisma');
    execSync(`${prismaBin} ${command} --schema=schema.prisma`, {
      cwd: schemaPath,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Failed to run prisma ${command} for schema ${schema}: ${error}`);
    process.exit(1);
  }
}

console.log(`Successfully completed prisma ${command} for all schemas`);
