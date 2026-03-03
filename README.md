# 🗺️ 维多利亚3风格的经济分级统计地图 (Victoria 3 style economic classification statistical map)

基于 React 和 D3.js 构建的全屏交互式地球地图组件。使用 **echarts-countries-js** 地理数据渲染国家边界，支持全面的交互功能和 Victoria 3 复古游戏风格。

## ✨ 功能特性

- 🌍 **完整的全球地图** - 使用 Mercator 投影，基于 echarts-countries-js 的高精度地理数据，覆盖全球所有国家和地区
- 🖱️ **交互式控制** - 拖拽平移、滚轮缩放、单击放大国家
- 🎨 **Victor 3 复古风格** - 古董地图美学、羊皮纸色调、深棕色边界
- 📱 **响应式设计** - 自适应各种屏幕尺寸
- ♿ **可访问性** - 支持深色模式和高对比度
- 🚀 **高性能渲染** - 使用 D3.js 优化的地理数据可视化，2,518 个地理特征

## 📋 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 进入项目目录
cd "/Users/Omicron0314/Programme/v3 map"

# 安装所有依赖
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可看到交互式地图。

### 生产环境构建

```bash
npm run build
```

构建输出文件将在 `dist/` 目录中。

## 📊 地理数据说明

本项目使用 **echarts-countries-js** 库作为地理数据源，提供了全球 209 个国家/地区的高精度边界数据。

### 数据合并流程

地理数据已通过以下脚本预合并：

```bash
python3 scripts/merge_echarts_countries.py
```

此脚本：
- 从 `echarts-countries-js/` 目录读取所有国家数据
- 提取 GeoJSON FeatureCollection
- 为每个特征添加国家标识
- 生成统一的 `public/world-map.json` 文件

**合并结果统计：**
- ✓ 已处理国家文件：209 个
- ✓ 总地理特征数：2,518 个
- ✓ 输出文件大小：4.2 MB

## 🎮 使用说明

### 基本交互

| 操作 | 功能 |
|------|------|
| 🖱️ **拖拽** | 平移地图视图 |
| 🔍 **滚轮** | 缩放地图（放大/缩小） |
| 🖐️ **悬停** | 高亮国家，显示国家名称 |
| 🖱️ **单击** | 放大选中的国家 |
| 🔄 **重置按钮** | 返回全局视图 |

### 接口示例

```jsx
import InteractiveMap from './components/InteractiveMap';

function App() {
  return (
    <InteractiveMap geoJsonPath="/countries.geo.json" />
  );
}
```

## 📁 项目结构

```
v3 map/
├── src/
│   ├── components/
│   │   └── InteractiveMap.jsx          # 主地图组件
│   ├── styles/
│   │   └── InteractiveMap.css          # 地图样式
│   ├── App.jsx                         # 主应用组件
│   ├── App.css                         # 应用样式
│   ├── index.css                       # 全局样式
│   └── main.jsx                        # 应用入口
├── public/
│   └── countries.geo.json              # 地理数据文件
├── package.json                        # 项目配置
├── vite.config.js                      # Vite 配置
└── index.html                          # HTML 模板
```

## 🔧 技术栈

- **React** - UI 框架
- **Vite** - 现代化构建工具
- **D3.js** - 数据可视化库
- **GeoJSON** - 地理数据格式

## 📊 GeoJSON 数据格式

项目使用标准 GeoJSON FeatureCollection 格式，包含各国的地理边界信息：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "CHN",
      "properties": {
        "name": "China"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```

## 🎨 样式自定义

编辑 [src/styles/InteractiveMap.css](src/styles/InteractiveMap.css) 可以自定义样式：

```css
/* 修改国家颜色 */
.country {
  fill: #e8f4f8;
  stroke: #ccc;
}

/* 修改悬停效果 */
.country:hover {
  filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.6));
}
```

## 🚀 优化建议

### 性能优化

1. **数据简化** - 对大型 GeoJSON 文件使用 TopoJSON 格式降低文件大小
2. **虚拟化** - 如果国家数量过多，考虑使用虚拟化技术
3. **缓存** - 启用浏览器缓存中间件

### 功能扩展

1. **多图层支持** - 添加热力图、流向图等
2. **数据绑定** - 绑定其他数据维度（人口、GDP 等）
3. **搜索功能** - 搜索并定位特定国家
4. **导出功能** - 将地图导出为 PNG/SVG

## 📝 常见问题

### Q: 地图数据来自哪里？
A: 使用标准的 GeoJSON 格式的世界地图数据，可从 [Natural Earth](https://www.naturalearthdata.com/) 或 GitHub 获取。

### Q: 如何添加自定义数据图层？
A: 在 InteractiveMap 组件中添加新的 d3 元素：

```javascript
g.selectAll('circle')
  .data(customData)
  .enter()
  .append('circle')
  .attr('cx', d => projection([d.lng, d.lat])[0])
  .attr('cy', d => projection([d.lng, d.lat])[1])
  .attr('r', 5)
  .attr('fill', 'red');
```

### Q: 如何在移动设备上优化？
A: 示例中已包含响应式 CSS，考虑添加触摸事件处理。

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 🔗 相关资源

- [D3.js 官方文档](https://d3js.org/)
- [React 官方文档](https://react.dev/)
- [GeoJSON 规范](https://geojson.org/)
- [Natural Earth 数据](https://www.naturalearthdata.com/)

---

**最后更新**: 2026年3月3日

