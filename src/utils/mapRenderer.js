/**
 * 地图渲染工具
 * 用于D3地图的初始化、绘制和交互处理
 */

import * as d3 from 'd3';
import { mapStyles } from '../constants/styles.js';
import { createColorScale, getCountryColor, calculateDataRange } from './colorScale.js';
import { dataTypes } from '../constants/dataTypes.js';

/**
 * 初始化地图SVG和投影
 * @param {HTMLElement} svgElement - SVG DOM元素
 * @param {object} geoData - GeoJSON地理数据
 * @param {function} onZoom - 缩放回调函数 (scale) => void
 * @returns {object} {svg, g, projection, pathGenerator, zoomBehavior}
 */
export function initializeMap(svgElement, geoData, onZoom) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  // 清除之前的内容
  svg.selectAll('*').remove();

  // 创建投影（使用 Mercator 投影）
  const projection = d3.geoMercator()
    .fitSize([width, height], geoData);

  // 创建地理路径生成器
  const pathGenerator = d3.geoPath()
    .projection(projection);

  // 创建 g 元素用于缩放
  const g = svg.append('g');

  // 添加海洋背景矩形
  g.append('rect')
    .attr('class', 'ocean')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', mapStyles.ocean.fill)
    .attr('pointer-events', mapStyles.ocean.pointerEvents);

  // 创建缩放行为
  const zoomBehavior = d3.zoom()
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
      // 触发缩放回调以更新 React 状态
      if (onZoom) {
        onZoom(event.transform.k);
      }
    });

  svg.call(zoomBehavior);

  return { svg, g, projection, pathGenerator, zoomBehavior, width, height };
}

/**
 * 在地图上绘制国家
 * @param {object} mapInfo - {svg, g, projection, pathGenerator}
 * @param {object[]} features - GeoJSON features
 * @param {object} dataMap - 国家数据映射
 * @param {string} dataTypeKey - 数据类型键
 * @param {function} onMouseOver - 鼠标悬停回调
 * @param {function} onMouseOut - 鼠标离开回调
 * @param {function} onClick - 点击回调
 */
export function renderCountries(
  mapInfo,
  features,
  dataMap,
  dataTypeKey,
  onMouseOver,
  onMouseOut,
  onClick
) {
  const { g, pathGenerator } = mapInfo;

  // 计算有效值并创建色阶
  const range = calculateDataRange(features, dataMap);
  const validValues = features
    .map(f => {
      const data = dataMap[f.properties?.name];
      return data?.value;
    })
    .filter(v => v !== undefined && v !== null)
    .sort((a, b) => a - b);

  const colorScaleInfo = createColorScale(dataTypeKey, validValues);

  // 获取国家数据值的函数
  const getCountryValue = (countryName) => {
    const data = dataMap[countryName];
    return data ? data.value : null;
  };

  // 获取国家数据年份
  const getCountryYear = (countryName) => {
    const data = dataMap[countryName];
    return data ? data.year : 2025;
  };

  // 绘制国家边界
  g.selectAll('path.country')
    .data(features, (d, i) => d.properties?.name || `未知-${i}`)
    .enter()
    .append('path')
    .attr('d', pathGenerator)
    .attr('class', 'country')
    .style('fill', d => {
      const countryName = d.properties?.name || '未知领土';
      const value = getCountryValue(countryName);
      return getCountryColor(value, colorScaleInfo);
    })
    .style('stroke', mapStyles.country.defaultStroke)
    .style('stroke-width', mapStyles.country.defaultStrokeWidth)
    .attr('stroke-linejoin', 'miter')
    .attr('stroke-linecap', 'round')
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      const countryName = d.properties?.name || '未知领土';
      const value = getCountryValue(countryName);
      const year = getCountryYear(countryName);

      // 高亮该国家
      g.selectAll('path.country').each(function (p) {
        const pName = p.properties?.name || '未知领土';
        if (pName === countryName) {
          d3.select(this)
            .style('fill', mapStyles.country.hoverFill)
            .style('stroke', mapStyles.country.hoverStroke)
            .style('stroke-width', mapStyles.country.hoverStrokeWidth);
        }
      });

      // 触发回调
      onMouseOver({ countryName, value, year, event });
    })
    .on('mousemove', function (event) {
      // 触发鼠标移动回调以更新tooltip位置
      onMouseOver?.({ event, isMove: true });
    })
    .on('mouseout', function (event, d) {
      const countryName = d.properties?.name || '未知领土';
      onMouseOut({ countryName });

      // 恢复国家样式
      g.selectAll('path.country').each(function (p) {
        const pName = p.properties?.name || '未知领土';
        if (pName === countryName) {
          const value = getCountryValue(pName);
          d3.select(this)
            .style('fill', getCountryColor(value, colorScaleInfo))
            .style('stroke', mapStyles.country.defaultStroke)
            .style('stroke-width', mapStyles.country.defaultStrokeWidth);
        }
      });
    })
    .on('click', function (event, d) {
      const countryName = d.properties?.name || '未知领土';
      onClick({ countryName });

      // 更新所有国家路径的样式
      g.selectAll('path.country').each(function (p) {
        const pName = p.properties?.name || '未知领土';
        if (countryName === pName) {
          d3.select(this)
            .style('fill', mapStyles.country.selectedFill)
            .style('stroke', mapStyles.country.selectedStroke)
            .style('stroke-width', mapStyles.country.selectedStrokeWidth);
        } else {
          const value = getCountryValue(pName);
          d3.select(this)
            .style('fill', getCountryColor(value, colorScaleInfo))
            .style('stroke', mapStyles.country.defaultStroke)
            .style('stroke-width', mapStyles.country.defaultStrokeWidth);
        }
      });
    });
}

