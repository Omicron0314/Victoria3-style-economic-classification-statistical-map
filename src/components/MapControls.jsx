/**
 * MapControls.jsx
 * 地图控制面板组件（重置按钮、缩放信息）
 */

import React from 'react';

const MapControls = ({ zoom, onReset, isDarkMode }) => {
  return (
    <div className={`controls${isDarkMode ? ' dark' : ''}`}>
      <button
        className="btn-reset"
        onClick={onReset}
        title="重置地图视图到初始状态"
      >
        ⟲ 重置地图
      </button>
      <div className="zoom-info">
        缩放: {zoom.toFixed(2)}×
      </div>
    </div>
  );
};

export default MapControls;
