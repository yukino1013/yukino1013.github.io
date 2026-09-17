# 王铂为 · 产品作品集

一个纯静态站点：手写 HTML / CSS / 原生 JavaScript，**无框架、无构建步骤、无外部依赖**。
双击 `index.html` 就能看，也可以直接丢到任意静态托管（GitHub Pages / Vercel / Netlify / 对象存储）。

---

## 目录结构

```
portfolio_site/
├─ index.html                      首页：Hero + 4 个项目卡 + 能力矩阵 + 关于 + 联系
├─ projects/
│  ├─ vod-app-config.html          VOD 应用配置（需求说明书 + 可交互原型 + 原型设计稿）
│  ├─ bilibili-slate.html          B站「稍后再看」功能优化（数据驱动，顶部有飞书原文链接）
│  ├─ anime-calendar.html          AnimeDate 新番日历（独立开发 App）
│  └─ acfun-vs-bilibili.html       AcFun 与 Bilibili 竞品分析（顶部有飞书原文链接）
└─ assets/
   ├─ css/style.css                站点样式
   ├─ css/vod-demo.css             VOD 可交互原型样式（作用域 .vod，与站点主题隔离）
   ├─ js/site.js                   导航 / 目录高亮 / 图片缺失占位
   ├─ js/vod-demo.js               VOD 可交互原型逻辑（按需求说明书逐条还原）
   └─ img/
      ├─ avatar.webp               头像（导航栏和名片共用）
      ├─ anime/                    AnimeDate 的 3 张实机截图
      ├─ bilibili/                 稍后再看项目的 SQL 与原型图（10 张）
      ├─ mocto/                    VOD 墨刀原型截图（5 张）
      └─ ...
```

## 几处刻意的设计

**卡片整块可点。** 首页四张项目卡各自带一个铺满整卡的 `<a class="card-link">`（在 `style.css` 里），
所以点卡片任意位置都能进详情页，点「看详情」也一样。链接用绝对定位铺满，卡里的文字仍然可以正常选中复制。

**飞书原文放在详情页最前面。** 稍后再看优化和竞品分析这两个项目，
正文是我从这个站点重排的，原始版本在飞书文档里。详情页顶部有一个显眼的文档入口，
面试官想看我原始交付物的话可以直接跳过去，不用往下翻。

---

## 本地预览

直接双击 `index.html` 即可（所有路径都是相对的，`file://` 下可用）。

想用本地服务器（推荐，行为与线上一致）：

```powershell
cd "D:\edge下载\portfolio_site"
python -m http.server 8901
# 浏览器打开 http://127.0.0.1:8901/
```

---

## 部署

**任意静态托管都行**，因为没有任何后端依赖：

| 平台 | 做法 |
|---|---|
| GitHub Pages | 把 `portfolio_site/` 内容推到仓库根目录（或 `docs/`），Settings → Pages 选分支 |
| Vercel / Netlify | 拖拽整个 `portfolio_site` 文件夹到部署面板，无需配置构建命令 |
| 对象存储（OSS/COS） | 上传整个目录，开启静态网站托管，首页设为 `index.html` |

---

## 需要你维护的内容

### 1. 联系信息位置

| 文件 | 位置 |
|---|---|
| `index.html` | 顶部 Hero 的「📧 1483216530@qq.com」按钮 |
| `index.html` | `#contact` 区块的三张卡片（邮箱 / 电话 / 微信） |
| `index.html` | `<title>` 与 `<meta name="description">` |

修改时注意三处都改，别只改一处。

### 2. VOD 可交互原型的行为速查

原型在 `assets/js/vod-demo.js`，所有规则都带需求说明书章节号注释：

- 数据在文件顶部的 `CATALOG`（应用目录，16 个应用）与 `PREINSTALLED`（出厂预置 4 个）。
- 想改磁盘容量：`TOTAL`（总容量）与 `PRE_USED`（预置已占用），单位 MB。
- 想改下载速度：`startDownload` 里的 `100 / 28`（28 个 tick × 100ms ≈ 2.8 秒）。
- 想改「永远有新版本」的应用：`checkUpdate` 里的 `app.id === 'a10'`。
- 演示直链：`vod-app-config.html?demo=market` / `?demo=manage` / `?demo=disk`
- **测试钩子**：页面暴露了 `window.__vod`，可以在浏览器控制台调 `__vod.state`、`__vod.reset()` 等做演示。

### 3. 想换/加图片

图片全部是 **WebP**。PNG/JPG 转 WebP：

```powershell
python -c "from PIL import Image; im=Image.open('输入.png').convert('RGB'); im.save('输出.webp','WEBP',quality=88,method=6)"
```

- 卡片缩略图走 `assets/css/style.css` 里的 `.card .thumb`（16:9 裁切）；
  竖向手机截图用 `.card .thumb.phone`。
- 页面里的图片若文件不存在，`assets/js/site.js` 会自动替换成「素材待补充」占位卡，不会出现裂图。

---

## 关于素材来源（留档，便于日后追溯）

| 项目 | 素材来源 | 处理方式 |
|---|---|---|
| VOD 应用配置 | 《VOD 新增应用配置-需求说明书 V1.0》.docx | 正文结构化重排，未改动技术内容 |
| VOD 原型 | 墨刀设计文件 + 离线演示包 | 用无头 Chrome 截取演示包真实渲染的画板（PDF 导出会复用同一底图，看不出弹窗状态） |
| 稍后再看优化 | 飞书文档（wiki/Hr5uw0Synig…） | 从页面 SSR 数据里解析出文档 block 树重建为 HTML；10 张图由本人导出 |
| 竞品分析 | 飞书文档（wiki/D6tuwTtzIiV…） | 同上，无图 |
| 新番日历 | `D:\anime-calendar` 项目源码与 `evidence/` 实测截图 | 截图直接用，未做美化 |

---

## 已知取舍

1. **VOD 可交互原型是"按需求说明书还原"的实现，不是产品正式客户端。**
   存储容量、下载耗时、服务器返回均为模拟值，页面上已明确标注。
2. **B站「稍后再看」项目用的是 YouTube 数据代理 B站 用户行为。**
   存在平台差异带来的外推风险，页面 06 节已诚实说明。
3. **墨刀 PDF 导出不可靠**（多页相同、弹窗不体现），因此原型图统一改用离线演示包截图。
   PDF 原件留在 `D:\edge下载\portfolio_src\mocto_pdf_png\`。

---

## 目录之外的相关文件

构建与验证脚本在 `D:\edge下载\portfolio_src\`（不随站点发布）：

| 文件 | 用途 |
|---|---|
| `test_vod.js` | 用 Chrome DevTools Protocol **真实驱动**页面，逐条验证需求说明书的交互规则（38 项断言） |
| `check_links.py` | 检查全站本地引用是否有死链 |
| `extract2.js` / `render2.js` | 从飞书文档页面解析 `window.DATA` 的 block 树，重建为 Markdown |
| `assets.py` / `assets2.py` | 图片压缩与 WebP 转换管线 |
| `capture*.js` | 墨刀离线演示包的自动截图（CDP） |
| `imgstat.py` / `preview.py` | 图片内容与尺寸体检、ASCII 预览（用于无 GUI 环境核对截图） |

跑一遍完整验证：

```powershell
cd "D:\edge下载\portfolio_src"
python check_links.py     # 期望：missing: 0
node test_vod.js          # 期望：38/38 通过（需先启动 8901 端口的本地服务器）
```
