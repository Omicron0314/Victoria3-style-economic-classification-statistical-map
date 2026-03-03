/**
 * GDPLegend.jsx
 * GDP 图例和数据选择器组件
 */

import React from 'react';
import { dataTypes } from '../constants/dataTypes.js';

const GDPLegend = ({ selectedDataType, onDataTypeChange, dataYear, gdpRange, perCapitaRange, perCapitaPppRange, giniRange, isDarkMode }) => {
  const currentConfig = dataTypes[selectedDataType];
  const isChoropleths = currentConfig?.isChoropleths || false;
  let range;
  switch (selectedDataType) {
    case 'gdp':
      range = gdpRange;
      break;
    case 'perCapitaGdp':
      range = perCapitaRange;
      break;
    case 'perCapitaGdpPpp':
      range = perCapitaPppRange;
      break;
    case 'gini':
      range = giniRange;
      break;
    default:
      range = { min: 0, max: 0 };
  }

  return (
    <div className={`gdp-legend${isDarkMode ? ' dark' : ''}`}>
      <div className="legend-title">
        {currentConfig?.label}
        {isChoropleths && (
          <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.7 }}>
            分级统计
          </span>
        )}
      </div>

      <div className="legend-scale">
        {isChoropleths ? (
          // 分级统计图图例 - 只显示最高和最低
          <>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{
                  backgroundColor:
                    currentConfig?.choroplethColors?.[currentConfig?.choroplethColors?.length - 1]
                }}
              ></div>
              <span className="legend-label">最高</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: currentConfig?.choroplethColors?.[0] }}
              ></div>
              <span className="legend-label">最低</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#000000' }}></div>
              <span className="legend-label">无数据</span>
            </div>
          </>
        ) : (
          // 连续色阶图例
          <>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: currentConfig?.colors.high }}
              ></div>
              <span className="legend-label">最高</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: currentConfig?.colors.mid }}
              ></div>
              <span className="legend-label">中等</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: currentConfig?.colors.low }}
              ></div>
              <span className="legend-label">最低</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#000000' }}></div>
              <span className="legend-label">无数据</span>
            </div>
          </>
        )}
      </div>

      {range.max > 0 && (
        <div className="legend-range">
          <div>
            {selectedDataType === 'gdp' &&
              `$${range.min.toFixed(1)}B - $${range.max.toFixed(1)}B`}
            {selectedDataType === 'perCapitaGdp' &&
              `$${range.min.toFixed(0)} - $${range.max.toFixed(0)}`}
            {selectedDataType === 'perCapitaGdpPpp' &&
              `$${range.min.toFixed(0)} - $${range.max.toFixed(0)} PPP`}
            {selectedDataType === 'gini' &&
              `${range.min.toFixed(1)} - ${range.max.toFixed(1)}`}
          </div>
        </div>
      )}

      {/* 数据选择器 - 集成在图例中 */}
      <div className="data-selector-section">
        <label className="selector-label">选择数据</label>
        <select
          className="selector-dropdown"
          value={selectedDataType}
          onChange={(e) => onDataTypeChange(e.target.value)}
        >
          {Object.entries(dataTypes).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GDPLegend;
