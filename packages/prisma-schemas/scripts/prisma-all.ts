#!/usr/bin/env node

import { execSync } from 'child_process';

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
    execSync(`pnpm exec prisma ${command} --schema=schemas/${schema}/schema.prisma`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Failed to run prisma ${command} for schema ${schema}: ${error}`);
    process.exit(1);
  }
}

console.log(`Successfully completed prisma ${command} for all schemas`);
