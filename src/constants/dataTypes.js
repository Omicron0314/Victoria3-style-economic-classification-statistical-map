/**
 * 数据类型配置
 * 定义支持的多种数据展示类型，易于扩展
 */

export const dataTypes = {
  gdp: {
    label: '国内生产总值 (GDP,现价美元)',
    unit: '十亿 USD',
    colors: {
      low: '#9B5555',
      mid: '#c9c9c9',
      high: '#5A8C6B'
    },
    valueFormatter: (val, year) => val ? `$${val.toFixed(1)}B (${year})` : '无数据',
    // 分级统计图配置
    isChoropleths: true,
    levels: 21, // 21个分级
    // 分级颜色：从红色到灰色到绿色的21级颜色渐变
    choroplethColors: [
      '#b84842', // 0 深红
      '#be5549', // 1
      '#c36250', // 2
      '#c86f57', // 3
      '#cd7c5e', // 4
      '#d28965', // 5
      '#d7966c', // 6
      '#dca373', // 7
      '#e1b07a', // 8
      '#e5bd81', // 9
      '#c9c9c9', // 10 灰色（中间）
      '#c1c5bd', // 11
      '#b9c1b1', // 12
      '#b1bda5', // 13
      '#a9b999', // 14
      '#a1b58d', // 15
      '#99b181', // 16
      '#91ad75', // 17
      '#89a969', // 18
      '#81a55d', // 19
      '#5a8c6b'  // 20 深绿
    ]
  },
  perCapitaGdp: {
    label: '人均国内生产总值 (人均GDP,现价美元)',
    unit: 'USD',
    colors: {
      low: '#9B5555',
      mid: '#c9c9c9',
      high: '#5A8C6B'
    },
    valueFormatter: (val, year) => val ? `$${val.toFixed(0)}/人 (${year})` : '无数据',
    // 分级统计图配置
    isChoropleths: true,
    levels: 21, // 21个分级
    // 分级颜色：同样的红-灰-绿渐变
    choroplethColors: [
      '#b84842', // 0 深红
      '#be5549', // 1
      '#c36250', // 2
      '#c86f57', // 3
      '#cd7c5e', // 4
      '#d28965', // 5
      '#d7966c', // 6
      '#dca373', // 7
      '#e1b07a', // 8
      '#e5bd81', // 9
      '#c9c9c9', // 10 灰色（中间）
      '#c1c5bd', // 11
      '#b9c1b1', // 12
      '#b1bda5', // 13
      '#a9b999', // 14
      '#a1b58d', // 15
      '#99b181', // 16
      '#91ad75', // 17
      '#89a969', // 18
      '#81a55d', // 19
      '#5a8c6b'  // 20 深绿
    ]
  },
  perCapitaGdpPpp: {
    label: '人均国内生产总值 PPP (人均GDP PPP)',
    unit: 'USD PPP',
    colors: {
      low: '#9B5555',
      mid: '#c9c9c9',
      high: '#5A8C6B'
    },
    valueFormatter: (val, year) => val ? `$${val.toFixed(0)}/人 PPP (${year})` : '无数据',
    // 分级统计图配置
    isChoropleths: true,
    levels: 21, // 21个分级
    // 分级颜色：同样的红-灰-绿渐变
    choroplethColors: [
      '#b84842', // 0 深红
      '#be5549', // 1
      '#c36250', // 2
      '#c86f57', // 3
      '#cd7c5e', // 4
      '#d28965', // 5
      '#d7966c', // 6
      '#dca373', // 7
      '#e1b07a', // 8
      '#e5bd81', // 9
      '#c9c9c9', // 10 灰色（中间）
      '#c1c5bd', // 11
      '#b9c1b1', // 12
      '#b1bda5', // 13
      '#a9b999', // 14
      '#a1b58d', // 15
      '#99b181', // 16
      '#91ad75', // 17
      '#89a969', // 18
      '#81a55d', // 19
      '#5a8c6b'  // 20 深绿
    ]
  },
  gini: {
    label: '基尼系数',
    unit: '',
    colors: {
      low: '#5A8C6B', // inequality low = green
      mid: '#c9c9c9',
      high: '#b84842' // inequality high = red
    },
    valueFormatter: (val, year) => val ? `${val.toFixed(1)} (${year})` : '无数据',
    isChoropleths: false,
    levels: 21,
    // 反向色阶：高值红低值绿
    choroplethColors: [
      '#5a8c6b', '#81a55d', '#89a969', '#91ad75', '#99b181', '#a1b58d', '#a9b999',
      '#b1bda5', '#b9c1b1', '#c1c5bd', '#c9c9c9', '#d28965', '#cd7c5e', '#c86f57',
      '#c36250', '#be5549', '#b84842', '#a33634', '#911f26', '#7a0818', '#63000a'
    ]
  }
};
