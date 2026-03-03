#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadGeoNames(geoPath) {
  const txt = fs.readFileSync(geoPath, 'utf8');
  const obj = JSON.parse(txt);
  const names = new Set(obj.features.map(f => f.properties && f.properties.name).filter(Boolean));
  return names;
}

function loadMapping(mappingPath) {
  const txt = fs.readFileSync(mappingPath, 'utf8');
  const map = {};
  const regex = /['\"]([^'\"]+)['\"]\s*:\s*['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = regex.exec(txt)) !== null) {
    map[m[1]] = m[2];
  }
  return map;
}

function parseCsvLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // handle escaped quotes ""
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}

function extractCsvCountry(line) {
  const parts = parseCsvLine(line);
  if (!parts || parts.length === 0) return null;
  return parts[0].trim();
}

function csvHasData(line) {
  const parts = parseCsvLine(line);
  if (!parts) return false;
  for (let i = parts.length - 1; i >= 0 && i > parts.length - 30; i--) {
    const v = parts[i].trim();
    if (!v || v.toLowerCase() === 'no data' || v === '..') continue;
    if (!isNaN(parseFloat(v))) return true;
  }
  return false;
}

function collectCsvCountries(csvPath) {
  const lines = fs.readFileSync(csvPath,'utf8').split('\n');
  const names = [];
  for (let i = 0;i<lines.length;i++){
    const line = lines[i].trim();
    if (!line) continue;
    const name = extractCsvCountry(line);
    if (!name) continue;
    if (name.toLowerCase().includes('gdp') || name.toLowerCase().includes('country name') || name.match(/^\d+$/)) continue;
    if (csvHasData(line)) names.push(name);
  }
  return names;
}

function run() {
  const repo = path.resolve(__dirname,'..');
  const geo = path.join(repo,'countries.geo.json');
  const gdpCsv = path.join(repo,'imf-dm-export-20260302.csv');
  const perCapCsv = path.join(repo,'GDP per capita.csv');
  const mappingJs = path.join(repo,'src','constants','countryNameMappings.js');

  const geoNames = loadGeoNames(geo);
  console.log('Geo features count:', geoNames.size);
  // quick presence check for some known names
  ['Andorra','China','United States of America','The Bahamas','Ivory Coast','Czech Republic'].forEach(n=>{
    console.log('has', n, ':', geoNames.has(n));
  });
  const mapping = loadMapping(mappingJs);

  const gdpCountries = collectCsvCountries(gdpCsv);
  const perCapCountries = collectCsvCountries(perCapCsv);

  function check(list, label) {
    const notMatched = [];
    list.forEach(orig => {
      const mapped = mapping[orig] || orig;
      if (!geoNames.has(mapped)) {
        notMatched.push({orig, mapped});
      }
    });
    console.log(`\\n=== ${label} - CSV countries with data but no matching GeoJSON name (sample up to 200) ===`);
    notMatched.slice(0,200).forEach(it=> console.log(`${it.orig}  ->  ${it.mapped}`));
    console.log(`${notMatched.length} not matched total\n`);
  }

  check(gdpCountries, 'GDP CSV');
  check(perCapCountries, 'Per Capita CSV');
}

run();
