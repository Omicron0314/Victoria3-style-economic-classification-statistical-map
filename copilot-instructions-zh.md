# V3 Map - Copilot 指南

## 项目概述

基于 React 19、D3.js 7 和 Vite 构建的交互式世界地图可视化项目。使用墨卡托投影（Mercator projection）结合《维多利亚3》美学（复古地图风格）来映射经济数据（GDP、人均 GDP）。

## 架构与模块组织

### 模块化结构（深度重构）

为了提高可扩展性和可维护性，代码库已进行了拆分：

* `src/constants/` - 配置与常量
* `dataTypes.js` - 数据类型定义（GDP、人均 GDP）及配色方案
* `countryNameMappings.js` - CSV 到 GeoJSON 的国家名称映射（包含两个独立的导出：`gdpCountryNameMapping`, `perCapitaCountryNameMapping`）
* `styles.js` - 视觉样式、配色方案、复古地图样式


* `src/utils/` - 纯工具函数（无 React 依赖）
* `csvParser.js` - CSV 解析（`parseGDPData()`, `parsePerCapitaGDPData()`）
* `colorScale.js` - D3 颜色比例尺和数据范围计算
* `mapRenderer.js` - D3 地图渲染与交互（初始化、渲染、重置）


* `src/hooks/` - 自定义 React Hooks
* `useMapData.js` - 数据加载与状态管理（加载 GeoJSON、GDP、人均数据）


* `src/components/` - React 组件
* `InteractiveMap.jsx` - 主编排器组件
* `MapTooltip.jsx` - 悬浮提示框显示
* `MapControls.jsx` - 重置按钮与缩放信息
* `GDPLegend.jsx` - 图例、颜色比例尺、数据选择器



### 数据流

```text
useMapData (hook)
  ↓ (GeoJSON + CSV 数据)
InteractiveMap (主组件)
  ├→ initializeMap() + renderCountries() (utils/mapRenderer.js)
  ├→ createColorScale() (utils/colorScale.js)
  └→ 子组件: MapTooltip, MapControls, GDPLegend

```

## 添加新数据类型

1. 在 `constants/dataTypes.js` 中定义：
```javascript
export const dataTypes = {
  myDataType: {
    label: '显示名称',
    unit: '单位字符串',
    colors: { low: '#color', mid: '#color', high: '#color' },
    valueFormatter: (val, year) => `格式化后的 ${val}`,
    isChoropleths: true, // 是否为分级统计图
    levels: 21,
    choroplethColors: [...] // 21级渐变色
  }
};

```


2. 在 `utils/csvParser.js` 中添加 CSV 解析器：
```javascript
export function parseMyData(csvText) {
  // 返回 { data: { countryName: { value, year } } }
}

```


3. 如果需要，添加名称映射：
* 更新 `src/constants/countryNameMappings.js` 中的国家名称映射。


4. 更新 `useMapData` hook：
* 调用新的解析函数
* 将结果存储在 `allData` 状态中


5. 在下拉菜单中选择：
* 通过 `dataTypes` 条目自动可用



## 样式与主题

* **复古地图配色**：[constants/styles.js](https://www.google.com/search?q=src/constants/styles.js) - 奶油色 (#d4c5a0)，深棕色 (#3d2817)
* **数据可视化**：从红色（低）→ 灰色（中）→ 绿色（高）的颜色渐变
* **分级统计图配色（Choropleth Colors）**：21 级分位数比例尺（离散分类）

## D3.js 模式

* **投影**：墨卡托（Mercator），自动适配特征边界
* **交互**：通过 `d3.zoom()` 进行缩放/平移，悬浮高亮，点击选中
* **数据绑定**：通过国家名称作为键值绑定特征（Features），以实现高效更新
* **性能**：将国家/地区的渲染与经纬网（graticule，即网格线）的渲染分开

## CSV 数据格式

两个 CSV 数据源（位于 public 文件夹）：

* `imf-dm-export-20260302.csv` - GDP 数据（第一行为表头，数据从第二行开始）
* `GDP per capita.csv` - 人均 GDP（包含“Country Name”的行作为表头）

两个解析器的逻辑：

1. 搜索 2025→2015 年的数据（倒序查找，使用第一个可用数据）
2. 应用国家名称映射（处理 CSV 和 GeoJSON 之间名称的差异）
3. 过滤掉无效/缺失的值
4. 返回 `{ countryName: { value, year } }` 结构

## 开发工作流

```bash
npm install          # 安装依赖
npm run dev          # 启动 Vite 开发服务器 (http://localhost:5173)
npm run build        # 构建生产版本 → dist/
npm run lint         # 运行 ESLint 检查

```

## React 与状态管理

* **Hooks**：使用 `useState` 管理 UI 状态（提示框、缩放、选择、当前选中的数据类型）
* **数据获取**：在 `useMapData` hook 中结合使用 `useEffect` + `useRef` 加载 GeoJSON/CSV
* **组件 Props**：自动接收 `dataTypes` 配置，向父组件触发回调
* **重新渲染触发器**：
* 获取到 `geoData` → 初始化地图 + 渲染国家
* `selectedDataType` 改变 → 仅重新渲染国家（更新颜色）
* `allData` 更新 → 重新计算颜色比例尺



## SVG/D3 集成

* **DOM 引用**：`svgRef.current` + `mapInfoRef.current`（存储地图上下文）
* **事件处理**：直接附加到 D3 路径（paths）上，触发 React 状态更新
* **清理机制**：`useEffect` 返回清理函数以移除事件监听器

## 命名约定

* **国家名称**：匹配 GeoJSON 中的 `properties.name` 值
* **数据键值**：`gdp`, `perCapitaGdp`（驼峰命名法）
* **D3 选择器**：以 `d3.select()` 为前缀，或链式调用 `.select().selectAll()`
* **CSS 类名**：`country`, `ocean`, `graticule`（用于 D3 选择器）

## 关键设计决策

1. **关注点分离**：Utils 工具函数无 React 依赖，易于测试和复用。
2. **颜色比例尺**：同时支持连续模式和离散模式（分级统计图）。
3. **数据缓存**：使用 `useRef` 存储 GeoData 以防止重新获取。
4. **错误处理**：CSV 解析器验证数据格式，并在控制台记录错误。
5. **无障碍性（Accessibility）**：提示框使用大写的国家名称，采用对 aria 友好的结构。

## 常见任务

### 更新 GDP 颜色渐变

在 [src/constants/dataTypes.js](https://www.google.com/search?q=src/constants/dataTypes.js) 中编辑 `dataTypes.gdp.choroplethColors`。

### 添加国家名称映射

在 [src/constants/countryNameMappings.js](https://www.google.com/search?q=src/constants/countryNameMappings.js) 中同时更新 `gdpCountryNameMapping` 和 `perCapitaCountryNameMapping`。

### 更改交互行为

在 [src/components/InteractiveMap.jsx](https://www.google.com/search?q=src/components/InteractiveMap.jsx) 的第二个 `useEffect` 中的 `renderCountries()` 调用里修改回调函数。

### 添加 D3 视觉元素

在地图初始化之后使用 `mapInfoRef.current.g.append()` 模式（可以参考现有的经纬网渲染代码）。

## 性能说明

* **特征数量**：2,518 个 GeoJSON 特征（所有国家和地区）
* **D3 渲染**：在现代计算机上初始渲染大约耗时 60 毫秒
* **重新渲染**：通过数据绑定的 key 函数（按国家名称）进行了优化
* **内存占用**：GeoData 存储在 `useRef` 中以避免重复抓取