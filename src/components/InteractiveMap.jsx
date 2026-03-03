import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../styles/InteractiveMap.css';
import { useMapData } from '../hooks/useMapData.js';
import { dataTypes } from '../constants/dataTypes.js';
import { mapStyles, antiqueMapStyles, antiqueMapStylesDark } from '../constants/styles.js';
import { createColorScale, getCountryColor, calculateDataRange } from '../utils/colorScale.js';
import {
  initializeMap,
  renderCountries,
  addGraticule,
  resetMapView,
  getCurrentZoom
} from '../utils/mapRenderer.js';
import MapTooltip from './MapTooltip.jsx';
import MapControls from './MapControls.jsx';
import GDPLegend from './GDPLegend.jsx';

const InteractiveMap = () => {
  const svgRef = useRef();
  const mapInfoRef = useRef(null);

  // 主题状态监听系统暗色偏好
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 状态管理
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', value: null, year: 2025 });
  const [zoom, setZoom] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState('gdp');
  const [dataYear, setDataYear] = useState(2025);
  const [themeToggle, setThemeToggle] = useState(0);

  // 使用自定义钩子加载数据
  const { geoData, allData, gdpRange, perCapitaRange, perCapitaPppRange, giniRange, loading, error } = useMapData();

  // 监听系统深色模式变更
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setIsDarkMode(e.matches);
    listener(mq);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  // 根据主题更新 mapStyles
  useEffect(() => {
    if (isDarkMode) {
      mapStyles.ocean.fill = '#0a1e2e';
      mapStyles.country.defaultStroke = '#aaa';
      mapStyles.country.defaultFill = '#444';
      mapStyles.country.hoverFill = '#555';
      mapStyles.graticule.stroke = '#888';
    } else {
      mapStyles.ocean.fill = '#3d5a80';
      mapStyles.country.defaultStroke = '#5c4033';
      mapStyles.country.defaultFill = '#000000';
      mapStyles.country.hoverFill = '#e8d7b8';
      mapStyles.graticule.stroke = '#5c4033';
    }

    // 如果地图已经初始化，则更新海洋填充
    if (mapInfoRef.current) {
      mapInfoRef.current.svg.select('rect.ocean').attr('fill', mapStyles.ocean.fill);
      // 触发主题重新渲染
      setThemeToggle(t => t + 1);
    }
  }, [isDarkMode]);

  // 初始化地图 - 依赖geoData或主题变化
  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    // 初始化地图，传递缩放回调
    const mapInfo = initializeMap(svgRef.current, geoData, setZoom);
    mapInfoRef.current = mapInfo;

    // 为SVG添加离开事件监听
    mapInfo.svg.on('mouseleave', () => {
      setTooltip({ visible: false, x: 0, y: 0, name: '', value: null });
    });

    // 清理函数
    return () => {
      if (mapInfoRef.current) {
        mapInfoRef.current.svg.on('mouseleave', null);
      }
    };
  }, [geoData, isDarkMode]);

  // 在数据或数据类型改变时重新渲染countries
  useEffect(() => {
    if (!svgRef.current || !geoData || !mapInfoRef.current || Object.keys(allData.gdp).length === 0) {
      return;
    }

    const mapInfo = mapInfoRef.current;
    const currentDataMap = allData[selectedDataType] || {};

    // 清除之前的countries
    mapInfo.g.selectAll('path.country').remove();

    // 重新计算投影
    mapInfo.projection.fitSize([mapInfo.width, mapInfo.height], geoData);

    // 添加graticule
    addGraticule(mapInfo);

    // 渲染countries
    renderCountries(
      mapInfo,
      geoData.features,
      currentDataMap,
      selectedDataType,
      ({ countryName, value, year, event, isMove }) => {
        if (isMove && event) {
          const [x, y] = d3.pointer(event);
          setTooltip(prev => ({ ...prev, x, y }));
        } else if (countryName && value !== undefined) {
          const [x, y] = d3.pointer(event);
          setTooltip({
            visible: true,
            x,
            y,
            name: countryName,
            value,
            year
          });
        }
      },
      ({ countryName }) => {
        const isSelected = selectedCountry === countryName;
        if (!isSelected) {
          setTooltip({ visible: false, x: 0, y: 0, name: '', value: null });
        }
      },
      ({ countryName }) => {
        setSelectedCountry(countryName);
      }
    );
  }, [geoData, allData, selectedDataType, selectedCountry, isDarkMode, themeToggle]);

  // 处理重置地图
  const handleReset = () => {
    if (!mapInfoRef.current) return;

    setSelectedCountry(null);
    setTooltip({ visible: false, x: 0, y: 0, name: '', value: null });

    // 传递 geo features 和当前数据以便恢复颜色
    resetMapView(
      mapInfoRef.current,
      geoData?.features || [],
      allData[selectedDataType] || {},
      selectedDataType
    );
    setZoom(1);
  };

  return (
    <div className={`map-container${isDarkMode ? ' dark' : ''}`}>
      <svg ref={svgRef} className="map-svg"></svg>

      {/* 提示框 */}
      <MapTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        country={tooltip.name}
        value={tooltip.value}
        year={tooltip.year}
        valueFormatter={dataTypes[selectedDataType]?.valueFormatter}
        isDarkMode={isDarkMode}
      />

      {/* 控制面板 */}
      <MapControls zoom={zoom} onReset={handleReset} isDarkMode={isDarkMode} />

      {/* GDP 图例和数据选择器 */}
      <GDPLegend
        selectedDataType={selectedDataType}
        onDataTypeChange={setSelectedDataType}
        dataYear={dataYear}
        gdpRange={gdpRange}
        perCapitaRange={perCapitaRange}
        perCapitaPppRange={perCapitaPppRange}
        giniRange={giniRange}
        isDarkMode={isDarkMode}
      />

      {/* 显示选中的国家 */}
      {selectedCountry && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '220px',
            background: (isDarkMode ? antiqueMapStylesDark : antiqueMapStyles).background,
            border: (isDarkMode ? antiqueMapStylesDark : antiqueMapStyles).border,
            padding: '12px 16px',
            fontFamily: (isDarkMode ? antiqueMapStylesDark : antiqueMapStyles).fontFamily,
            color: (isDarkMode ? antiqueMapStylesDark : antiqueMapStyles).textColor,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: (isDarkMode ? antiqueMapStylesDark : antiqueMapStyles).shadow,
            zIndex: 500
          }}
        >
          选中: <strong>{selectedCountry}</strong>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
