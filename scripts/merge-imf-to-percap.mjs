import fs from 'fs/promises';
import path from 'path';
import { parsePerCapitaGDPData, parseGDPData } from '../src/utils/csvParser.js';

const repo = path.resolve(decodeURIComponent(new URL(import.meta.url).pathname), '..', '..');
const perCapPath = path.join(repo, 'GDP per capita.csv');
const imfPath = path.join(repo, 'imf-dm-export-20260302.csv');
const outDir = path.join(repo, 'public');
const outPath = path.join(outDir, 'GDP per capita.merged.csv');

function looksLikeAggregate(name) {
  if (!name) return true;
  const n = name.toLowerCase();
  const aggregates = [
    'world', 'euro area', 'high income', 'low income', 'middle income', 'upper middle', 'lower middle',
    'east asia', 'europe & central asia', 'africa', 'latin america', 'caribbean', 'oecd', 'european union',
    'income', 'region', 'group', 'fragile', 'small states', 'ida', 'ibd', 'countries', 'total',
    'asia', 'pacific', 'america', 'americas', 'europe', 'advanced', 'emerging', 'developing', 'major', 'economies'
  ];
  for (const a of aggregates) if (n.includes(a)) return true;
  // also filter names that look like multi-region descriptors
  const multiRegionPatterns = [/ & /, / and /, /, /];
  for (const p of multiRegionPatterns) if (p.test(name)) return true;
  // exclude codes / entries with digits (e.g., ASEAN-5) or obvious non-country tokens
  if (/\d/.test(name)) return true;
  if (n.length > 60) return true;
  return false;
}

async function run() {
  try {
    const [perCapText, imfText] = await Promise.all([
      fs.readFile(perCapPath, 'utf8'),
      fs.readFile(imfPath, 'utf8')
    ]);

    const perCap = parsePerCapitaGDPData(perCapText).data;
    const imf = parseGDPData(imfText).data;

    const merged = {};
    for (const [c, v] of Object.entries(perCap)) {
      merged[c] = { value: v.value, year: v.year, source: 'PerCapita' };
    }

    // build normalized map of perCap keys to avoid duplicate entries with variant naming
    function normKey(s){return s.replace(/[^a-z0-9]/gi,'').toLowerCase();}
    const perCapNorm = {};
    for (const k of Object.keys(perCap)) perCapNorm[normKey(k)] = k;

    const added = [];
    for (const [c, v] of Object.entries(imf)) {
      const nk = normKey(c);
      if (perCapNorm[nk]) continue; // already present under variant name
      if (merged[c]) continue; // safety
      if (looksLikeAggregate(c)) continue;
      merged[c] = { value: v.value, year: v.year, source: 'IMF' };
      added.push({ country: c, value: v.value, year: v.year });
    }

    await fs.mkdir(outDir, { recursive: true });

    const lines = ['Country Name,Value,Year,Source'];
    const keys = Object.keys(merged).sort((a,b)=>a.localeCompare(b));
    for (const k of keys) {
      const e = merged[k];
      lines.push(`"${k}",${e.value},${e.year},${e.source}`);
    }

    await fs.writeFile(outPath, lines.join('\n'), 'utf8');

    console.log(`Merged file written: ${outPath}`);
    console.log(`Per-capita entries: ${Object.keys(perCap).length}`);
    console.log(`IMF fallback additions: ${added.length}`);
    if (added.length > 0) {
      console.log('Added countries (sample up to 50):');
      added.slice(0,50).forEach(a=>console.log(`${a.country} → ${a.value} (year ${a.year})`));
    }
  } catch (err) {
    console.error('Error during merge:', err);
    process.exitCode = 1;
  }
}

run();
