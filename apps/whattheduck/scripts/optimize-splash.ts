#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import imagemin, { type Plugin } from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

interface OptimizationResult {
  file: string;
  originalSize: number;
  newSize: number;
  savings: number;
}

const splashFiles = await glob('android/app/src/main/res/**/splash.png');

console.log(`Found ${splashFiles.length} splash images to optimize...`);

const results: OptimizationResult[] = [];

for (const file of splashFiles) {
  const originalSize = fs.statSync(file).size;
  console.log(`\nOptimizing ${file} (${Math.round(originalSize / 1024)}KB)`);

  try {
    // Use imagemin with pngquant plugin
    const result = await imagemin([file], {
      destination: path.dirname(file),
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8], // 60-80% quality
          speed: 1, // fastest compression
          strip: true, // remove metadata
        }) as Plugin,
      ],
    });

    if (result.length > 0) {
      const newSize = fs.statSync(file).size;
      const savings = Math.round(((originalSize - newSize) / originalSize) * 100);
      console.log(`✓ Optimized: ${Math.round(newSize / 1024)}KB (${savings}% reduction)`);

      results.push({
        file,
        originalSize,
        newSize,
        savings,
      });
    } else {
      console.log('⚠ No optimization applied (file may already be optimized)');
    }
  } catch (error) {
    console.log(`✗ Error optimizing ${file}:`, (error as Error).message);
  }
}

// Summary
const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
const totalNewSize = results.reduce((sum, r) => sum + r.newSize, 0);
const totalSavings = Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100);

console.log('\n' + '='.repeat(50));
console.log('OPTIMIZATION SUMMARY');
console.log('='.repeat(50));
console.log(`Files optimized: ${results.length}`);
console.log(`Total original size: ${Math.round(totalOriginalSize / 1024)}KB`);
console.log(`Total new size: ${Math.round(totalNewSize / 1024)}KB`);
console.log(`Total space saved: ${Math.round((totalOriginalSize - totalNewSize) / 1024)}KB (${totalSavings}%)`);
console.log('Splash image optimization complete!');
