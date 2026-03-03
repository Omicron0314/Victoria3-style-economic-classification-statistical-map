#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseCsvLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; continue; }
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

function inspect() {
  const repo = path.resolve(__dirname,'..');
  const perCapCsv = path.join(repo,'public','GDP per capita.csv');
  const mappingJs = path.join(repo,'src','constants','countryNameMappings.js');

  const txt = fs.readFileSync(perCapCsv,'utf8');
  const lines = txt.split('\n');

  let headerLineIdx = -1;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].includes('Country Name')) { headerLineIdx = i; break; }
  }
  if (headerLineIdx === -1) { console.error('header not found'); process.exit(2); }

  const headers = lines[headerLineIdx].split(',').map(h=>h.trim().replace(/"/g,''));
  const availableYears = [];
  for (let y=2025;y>=2015;y--) {
    const idx = headers.indexOf(y.toString());
    if (idx !== -1) availableYears.push({year:y,index:idx});
  }
  if (availableYears.length===0) { console.error('no years'); process.exit(2); }

  const mapping = loadMapping(mappingJs);
  const perCapMap = {};

  for (let i = headerLineIdx+1;i<lines.length;i++){
    const line = lines[i].trim(); if (!line) continue;
    const parts = parseCsvLine(line);
    if (parts.length < 1) continue;
    let country = parts[0].trim().replace(/"/g,'');
    const mapped = mapping[country] || country;

    let found = null; let actualYear = null;
    for (const {year,index} of availableYears) {
      if (index < parts.length) {
        const v = parts[index].trim();
        if (v && v !== '' && v !== '..') {
          const n = parseFloat(v);
          if (!isNaN(n) && n>0) { found = n; actualYear = year; break; }
        }
      }
    }
    if (found !== null) {
      perCapMap[mapped] = {orig: country, value: found, year: actualYear};
    }
  }

  const check = ['Vietnam','Turkey','Taiwan'];
  check.forEach(c => {
    if (perCapMap[c]) {
      console.log(`${c}: FOUND -> orig='${perCapMap[c].orig}' value=${perCapMap[c].value} year=${perCapMap[c].year}`);
    } else {
      console.log(`${c}: MISSING (no parsed entry)`);
    }
  });
}

inspect();
