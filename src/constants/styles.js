/**
 * 样式和颜色常量
 * 定义地图的视觉样式配置
 */

// 地图样式常量
export const mapStyles = {
  ocean: {
    fill: '#3d5a80',
    pointerEvents: 'none'
  },
  country: {
    defaultFill: '#000000', // 无数据的国家用黑色
    defaultStroke: '#5c4033',
    defaultStrokeWidth: '0.8',
    hoverFill: '#e8d7b8',
    hoverStroke: '#3d2817',
    hoverStrokeWidth: '1.5',
    selectedFill: '#c9c9c9',
    selectedStroke: '#3d2817',
    selectedStrokeWidth: '1.5'
  },
  graticule: {
    fill: 'none',
    stroke: '#5c4033',
    strokeWidth: 0.3,
    opacity: 0.08,
    pointerEvents: 'none'
  }
};

// 古地图色彩方案（Victoria 3 风格）
export const colorSchemes = {
  red: '#b84842',     // 深红
  lightRed: '#e5bd81', // 浅红
  grey: '#c9c9c9',    // 灰色（中间）
  green: '#5a8c6b',   // 深绿
  cream: '#d4c5a0',   // 羊皮纸色
  darkBrown: '#3d2817' // 深棕色
};

// 古地图样式常量
export const antiqueMapStyles = {
  background: 'linear-gradient(135deg, #d4c5a0 0%, #cbb996 100%)',
  border: '2px solid #5c4033',
  textColor: '#3d2817',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  fontFamily: "'Times New Roman', Georgia, serif"
};
