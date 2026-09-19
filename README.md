# 王铂为 · 产品作品集

一个纯静态站点：手写 HTML / CSS / 原生 JavaScript，**无框架、无构建步骤、无外部依赖**。
双击 `index.html` 就能看，也可以直接丢到任意静态托管（GitHub Pages / Vercel / Netlify / 对象存储）。

---

## 改版记录

### 2026-09-18

- 求职方向由「AI 产品经理」改为「**产品经理 / AI 产品经理**」，共 3 处（Hero 徽章、Hero 介绍文案、名片）。
- 排版实测（`check_hero_layout.js`，1280px 与 390px 两档）：无横向溢出；介绍文案行数不变（桌面 3 行 / 手机 6 行）；
  名片里该行在桌面宽度由 1 行变 2 行、名片整体高 +27px，手机宽度无变化。

### 2026-09-17（提交 `cfde68b`，已发布）

按用户反馈调整的 9 项，全部已上线：

1. 首页 Hero 介绍文案换成用户指定版本（「我来自重庆邮电大学，求职方向是 AI 产品经理…」）。
2. 删掉「每个项目我都尽量写清楚三件事」整段。
3. 首页卡片改为**任意位置可点**（`.card-link` 绝对定位铺满 + `.card-doc` 层级更高）。
4. 删掉「四个项目」标题下的小字。
5. 删掉「我在项目里实际做过的事」下的小字，标题同时改为**「专业能力」**。
6. 删掉「联系方式」下的小字。
7. 删掉全部「下一步」类内容（VOD 页、稍后再看页、竞品页、AnimeDate 页各一处）。
8. 全站文案书面化（「踩过的坑」→「遇到的问题」、「做成了什么」→「项目成果」等）。
9. 首页两张卡片底部补上「飞书原始文档 ↗」入口——此前飞书链接只在详情页顶部，用户在首页找不到。

**验收结果**：本地 `validate.py` / `check_links.py` / `verify_local_dryrun.py` 全绿；
`test_vod.js` 38/38、`test_cardclick2.js` 18/20（另 2 项为飞书按钮正确拦截）、`test_carddoc.js` 两项均 ✓；
线上 `verify_live2.py` 通过 10 / 失败 0。

---

## 目录结构

```
portfolio_site/
├─ index.html                      首页：Hero + 4 个项目卡 + 专业能力 + 关于 + 联系
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

**卡片整块可点。** 首页四张项目卡各自带一个铺满整卡的 `<a class="card-link">`（`position: absolute; inset: 0; z-index: 2`），
所以点卡片任意位置都能进详情页，点「看详情」也一样。链接用绝对定位铺满，卡里的文字仍然可以正常选中复制。

**飞书原文入口一共 4 处。** 稍后再看优化和竞品分析这两个项目，正文是重排过的，
原始版本在飞书文档里。入口分布：

| 位置 | 形式 |
|---|---|
| 首页「稍后再看优化」卡片底部 | `.card-doc` 胶囊按钮「飞书原始文档 ↗」 |
| 首页「竞品分析」卡片底部 | 同上 |
| `projects/bilibili-slate.html` 页面顶部 | `.doclink` 横幅 |
| `projects/acfun-vs-bilibili.html` 页面顶部 | `.doclink` 横幅 |

> ⚠️ 首页卡片里的飞书按钮依赖层级：`.card-doc` 是 `z-index: 3`，必须**高于**铺满整卡的 `.card-link`（`z-index: 2`）。
> 两者对调会让飞书按钮被整卡链接吃掉、点不到。`verify_live2.py` 里有一项断言专门盯这个层级。

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

> 国内访问 GitHub Pages 实测要 4–25 秒，给 HR 看是真实风险。
> 国内托管的完整步骤（含备案要求与踩坑）见 `D:\edge下载\portfolio_src\国内托管上线步骤.md`。

---

## 需要你维护的内容

### 1. 联系信息位置

| 文件 | 位置 |
|---|---|
| `index.html` | 顶部 Hero 的邮箱按钮（`btn btn-ghost`） |
| `index.html` | `#contact` 区块的邮箱 chip（**当前只保留邮箱**，电话与微信按用户要求已删除，理由是避免爬虫抓取） |
| `index.html` | `<title>` 与 `<meta name="description">` |

修改时注意三处都改，别只改一处。

### 2. 求职方向出现的位置

「产品经理 / AI 产品经理」这句话在 `index.html` 里出现 **3 处**，改的时候要一起改：

| 位置 | 当前文案 |
|---|---|
| Hero 徽章（`.eyebrow`） | `产品经理 / AI 产品经理 · 校招` |
| Hero 介绍文案（`.lead`） | 我来自重庆邮电大学，求职方向是产品经理 / AI 产品经理。 |
| 名片区（`.idcard` 的 `.small`） | 重庆邮电大学 · 求职方向：产品经理 / AI 产品经理 |

