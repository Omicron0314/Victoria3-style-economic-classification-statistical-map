# 🗺️ 维多利亚3风格的经济分级统计地图
Victoria 3 style economic classification statistical map

该项目是一个使用 **React 19** 和 **D3 v7** 构建的全屏交互式地球可视化应用。地图采用
**Mercator 投影**并加载高精度 GeoJSON 边界（由 echarts-countries-js 数据合并而成），
呈现经典《维多利亚 3》复古游戏感与羊皮纸配色。

用户可在右下角切换多维经济指标：GDP、各类人均GDP（现价/PPP）以及基尼系数。
图例自动更新色阶、最大/最小范围，以及是否采用分级统计模式。
## ✨ 主要特性

- **全球覆盖**：加载 2 518 个地理特征，支持 209 个国家/地区。
- **多指标选择**：GDP、GDP per capita、GDP per capita (PPP)、基尼系数，基于最新可用年度数据。
- **交互操作**：拖拽平移、滚轮缩放、单击选中、提示显示、重置视图。
- **复古美学**：Victoria 3 羊皮纸 + 深棕边界 + 红灰绿色阶；支持深色/黑夜模式。
- **响应式 & 无障碍**：适配移动端；颜色对比优化，暗色样式自动启用。
- **高性能**：D3 数据绑定与缩放；避免重复渲染。

## � 快速上手

环境需求：Node ≥16、npm ≥8。

```bash
cd "/Users/Omicron0314/Programme/v3 map"
npm install
npm run dev      # 启动开发服务器
# 访问 http://localhost:5173
```

生产构建：

```bash
npm run build     # 输出到 dist/
```

## 📊 地理数据

地图边界来自https://github.com/johan/world.geo.json

无需手动运行即可使用。若更换数据源，只需更新该脚本并重新构建。

## 🎮 使用说明

- **拖拽**：平移视图
- **滚轮**：缩放
- **悬停**：显示国家提示
- **单击**：选择并高亮
- **重置**：恢复全图

组件可作为独立模块引入：

```jsx
import InteractiveMap from './components/InteractiveMap';

export default function App() {
  return <InteractiveMap geoJsonPath="/countries.geo.json" />;
}
```

## 📁 项目结构

```
/ (根目录)
├─ src/
│   ├─ components/   — React 组件
│   │   └─ InteractiveMap.jsx
│   ├─ hooks/        — 数据加载钩子
│   ├─ utils/        — CSV 解析、地图渲染、色阶
│   ├─ constants/    — 配置与名称映射
│   └─ styles/       — CSS 文件
├─ public/           — 静态资源（GeoJSON, CSV）
├─ scripts/          — 数据处理脚本
├─ package.json
├─ vite.config.js
└─ index.html
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

---

**最后更新**: 2026年3月3日

