# 📚 echarts-countries-js 集成指南

本项目已成功迁移到使用 **echarts-countries-js** 作为地理数据源。

## 🔄 集成过程概览

### 1. 数据合并
使用 Python 脚本将 echarts-countries-js 库中的 209 个国家数据文件合并为单一的 GeoJSON 文件。

```bash
python3 scripts/merge_echarts_countries.py
```

**输出文件:** `public/world-map.json` (4.2 MB, 2,518 个地理特征)

### 2. 数据结构
合并后的数据包含：
- **type:** FeatureCollection
- **features:** 数组，包含所有地区特征
  - 每个特征都有 `properties.country` 标识所属国家
  - 支持多边形和多重多边形几何类型

格式示例：
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Polygon", "coordinates": [...] },
      "properties": {
        "country": "Afghanistan",
        "name": "Badakhshan"
      }
    }
  ]
}
```

### 3. 组件变更

**InteractiveMap.jsx** 已更新为：
- 直接加载 `/world-map.json`（不需要 prop 传递）
- 按国家分组并分配颜色
- 保持所有 Victoria 3 视觉样式
- 国家级别的交互和高亮

**App.jsx** 已简化：
```jsx
// 之前
<InteractiveMap geoJsonPath="/countries.geo.json" />

// 现在
<InteractiveMap />
```

## 📊 数据统计

| 项目 | 数值 |
|-----|------|
| 处理的国家文件 | 209 |
| 总地理特征 | 2,518 |
| 输出文件大小 | 4.2 MB |
| 投影方式 | Mercator |
| 颜色族系 | Victoria 3 羊皮纸色 |

## 🎨 视觉特性（已保留）

- ✓ 古董地图美学
- ✓ 羊皮纸色调（#d4c5a0 等）
- ✓ 深棕色边界（#5c4033）
- ✓ Times New Roman serif 字体
- ✓ 交互高亮和选中效果

## 🚀 相关文件

```
project/
├── scripts/
│   ├── merge-echarts-countries.js    (Node.js 版本)
│   └── merge_echarts_countries.py    (Python 版本，已使用)
├── public/
│   └── world-map.json                (合并后的数据，自动生成)
├── src/
│   ├── components/
│   │   └── InteractiveMap.jsx        (已更新)
│   └── App.jsx                       (已更新)
└── echarts-countries-js/             (原始数据源，209 个国家文件)
```

## ⚙️ 重新生成数据

如果需要重新合并数据（例如更新 echarts-countries-js）：

```bash
# 确保 echarts-countries-js 目录存在
python3 scripts/merge_echarts_countries.py

# 输出将覆盖 public/world-map.json
```

## 📝 注意事项

1. **文件大小：** world-map.json 大小为 4.2 MB，首次加载时需要几秒钟
2. **浏览器性能：** 包含 2,518 个地理特征的 SVG 需要现代浏览器
3. **国家粒度：** 数据显示省/区域级别的边界，但交互以国家为单位
4. **更新频率：** echarts-countries-js 基于稳定的地理数据，更新不频繁

## 🐛 故障排除

**问题：** "world-map.json not found"
```
解决方案：运行 python3 scripts/merge_echarts_countries.py
```

**问题：** 地图加载缓慢
```
解决方案：这是正常的，因为数据文件较大。可以在浏览器开发者工具的 Network 标签中查看进度。
```

**问题：** 某些国家无法交互
```
解决方案：检查该国家数据是否在 echarts-countries-js 中存在。
某些小国家或地区可能不在库中。
```

## 📚 相关资源

- [echarts-countries-js GitHub](https://github.com/echarts-gl/echarts-countries-js)
- [D3.js 地理投影文档](https://d3js.org/d3-geo)
- [GeoJSON 标准](https://geojson.org/)

---

**更新日期：** 2024-03-03
**状态：** ✓ 已完全集成并测试