⚠️ 改动后请跑一次排版检查，确认没有撑破布局：

```powershell
cd "D:\edge下载\portfolio_src"
node check_hero_layout.js     # 期望：排版无溢出、无异常换行
```

### 3. VOD 可交互原型的行为速查

原型在 `assets/js/vod-demo.js`，所有规则都带需求说明书章节号注释：

- 数据在文件顶部的 `CATALOG`（应用目录，16 个应用）与 `PREINSTALLED`（出厂预置 4 个）。
- 想改磁盘容量：`TOTAL`（总容量）与 `PRE_USED`（预置已占用），单位 MB。
- 想改下载速度：`startDownload` 里的 `100 / 28`（28 个 tick × 100ms ≈ 2.8 秒）。
- 想改「永远有新版本」的应用：`checkUpdate` 里的 `app.id === 'a10'`。
- 演示直链：`vod-app-config.html?demo=market` / `?demo=manage` / `?demo=disk`
- **测试钩子**：页面暴露了 `window.__vod`，可以在浏览器控制台调 `__vod.state`、`__vod.reset()` 等做演示。

### 4. 想换/加图片

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

## 已决策事项（2026-09-18 用户确认，均保持现状）

1. **「应用管理一页 12 个位置」= 4 列网格 + 一页容量 12，有几张卡渲染几张。**
   需求说明书原文是「应用管理界面一页由 3 行 4 列，共 12 个应用位置组成」。
   用户确认**不**改成恒定显示 12 个空槽（装了 5 个应用却画 7 个空格子看起来像 bug）。
   ℹ️ 若日后要改成恒定 12 格：改 `assets/js/vod-demo.js` 的 `render()` 里 `v-grid` 的铺法，
   并同步调整 `test_vod.js` 里与当前铺法绑定的两项断言（2.2.1、2.2.2）。

2. **头像保留当前的动漫角色插画**（`assets/img/avatar.webp`，Persona 系列风格，导航栏与名片共用）。
   这是用户明确指定要换的图；已提示求职场景下可能影响专业观感，用户确认保留。
   ℹ️ 若日后要换：直接替换 `assets/img/avatar.webp`，建议正方形、256×256 以上。

---

## 目录之外的相关文件

构建与验证脚本在 `D:\edge下载\portfolio_src\`（不随站点发布）：

| 文件 | 用途 |
|---|---|
| `test_vod.js` | 用 Chrome DevTools Protocol **真实驱动**页面，逐条验证需求说明书的交互规则（38 项断言） |
| `test_cardclick2.js` | 验证首页卡片任意位置可点击（4 卡 × 5 探测点） |
| `test_carddoc.js` | 验证首页飞书按钮新开标签页、且不劫持卡片跳转 |
| `check_hero_layout.js` | 量 Hero 与名片的排版：对比文案改前/改后的行数与宽度，检查是否溢出（1280px / 390px 两档） |
| `check_links.py` | 检查全站本地引用是否有死链 |
| `validate.py` | HTML 标签结构完整性 + 口语化残留扫描（本地） |
| `verify_live2.py` | 推送后线上内容验证（内含 Pages 构建等待 + 全站禁用词扫描 + 卡片层级断言） |
| `verify_local_dryrun.py` | 用 `verify_live2.py` 的同一份断言先跑本地，避免把「站点没发布」和「断言写错」混为一谈 |
| `extract2.js` / `render2.js` | 从飞书文档页面解析 `window.DATA` 的 block 树，重建为 Markdown |
| `assets.py` / `assets2.py` | 图片压缩与 WebP 转换管线 |
| `capture*.js` | 墨刀离线演示包的自动截图（CDP） |
| `imgstat.py` / `preview.py` | 图片内容与尺寸体检、ASCII 预览（用于无 GUI 环境核对截图） |

跑一遍完整验证（需先启动 8901 端口的本地服务器）：

```powershell
Start-Process python -ArgumentList "-m","http.server","8901","--bind","127.0.0.1" `
  -WorkingDirectory "D:\edge下载\portfolio_site" -WindowStyle Hidden

cd "D:\edge下载\portfolio_src"
python validate.py            # 期望：5 页结构完整、无残留
python check_links.py         # 期望：missing: 0
python verify_local_dryrun.py # 期望：通过 10 / 失败 0
node test_vod.js              # 期望：38/38 通过
node test_cardclick2.js       # 期望：18/20（另 2 项为飞书按钮正确拦截）
node test_carddoc.js          # 期望：两项均 ✓

python verify_live2.py        # 线上验证，期望：通过 10 / 失败 0
```

改动 CSS 或推送之后，**`verify_live2.py` 是最后一道关**；它同时检查内容、禁用词与卡片层级。
