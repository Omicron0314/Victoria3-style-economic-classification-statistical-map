#!/usr/bin/env node

/**
 * Merge all echarts-countries-js data into a single world GeoJSON file
 * Usage: node scripts/merge-echarts-countries.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const countriesDir = path.join(__dirname, '../echarts-countries-js');
const outputFile = path.join(__dirname, '../public/world-map.json');

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '../public'))) {
  fs.mkdirSync(path.join(__dirname, '../public'), { recursive: true });
}

const worldMap = {
  type: 'FeatureCollection',
  features: []
};

// List of files to skip
const skipFiles = ['index.js', 'world.js', 'eckert3-world.js'];

// Read all country files
const files = fs.readdirSync(countriesDir).filter(f => f.endsWith('.js'));

console.log(`Found ${files.length} files in echarts-countries-js directory...`);

let processedCount = 0;
let skippedCount = 0;

files.forEach((file) => {
  if (skipFiles.includes(file)) {
    console.log(`⊘ Skipping ${file}`);
    skippedCount++;
    return;
  }

  const filePath = path.join(countriesDir, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  try {
    // Extract the GeoJSON data using regex
    // Look for the FeatureCollection object within the UMD wrapper
    const featureCollectionMatch = fileContent.match(/\{"type":"FeatureCollection"[^}]*"features":\[[\s\S]*?\],"UTF8Encoding":true\}/);
    
    if (featureCollectionMatch) {
      const geoJsonStr = featureCollectionMatch[0];
      const geoJson = JSON.parse(geoJsonStr);
      
      // Add country name to each feature if not present
      const countryName = file.replace('.js', '').replace(/_/g, ' ');
      geoJson.features.forEach((feature) => {
        if (!feature.properties) {
          feature.properties = {};
        }
        // Preserve original name if it exists, otherwise use filename
        if (!feature.properties.country) {
          feature.properties.country = countryName;
        }
      });

      // Merge features into world map
      worldMap.features.push(...geoJson.features);
      console.log(`✓ Processed ${file} (${geoJson.features.length} features)`);
      processedCount++;
    } else {
      console.log(`⚠ Could not extract FeatureCollection from ${file}`);
      skippedCount++;
    }
  } catch (error) {
    console.log(`✗ Error processing ${file}: ${error.message}`);
    skippedCount++;
  }
});

// Write the merged world map
try {
  fs.writeFileSync(outputFile, JSON.stringify(worldMap, null, 2));
  console.log(`\n✓ Successfully merged ${processedCount} country files into ${outputFile}`);
  console.log(`✓ Total features: ${worldMap.features.length}`);
  console.log(`✓ Skipped: ${skippedCount} files`);
} catch (error) {
  console.error(`✗ Error writing output file: ${error.message}`);
  process.exit(1);
}
