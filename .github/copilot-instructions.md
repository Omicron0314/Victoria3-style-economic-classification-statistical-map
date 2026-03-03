# V3 Map - Copilot Instructions

## Project Overview
Interactive world map visualization built with **React 19**, **D3.js 7**, and **Vite**. Maps economic data (GDP, GDP per capita) using Mercator projection with Victoria 3 aesthetic (antique map style).

## Architecture & Module Organization

### Modular Structure (Highly Refactored)
The codebase has been split for extensibility and maintainability:

- **`src/constants/`** - Configuration & constants
  - `dataTypes.js` - Data type definitions (GDP, per capita GDP) with color schemes
  - `countryNameMappings.js` - CSV-to-GeoJSON country name mappings (two separate exports: `gdpCountryNameMapping`, `perCapitaCountryNameMapping`)
  - `styles.js` - Visual styles, color schemes, antique map styling

- **`src/utils/`** - Pure utility functions (no React dependencies)
  - `csvParser.js` - CSV parsing (`parseGDPData()`, `parsePerCapitaGDPData()`)
  - `colorScale.js` - D3 color scales and data range calculations
  - `mapRenderer.js` - D3 map rendering and interaction (initialize, render, reset)

- **`src/hooks/`** - Custom React hooks
  - `useMapData.js` - Data loading & state management (loads GeoJSON, GDP, per capita data)

- **`src/components/`** - React components
  - `InteractiveMap.jsx` - Main orchestrator component
  - `MapTooltip.jsx` - Hover tooltip display
  - `MapControls.jsx` - Reset button & zoom info
  - `GDPLegend.jsx` - Legend, color scale, data selector

### Data Flow
```
useMapData (hook)
  ↓ (GeoJSON + CSV data)
InteractiveMap (main component)
  ├→ initializeMap() + renderCountries() (utils/mapRenderer.js)
  ├→ createColorScale() (utils/colorScale.js)
  └→ Sub-components: MapTooltip, MapControls, GDPLegend
```

## Adding New Data Types

1. **Define in constants/dataTypes.js:**
   ```javascript
   export const dataTypes = {
     myDataType: {
       label: 'Display name',
       unit: 'Unit string',
       colors: { low: '#color', mid: '#color', high: '#color' },
       valueFormatter: (val, year) => `formatted ${val}`,
       isChoropleths: true,
       levels: 21,
       choroplethColors: [...] // 21-color gradient
     }
   };
   ```

2. **Add CSV parser in utils/csvParser.js:**
   ```javascript
   export function parseMyData(csvText) {
     // Return { data: { countryName: { value, year } } }
   }
   ```

3. **Add name mapping if needed:**
   - Update `src/constants/countryNameMappings.js` with country mappings

4. **Update useMapData hook:**
   - Call new parser function
   - Store results in `allData` state

5. **Select in dropdown:**
   - Automatically available via `dataTypes` entries

## Styling & Theming

- **Antique Map Colors:** [constants/styles.js](src/constants/styles.js) - cream (#d4c5a0), dark brown (#3d2817)
- **Data Visualization:** Color gradients from red (low) → gray (mid) → green (high)
- **Choropleth Colors:** 21-level quantile scales (discrete classification)

## D3.js Patterns

- **Projection:** Mercator, auto-fitted to features
- **Interaction:** Zoom/pan via `d3.zoom()`, hover highlight, click select
- **Data Binding:** Features keyed by country name for efficient updates
- **Performance:** Separate rendering for countries vs. graticule (grid lines)

## CSV Data Format

Two CSV sources (public folder):
- `imf-dm-export-20260302.csv` - GDP data (header row 1, data from row 2)
- `GDP per capita.csv` - Per capita GDP (header line contains "Country Name")

Both parsers:
1. Search for years 2025→2015 (backwards, use first available)
2. Apply country name mapping (handles CSV vs GeoJSON name differences)
3. Filter out invalid/missing values
4. Return `{ countryName: { value, year } }` structure

## Development Workflow

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build → dist/
npm run lint         # ESLint check
```

## React & State Management

- **Hooks:** useState for UI state (tooltip, zoom, selection, selectedDataType)
- **Data Fetching:** useEffect + useRef for GeoJSON/CSV loading in `useMapData` hook
- **Component Props:** Auto-receive dataTypes config, fire callbacks to parent
- **Re-render Triggers:**
  - `geoData` available → initialize map + render countries
  - `selectedDataType` changes → re-render only countries (colors update)
  - `allData` updated → recalculate color scales

## SVG/D3 Integration

- **DOM Reference:** `svgRef.current` + `mapInfoRef.current` (stores map context)
- **Event Handlers:** Attached directly to D3 paths, trigger React state updates
- **Cleanup:** useEffect returns cleanup function to remove listeners

## Naming Conventions

- **Country names:** Match GeoJSON `properties.name` values
- **Data keys:** `gdp`, `perCapitaGdp` (camelCase)
- **D3 Selections:** Prefixed with `d3.select()` or chained `.select().selectAll()`
- **CSS Classes:** `country`, `ocean`, `graticule` (used for D3 selection)

## Key Design Decisions

1. **Separation of Concerns:** Utils have no React deps, easy to test/reuse
2. **Color Scales:** Support both continuous & discrete (choropleth) modes
3. **Data Caching:** `useRef` stores GeoJSON for efficient re-renders
4. **Error Handling:** CSV parsers validate data format, log errors to console
5. **Accessibility:** Tooltip uses uppercase country names, aria-friendly structure

## Common Tasks

### Update GDP Color Gradient
Edit `dataTypes.gdp.choroplethColors` in [src/constants/dataTypes.js](src/constants/dataTypes.js).

### Add Country Name Mapping
Update both `gdpCountryNameMapping` and `perCapitaCountryNameMapping` in [src/constants/countryNameMappings.js](src/constants/countryNameMappings.js).

### Change Interaction Behavior
Modify callbacks in `renderCountries()` call in [src/components/InteractiveMap.jsx](src/components/InteractiveMap.jsx) second useEffect.

### Add D3 Visual Element
Use `mapInfoRef.current.g.append()` pattern after map initialization (follow existing graticule code).

## Performance Notes

- **Feature Count:** 2,518 GeoJSON features (all countries + territories)
- **D3 Rendering:** ~60ms initial render on modern machines
- **Re-renders:** Optimized via key function on data binding (country name)
- **Memory:** GeoData stored in useRef to prevent re-fetches
