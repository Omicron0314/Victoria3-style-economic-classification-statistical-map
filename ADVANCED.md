# 🎨 D3.js 地图高级功能指南

本文档提供如何在 InteractiveMap 组件中添加高级功能的示例。

## 目录

- [添加热力图层](#添加热力图层)
- [添加数据绑定](#添加数据绑定)
- [添加搜索功能](#添加搜索功能)
- [添加自定义图标](#添加自定义图标)
- [性能优化](#性能优化)

---

## 添加热力图层

### 概述

在地图上使用颜色深度表示数值数据（如人口密度、GDP 等）。

### 实现代码

在 `InteractiveMap.jsx` 中添加以下代码：

```jsx
// 在加载 GeoJSON 后，添加以下代码

// 创建颜色刻度
const colorScale = d3.scaleLinear()
  .domain([0, 100])  // 数据范围
  .range(['#fff5eb', '#e31a1c']);  // 颜色范围（浅到深）

// 绘制国家并根据数据着色
g.selectAll('path')
  .data(data.features)
  .enter()
  .append('path')
  .attr('d', pathGenerator)
  .attr('class', 'country')
  .attr('fill', d => {
    // 这里 d.properties.value 应该包含你的数据值
    const value = d.properties.value || 0;
    return colorScale(value);
  })
  .attr('stroke', '#ccc')
  .attr('stroke-width', 0.5);
```

### 示例数据格式

```json
{
  "type": "Feature",
  "properties": {
    "name": "China",
    "value": 85
  },
  "geometry": { ... }
}
```

---

## 添加数据绑定

### 概述

将外部数据与地图结合，动态更新显示。

### 实现代码

创建一个新的 Hook 处理数据更新：

```jsx
// 在 InteractiveMap.jsx 顶部添加
import { useState, useCallback } from 'react';

// 在组件内部添加
const [countryData, setCountryData] = useState({});

// 创建更新函数
const updateCountryData = useCallback((newData) => {
  setCountryData(newData);
  // 重新渲染地图颜色
  d3.selectAll('.country')
    .attr('fill', d => {
      const value = newData[d.properties.name] || 0;
      return colorScale(value);
    });
}, []);

// 在 useEffect 中调用数据更新
useEffect(() => {
  // 模拟获取数据
  fetch('/api/country-data')
    .then(res => res.json())
    .then(data => updateCountryData(data));
}, [updateCountryData]);
```

---

## 添加搜索功能

### 概述

用户可以搜索国家并自动定位到该国家。

### 实现代码

在 `InteractiveMap.jsx` 中添加搜索组件：

```jsx
// 在组件返回值中添加搜索框
const [searchTerm, setSearchTerm] = useState('');

// 搜索处理函数
const handleSearch = (term) => {
  setSearchTerm(term);
  
  const feature = data.features.find(f => 
    f.properties.name.toLowerCase().includes(term.toLowerCase())
  );
  
  if (feature) {
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feature);
    const k = Math.min(width / (x1 - x0), height / (y1 - y0)) * 0.8;
    const tx = (width - k * (x0 + x1) / 2) / 2;
    const ty = (height - k * (y0 + y1) / 2) / 2;

    g.transition()
      .duration(750)
      .attr('transform', `translate(${tx},${ty})scale(${k})`);
  }
};

// 在 JSX 中添加搜索框
return (
  <div className="map-container">
    <svg ref={svgRef} className="map-svg"></svg>
    
    <div className="search-box">
      <input
        type="text"
        placeholder="搜索国家..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
    
    {/* 其他内容... */}
  </div>
);
```

### 对应的 CSS

```css
.search-box {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 500;
}

.search-box input {
  padding: 10px 15px;
  border: 2px solid #667eea;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box input:focus {
  outline: none;
  border-color: #764ba2;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
```

---

## 添加自定义图标

### 概述

在特定位置添加标记和图标。

### 实现代码

```jsx
// 定义点数据
const points = [
  { name: '北京', coords: [116.4074, 39.9042], population: 2100 },
  { name: '上海', coords: [121.4737, 31.2304], population: 2400 },
  // 更多城市...
];

// 在绘制国家后添加标记
g.selectAll('.city-point')
  .data(points)
  .enter()
  .append('circle')
  .attr('class', 'city-point')
  .attr('cx', d => projection(d.coords)[0])
  .attr('cy', d => projection(d.coords)[1])
  .attr('r', d => Math.sqrt(d.population) / 50)
  .attr('fill', '#ff6b6b')
  .attr('opacity', 0.7)
  .on('mouseover', function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr('r', d => Math.sqrt(d.population) / 30)
      .attr('fill', '#e31a1c');
    
    setTooltip({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      name: `${d.name} - 人口: ${d.population}万`
    });
  });

// 添加相应的 CSS
const style = document.createElement('style');
style.textContent = `
  .city-point {
    cursor: pointer;
    transition: opacity 0.3s;
  }
  .city-point:hover {
    opacity: 1;
  }
`;
document.head.appendChild(style);
```

---

## 性能优化

### 1. 使用 TopoJSON 替代 GeoJSON

TopoJSON 文件更小，加载更快：

```jsx
// 使用 topojson-client
import * as topojson from 'topojson-client';

// 加载和转换 TopoJSON
d3.json('countries.topojson').then(topology => {
  const countries = topojson.feature(
    topology,
    topology.objects.countries
  );
  // 继续使用 countries...
});
```

### 2. 数据虚拟化

对于大量数据点：

```jsx
// 只渲染可见区域内的数据
const visiblePoints = points.filter(point => {
  const [x, y] = projection(point.coords);
  return x > 0 && x < width && y > 0 && y < height;
});

g.selectAll('.point')
  .data(visiblePoints)
  .enter()
  .append('circle');
```

### 3. 使用 Canvas 替代 SVG

对于超大数据集（百万级别）：

```jsx
// 使用 Canvas 渲染
const canvas = d3.select(svgRef.current).node();
const context = canvas.getContext('2d');

// 使用 d3-canvas-context
const path = d3.geoPath().context(context);

data.features.forEach(feature => {
  context.fillStyle = colorScale(feature.properties.value);
  context.beginPath();
  path(feature);
  context.fill();
});
```

---

## 完整的高级组件示例

```jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const AdvancedInteractiveMap = ({ geoJsonPath, pointsData = [] }) => {
  const svgRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    if (!svgRef.current || !geoJsonPath) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .fitSize([width, height], { type: 'FeatureCollection', features: [] });

    const pathGenerator = d3.geoPath().projection(projection);
    const g = svg.append('g');

    // 颜色刻度
    const colorScale = d3.scaleLinear()
      .domain([0, 100])
      .range(['#fff5eb', '#e31a1c']);

    d3.json(geoJsonPath).then(data => {
      projection.fitSize([width, height], data);

      // 绘制国家
      g.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .attr('fill', d => colorScale(d.properties.value || 50))
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('click', function(event, d) {
          setSelectedCountry(d.properties.name);
          // 放大逻辑...
        });

      // 绘制标记点
      if (pointsData.length > 0) {
        g.selectAll('.point')
          .data(pointsData)
          .enter()
          .append('circle')
          .attr('class', 'point')
          .attr('cx', d => projection(d.coords)[0])
          .attr('cy', d => projection(d.coords)[1])
          .attr('r', 5)
          .attr('fill', '#ff6b6b')
          .attr('opacity', 0.7);
      }
    });

    // 搜索功能
    window.searchCountry = (term) => {
      setSearchTerm(term);
      // 搜索逻辑...
    };

  }, [geoJsonPath, pointsData]);

  return (
    <div className="map-container">
      <svg ref={svgRef} className="map-svg"></svg>
      <div className="search-box">
        <input
          type="text"
          placeholder="搜索国家..."
          value={searchTerm}
          onChange={(e) => window.searchCountry(e.target.value)}
        />
      </div>
      {selectedCountry && (
        <div className="country-info">
          选中国家: {selectedCountry}
        </div>
      )}
    </div>
  );
};

export default AdvancedInteractiveMap;
```

---

## 📚 更多资源

- [D3.js 官方示例](https://observablehq.com/@d3/gallery)
- [TopoJSON 文档](https://github.com/topojson/topojson)
- [Geo 投影参考](https://d3-wiki.readthedocs.io/zh_CN/master/Geo-Projections/)

---

**开心编码！** 🎉
