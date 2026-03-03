/**
 * MapTooltip.jsx
 * 地图提示框组件
 */

import React from 'react';

const MapTooltip = ({ visible, x, y, country, value, year, valueFormatter, isDarkMode }) => {
  if (!visible) return null;

  return (
    <div
      className={`tooltip${isDarkMode ? ' dark' : ''}`}
      style={{
        left: `${x + 10}px`,
        top: `${y + 10}px`
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        {country.toUpperCase()}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9 }}>
        {valueFormatter(value, year)}
      </div>
    </div>
  );
};

export default MapTooltip;