/**
 * 添加网格线（graticule）
 * @param {object} mapInfo - {g, pathGenerator}
 */
export function addGraticule(mapInfo) {
  const { g, pathGenerator } = mapInfo;
  const graticule = d3.geoGraticule();

  g.append('path')
    .datum(graticule())
    .attr('d', pathGenerator)
    .attr('class', 'graticule')
    .attr('fill', mapStyles.graticule.fill)
    .attr('stroke', mapStyles.graticule.stroke)
    .attr('stroke-width', mapStyles.graticule.strokeWidth)
    .attr('opacity', mapStyles.graticule.opacity)
    .attr('pointer-events', mapStyles.graticule.pointerEvents);
}

/**
 * 重置地图视图并恢复国家颜色（基于当前数据）
 * @param {object} mapInfo - {svg, g, zoomBehavior}
 * @param {object[]} features - GeoJSON features
 * @param {object} dataMap - 国家数据映射
 * @param {string} dataTypeKey - 数据类型键
 */
export function resetMapView(mapInfo, features = [], dataMap = {}, dataTypeKey = 'gdp') {
  const { svg, g, zoomBehavior } = mapInfo;

  svg.transition()
    .duration(750)
    .call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );

  // 计算当前色阶并恢复所有国家样式
  const validValues = features
    .map(f => {
      const data = dataMap[f.properties?.name];
      return data?.value;
    })
    .filter(v => v !== undefined && v !== null)
    .sort((a, b) => a - b);

  const colorScaleInfo = createColorScale(dataTypeKey, validValues);

  g.selectAll('path.country').each(function (d) {
    const countryName = d.properties?.name || '未知领土';
    const countryData = dataMap[countryName];
    const value = countryData ? countryData.value : null;
    d3.select(this)
      .style('fill', getCountryColor(value, colorScaleInfo))
      .style('stroke', mapStyles.country.defaultStroke)
      .style('stroke-width', mapStyles.country.defaultStrokeWidth);
  });
}

/**
 * 获取当前缩放级别
 * @param {object} svg - D3 SVG选择器
 * @returns {number} 缩放级别
 */
export function getCurrentZoom(svg) {
  const transform = d3.zoomTransform(svg.node());
  return transform.k;
}
