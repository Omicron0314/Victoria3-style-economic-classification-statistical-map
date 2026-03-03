/**
 * CSV 数据解析工具
 * 用于解析GDP和人均GDP的CSV文件
 */

import { gdpCountryNameMapping, perCapitaCountryNameMapping, perCapitaGdpPppCountryNameMapping } from '../constants/countryNameMappings.js';

/**
 * 简单的CSV解析函数，处理引号和逗号
 * @param {string} line - CSV行文本
 * @returns {string[]} 解析后的字段数组
 */
function parseCSVLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  parts.push(current);
  return parts;
}

/**
 * 解析GDP CSV数据
 * @param {string} csvText - CSV文件内容
 * @returns {object} {data: {国家名称: {value, year}}, year: 2025}
 */
export function parseGDPData(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  // 找到年份列的索引（从2025开始，逐年向前）
  const availableYears = [];
  for (let i = 2025; i >= 2015; i--) {
    const yearIndex = headers.indexOf(i.toString());
    if (yearIndex !== -1) {
      availableYears.push({ year: i, index: yearIndex });
    }
  }

  if (availableYears.length === 0) {
    console.error('No year data found in GDP CSV');
    return { data: {}, year: 2025 };
  }

  const gdpMap = {};

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    let countryName = parts[0].trim().replace(/"/g, '');

    // 应用名称映射
    if (gdpCountryNameMapping[countryName]) {
      countryName = gdpCountryNameMapping[countryName];
    }

    // 遍历年份，找到第一个有有效数据的年份
    let foundGdpValue = null;
    let actualYear = 2025;

    for (const { year, index } of availableYears) {
      if (index < parts.length) {
        const gdpValue = parts[index].trim();
        if (gdpValue && gdpValue !== 'no data' && gdpValue !== '') {
          const gdpNum = parseFloat(gdpValue);
          if (!isNaN(gdpNum) && gdpNum > 0) {
            foundGdpValue = gdpNum;
            actualYear = year;
            break;
          }
        }
      }
    }

    if (foundGdpValue !== null) {
      gdpMap[countryName] = { value: foundGdpValue, year: actualYear };
    }
  }

  return { data: gdpMap, year: 2025 };
}

/**
 * 解析人均GDP CSV数据
 * @param {string} csvText - CSV文件内容
 * @returns {object} {data: {国家名称: {value, year}}}
 */
export function parsePerCapitaGDPData(csvText) {
  const lines = csvText.split('\n');

  // 人均GDP CSV格式：前两行是元数据，第三行是标题，之后是数据
  // 查找实际的标题行（包含"Country Name"）
  let headerLineIdx = -1;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].includes('Country Name')) {
      headerLineIdx = i;
      break;
    }
  }

  if (headerLineIdx === -1) {
    console.error('Could not find header in per capita GDP CSV');
    return { data: {} };
  }

  const headers = lines[headerLineIdx].split(',').map(h => h.trim().replace(/"/g, ''));

  // 找到年份列的索引（从2025开始，逐年向前）
  const availableYears = [];
  for (let i = 2025; i >= 2015; i--) {
    const yearIndex = headers.indexOf(i.toString());
    if (yearIndex !== -1) {
      availableYears.push({ year: i, index: yearIndex });
    }
  }

  if (availableYears.length === 0) {
    console.error('No year data found in per capita GDP CSV');
    return { data: {} };
  }

  const perCapitaMap = {};

  for (let i = headerLineIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    if (parts.length < 4) continue;

    let countryName = parts[0].trim().replace(/"/g, '');

    // 应用名称映射
    if (perCapitaCountryNameMapping[countryName]) {
      countryName = perCapitaCountryNameMapping[countryName];
    }

    // 找到第一个有有效数据的年份
    let foundValue = null;
    let actualYear = 2025;

    for (const { year, index } of availableYears) {
      if (index < parts.length) {
        const dataValue = parts[index].trim();
        if (dataValue && dataValue !== '' && dataValue !== '..') {
          const numValue = parseFloat(dataValue);
          if (!isNaN(numValue) && numValue > 0) {
            foundValue = numValue;
            actualYear = year;
            break;
          }
        }
      }
    }

    if (foundValue !== null) {
      perCapitaMap[countryName] = { value: foundValue, year: actualYear };
    }
  }

  return { data: perCapitaMap };
}

/**
 * 解析人均GDP PPP CSV数据
 * @param {string} csvText - CSV文件内容
 * @returns {object} {data: {国家名称: {value, year}}}
 */
export function parsePerCapitaGDPPPPData(csvText) {
  const lines = csvText.split('\n');

  // 人均GDP PPP CSV格式：前两行是元数据，第三行是标题，之后是数据
  // 查找实际的标题行（包含"Country Name"）
  let headerLineIdx = -1;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].includes('Country Name')) {
      headerLineIdx = i;
      break;
    }
  }

  if (headerLineIdx === -1) {
    console.error('Could not find header in per capita GDP PPP CSV');
    return { data: {} };
  }

  const headers = lines[headerLineIdx].split(',').map(h => h.trim().replace(/"/g, ''));

  // 找到年份列的索引（从2025开始，逐年向前）
  const availableYears = [];
  for (let i = 2025; i >= 2015; i--) {
    const yearIndex = headers.indexOf(i.toString());
    if (yearIndex !== -1) {
      availableYears.push({ year: i, index: yearIndex });
    }
  }

  if (availableYears.length === 0) {
    console.error('No year data found in per capita GDP PPP CSV');
    return { data: {} };
  }

  const perCapitaPppMap = {};

  for (let i = headerLineIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    if (parts.length < 4) continue;

    let countryName = parts[0].trim().replace(/"/g, '');

    // 应用名称映射
    if (perCapitaGdpPppCountryNameMapping[countryName]) {
      countryName = perCapitaGdpPppCountryNameMapping[countryName];
    }

    // 找到第一个有有效数据的年份
    let foundValue = null;
    let actualYear = 2025;

    for (const { year, index } of availableYears) {
      if (index < parts.length) {
        const dataValue = parts[index].trim();
        if (dataValue && dataValue !== '' && dataValue !== '..') {
          const numValue = parseFloat(dataValue);
          if (!isNaN(numValue) && numValue > 0) {
            foundValue = numValue;
            actualYear = year;
            break;
          }
        }
      }
    }

    if (foundValue !== null) {
      perCapitaPppMap[countryName] = { value: foundValue, year: actualYear };
    }
  }

  return { data: perCapitaPppMap };
}
