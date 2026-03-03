#!/usr/bin/env python3
"""
Merge all echarts-countries-js data into a single world GeoJSON file
"""

import json
import os
import re
from pathlib import Path

def extract_geojson_from_file(file_path):
    """Extract GeoJSON FeatureCollection from echarts-countries-js file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match the FeatureCollection object within the file
    pattern = r'\{"type":"FeatureCollection"[^}]*"features":\[[\s\S]*?\],"UTF8Encoding":true\}'
    match = re.search(pattern, content)
    
    if match:
        try:
            geojson_str = match.group(0)
            return json.loads(geojson_str)
        except json.JSONDecodeError as e:
            return None
    return None

def main():
    script_dir = Path(__file__).parent
    countries_dir = script_dir.parent / 'echarts-countries-js'
    public_dir = script_dir.parent / 'public'
    output_file = public_dir / 'world-map.json'
    
    # Create public directory if it doesn't exist
    public_dir.mkdir(exist_ok=True)
    
    world_map = {
        'type': 'FeatureCollection',
        'features': []
    }
    
    # List of files to skip
    skip_files = ['index.js', 'world.js', 'eckert3-world.js']
    
    # Get all JS files
    js_files = sorted([f for f in countries_dir.glob('*.js') if f.name not in skip_files])
    
    print(f'Found {len(js_files)} country files in echarts-countries-js directory...\n')
    
    processed_count = 0
    skipped_count = 0
    
    for file_path in js_files:
        try:
            geojson = extract_geojson_from_file(file_path)
            
            if geojson:
                # Add country name to each feature
                country_name = file_path.stem.replace('_', ' ')
                for feature in geojson.get('features', []):
                    if 'properties' not in feature:
                        feature['properties'] = {}
                    if 'country' not in feature['properties']:
                        feature['properties']['country'] = country_name
                
                # Merge features into world map
                world_map['features'].extend(geojson.get('features', []))
                print(f'✓ Processed {file_path.name} ({len(geojson.get("features", []))} features)')
                processed_count += 1
            else:
                print(f'⚠ Could not extract FeatureCollection from {file_path.name}')
                skipped_count += 1
        except Exception as e:
            print(f'✗ Error processing {file_path.name}: {str(e)}')
            skipped_count += 1
    
    # Write the merged world map
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(world_map, f)
        
        print(f'\n✓ Successfully merged {processed_count} country files')
        print(f'✓ Output: {output_file}')
        print(f'✓ Total features: {len(world_map["features"])}')
        print(f'✓ Skipped: {skipped_count} files')
    except Exception as e:
        print(f'✗ Error writing output file: {str(e)}')
        exit(1)

if __name__ == '__main__':
    main()
