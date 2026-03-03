/**
 * useMapData 自定义钩子
 * 用于加载和管理地图数据（GeoJSON、GDP、人均GDP）
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { parseGDPData, parsePerCapitaGDPData, parsePerCapitaGDPPPPData } from '../utils/csvParser.js';

export function useMapData() {
  const [allData, setAllData] = useState({ gdp: {}, perCapitaGdp: {}, perCapitaGdpPpp: {} });
  const [gdpRange, setGdpRange] = useState({ min: 0, max: 0 });
  const [perCapitaRange, setPerCapitaRange] = useState({ min: 0, max: 0 });
  const [perCapitaPppRange, setPerCapitaPppRange] = useState({ min: 0, max: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const geoDataRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载 GeoJSON 数据
        const geoData = await d3.json('/countries.geo.json');
        if (!geoData || !geoData.features) {
          throw new Error('Failed to load GeoJSON data');
        }
        geoDataRef.current = geoData;

        // 同时加载三个CSV数据
        const [gdpCsvText, perCapitaCsvText, perCapitaPppCsvText] = await Promise.all([
          fetch('/imf-dm-export-20260302.csv').then(r => r.text()),
          fetch('/GDP%20per%20capita.csv').then(r => r.text()),
          fetch('/GDP%20per%20capita,%20PPP.csv').then(r => r.text())
        ]);

        // 解析CSV数据
        const { data: gdpDataMap } = parseGDPData(gdpCsvText);
        const { data: perCapitaDataMap } = parsePerCapitaGDPData(perCapitaCsvText);
        const { data: perCapitaPppDataMap } = parsePerCapitaGDPPPPData(perCapitaPppCsvText);

        const newAllData = { gdp: gdpDataMap, perCapitaGdp: perCapitaDataMap, perCapitaGdpPpp: perCapitaPppDataMap };
        setAllData(newAllData);

        // 计算GDP范围
        const gdpValues = Object.values(gdpDataMap)
          .map(v => v?.value)
          .filter(v => v !== undefined && v !== null && !isNaN(v));
        if (gdpValues.length > 0) {
          setGdpRange({
            min: Math.min(...gdpValues),
            max: Math.max(...gdpValues)
          });
        }

        // 计算人均GDP范围
        const perCapitaValues = Object.values(perCapitaDataMap)
          .map(v => v?.value)
          .filter(v => v !== undefined && v !== null && !isNaN(v));
        if (perCapitaValues.length > 0) {
          setPerCapitaRange({
            min: Math.min(...perCapitaValues),
            max: Math.max(...perCapitaValues)
          });
        }

        // 计算人均GDP PPP范围
        const perCapitaPppValues = Object.values(perCapitaPppDataMap)
          .map(v => v?.value)
          .filter(v => v !== undefined && v !== null && !isNaN(v));
        if (perCapitaPppValues.length > 0) {
          setPerCapitaPppRange({
            min: Math.min(...perCapitaPppValues),
            max: Math.max(...perCapitaPppValues)
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    geoData: geoDataRef.current,
    allData,
    gdpRange,
    perCapitaRange,
    perCapitaPppRange,
    loading,
    error,
    geoDataRef
  };
}
