/**
 * useMapData 自定义钩子
 * 用于加载和管理地图数据（GeoJSON、GDP、人均GDP）
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { parseGDPData, parsePerCapitaGDPData, parsePerCapitaGDPPPPData, parseGiniData } from '../utils/csvParser.js';

export function useMapData() {
  const [allData, setAllData] = useState({ gdp: {}, perCapitaGdp: {}, perCapitaGdpPpp: {}, gini: {} });
  const [gdpRange, setGdpRange] = useState({ min: 0, max: 0 });
  const [perCapitaRange, setPerCapitaRange] = useState({ min: 0, max: 0 });
  const [perCapitaPppRange, setPerCapitaPppRange] = useState({ min: 0, max: 0 });
  const [giniRange, setGiniRange] = useState({ min: 0, max: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const geoDataRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载 GeoJSON 数据（支持不同的 base 路径，例如 GitHub Pages）
        const baseUrl = import.meta.env.BASE_URL || '/';
        const geoData = await d3.json(`${baseUrl}countries.geo.json`);
        if (!geoData || !geoData.features) {
          throw new Error('Failed to load GeoJSON data');
        }
        geoDataRef.current = geoData;

        // 同时加载三个CSV数据
        const [gdpCsvText, perCapitaCsvText, perCapitaPppCsvText, giniCsvText] = await Promise.all([
          fetch(`${baseUrl}imf-dm-export-20260302.csv`).then(r => r.text()),
          fetch(`${baseUrl}GDP%20per%20capita.csv`).then(r => r.text()),
          fetch(`${baseUrl}GDP%20per%20capita,%20PPP.csv`).then(r => r.text()),
          fetch(`${baseUrl}Gini%20Index.csv`).then(r => r.text())
        ]);

        // 解析CSV数据
        const { data: gdpDataMap } = parseGDPData(gdpCsvText);
        const { data: perCapitaDataMap } = parsePerCapitaGDPData(perCapitaCsvText);
        const { data: perCapitaPppDataMap } = parsePerCapitaGDPPPPData(perCapitaPppCsvText);
        const { data: giniDataMap } = parseGiniData(giniCsvText);

        const newAllData = { gdp: gdpDataMap, perCapitaGdp: perCapitaDataMap, perCapitaGdpPpp: perCapitaPppDataMap, gini: giniDataMap };
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

        // 计算基尼范围
        const giniValues = Object.values(giniDataMap)
          .map(v => v?.value)
          .filter(v => v !== undefined && v !== null && !isNaN(v));
        if (giniValues.length > 0) {
          setGiniRange({
            min: Math.min(...giniValues),
            max: Math.max(...giniValues)
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
    perCapitaPppRange,    giniRange,    loading,
    error,
    geoDataRef
  };
}
