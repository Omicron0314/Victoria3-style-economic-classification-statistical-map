/**
 * 颜色阶度工具
 * 用于创建色阶和计算国家的颜色
 */

import * as d3 from 'd3';
import { dataTypes } from '../constants/dataTypes.js';
import { mapStyles } from '../constants/styles.js';

/**
 * 创建颜色阶度（支持分级统计和连续色阶）
 * @param {string} dataTypeKey - 数据类型键 (gdp, perCapitaGdp)
 * @param {number[]} validValues - 有效数据值的数组
 * @returns {object} {colorScale或quantizeScale, type: 'linear'|'quantile'}
 */
export function createColorScale(dataTypeKey, validValues) {
  const dataTypeConfig = dataTypes[dataTypeKey];
  if (!dataTypeConfig) {
    throw new Error(`Unknown data type: ${dataTypeKey}`);
  }

  const isChoropleths = dataTypeConfig?.isChoropleths || false;

  if (validValues.length === 0) {
    return { type: 'empty', scale: null };
  }

  const minValue = validValues[0];
  const maxValue = validValues[validValues.length - 1];

  if (isChoropleths && dataTypeConfig?.choroplethColors) {
    // 分级统计图模式：使用离散的颜色级别
    const colors = dataTypeConfig.choroplethColors;
    const quantizeScale = d3.scaleQuantile()
      .domain(validValues)
      .range(colors);

    return { type: 'quantile', scale: quantizeScale };
  } else {
    // 连续色阶模式
    const colorScale = d3.scaleLinear()
      .domain([minValue, (minValue + maxValue) / 2, maxValue])
      .range([
        dataTypeConfig.colors.low,
        dataTypeConfig.colors.mid,
        dataTypeConfig.colors.high
      ])
      .interpolate(d3.interpolateLab);

    return { type: 'linear', scale: colorScale };
  }
}

/**
 * 获取国家的颜色
 * @param {number|null} value - 国家的数据值
 * @param {object} colorScaleInfo - createColorScale的返回结果
 * @returns {string} 颜色值
 */
export function getCountryColor(value, colorScaleInfo) {
  if (value === null || value === undefined) {
    return mapStyles.country.defaultFill; // 无数据用黑色
  }

  if (!colorScaleInfo?.scale) {
    return mapStyles.country.defaultFill;
  }

  return colorScaleInfo.scale(value);
}

/**
 * 计算数据范围（仅包含有数据的国家）
 * @param {object[]} features - GeoJSON features
 * @param {object} dataMap - 国家数据映射
 * @returns {object} {min, max}
 */
export function calculateDataRange(features, dataMap) {
  const validValues = features
    .map(f => {
      const countryData = dataMap[f.properties?.name];
      return countryData?.value;
    })
    .filter(v => v !== undefined && v !== null && !isNaN(v))
    .sort((a, b) => a - b);

  if (validValues.length === 0) {
    return { min: 0, max: 100 };
  }

  return {
    min: validValues[0],
    max: validValues[validValues.length - 1]
  };
}
