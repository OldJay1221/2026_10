# 季津纬 · 设计作品集 2026（网页发布版）

内容与 `../季津纬-设计作品集-2026-v3.pdf`（28 页 · A4 横版）一致，
但**不是把 PDF 页直接搬上来**——按「滚动叙事」重新做了 Web 端设计。

- **8.9 MB / 136 个文件**，纯静态：无构建、无外链、无 CDN、无第三方请求
- 图片全部压成 webp（24.5 MB → 8.6 MB，130 张）；Work Sans 子集内联进 CSS（94 KB）
- 桌面 1600px（45 屏）与移动 390px（44 屏）逐屏复核：零 console 报错、零 404、无横向溢出
- **双击 `index.html` 和放到服务器上，观感完全一致**（字体已内联，绕开 Chrome 对 `file://` 字体的 CORS 限制）

---

## 一、怎么本地预览

直接双击 `index.html` 就能看，字体、动效都正常。

想更接近线上环境（缓存、压缩行为），起个本地 server：

```powershell
cd "D:\Come from C\文档\ChatGPT\鹤翼行动\portfolio-web-2026"
python -m http.server 8000
# 打开 http://localhost:8000
```

## 二、怎么发布

整个文件夹拖到任意静态托管即可，入口文件是 `index.html`：

Netlify / Vercel / Cloudflare Pages / GitHub Pages / 阿里云 OSS / 腾讯云 COS / 自建 Nginx

全部相对路径，**放到子目录也不用改任何配置**。不用装 Node、不用打包、不用构建。

> 想直接上传压缩包？用 `../季津纬-设计作品集-2026-网页版.zip`。

## 三、目录结构

```
portfolio-web-2026/
├─ index.html        页面结构，全部章节都在这一个文件里
├─ css/site.css      设计系统：配色变量 / 版式 / 组件 / 响应式（字体已内联在文件头）
├─ js/site.js        全部动效，13 个模块，零依赖原生 JS
├─ fonts/            Work Sans 子集源文件（3 个 woff2，94 KB）
│                    ⚠ 仅作重建用的源，页面不请求它——字体已 base64 内联进 site.css
├─ assets/
│  ├─ lupai/  59 张   01 万有引力π
│  ├─ rp/     27 张   02 喵汪咩嘶
│  └─ hyd/    44 张   03 鹤翼行动（brand / ip / poster / scene / ui / award）
└─ README.md
```

## 四、章节顺序与动效

设计延续作品集的**黑底 + 万有引力紫**，每个章节有自己的强调色
（01 `#9A00EE` 紫 / 02 `#BF1A20` 红 / 03 `#0048BF` 蓝），整站配色随章节切换。

| # | 章节 | 关键动效 |
| --- | --- | --- |
| — | Hero | 开场遮罩 + 0→100 计数、团块表情跟随鼠标、滚动视差、细白环自转 |
| — | 目录 | 悬停跟随的预览图、行 hover 位移 |
| 01 | 万有引力π | 色卡（点击复制色值）、**16 组表情横向钉住滚动** + 平面 / 立体切换、图案横向滚动、11 个应用样机网格 |
| 02 | 喵汪咩嘶 | 「声音」翻牌卡、四款红包实拍、角色 / 海报 / 应用网格 |
| 03 | 鹤翼行动 | 数据滚动计数与条形图、品牌标志正 / 负形对照、鹤叔 IP、**13 屏界面横向钉住滚动**、证书网格 |
| 04 | 联系 | 收尾巨字 + 团块收束 |

全站通用：顶部进度条 + 右侧章节导航（随章节变色）、自定义光标
（`mix-blend-mode:difference`，悬停放大并显示文字）、页眉下滑隐藏 / 上滑出现、
图片懒加载、`prefers-reduced-motion` 全量降级、`@media print` 打印友好。

## 五、改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 文案、图片路径、章节顺序 | `index.html` |
| 配色、间距、字号、断点 | `css/site.css` 顶部的 `:root` 变量（在内联字体之后） |
| 横向滚动带里的图片清单 | `js/site.js` 的 galleries 段（`#exprTrack` / `#patTrack` / `#uiTrack` / `#apps` / `#certs`） |
| 动效时长与缓动 | `css/site.css` 的 `--e` + 各模块的 `transition` |

改完刷新页面即可，没有编译步骤。

## 六、换图 / 重新生成产物

原始图在 `../portfolio-2026-v3/assets/`，本项目里是压缩后的 webp：

```powershell
# 1. 重新压缩图片（长边 ≤1800，webp q82）
node ../.codex-work/web_optimize.cjs
# 2. 重建 Work Sans 子集（拉丁 / 希腊 / 符号区，不切中文）
python ../.codex-work/web_fonts.py
# 3. 把新子集重新内联进 css/site.css（改了第 2 步就必须跑一次）
python ../.codex-work/inline_fonts.py
# 4. 回归截图（桌面 1600px + 移动 390px，逐屏落到 .codex-work/web_qa2）
node ../.codex-work/web_qa2.cjs
```

注意：`assets/hyd/` 下保留了原子目录，新增鹤翼行动的图必须写全
`assets/hyd/<子目录>/xxx.webp`（例如 `assets/hyd/ui/ui-home.webp`）。

## 七、已知取舍

- **中文不内嵌字体**，走系统字体栈（Microsoft YaHei / PingFang SC / Noto Sans SC），
  否则光中文字体就要 5 MB+；拉丁与数字用内联的 Work Sans。
- **横向钉住滚动段在 ≤1000px 降级**为手指横滑（移动端不做钉住，避免手势冲突）。
- **品牌标志页用正 / 负形对照**：`logo-*-navy.webp` 配浅底、白色版配品牌蓝底。
- 目前只有中文版，没有英文版。
- `fonts/` 里的 woff2 是源文件（页面不请求），删掉不影响运行，但重建时会再生成。


## 八、修订记录

**2026-10-07 · 去掉「关于我」一节**

- 按需求删除了 00 关于我整节，以及右侧章节导航里的对应项。
- 现在的顺序：Hero → 项目速览 → 目录 → 01 万有引力π → 02 喵汪咩嘶 → 03 鹤翼行动 → 04 联系方式。
- 右侧导航剩下 01 / 02 / 03 / 04；首屏（Hero 与目录）使用 01 的强调色，不再有独立的橙色章节。
- 联系信息仍在尾页（04）保留，没有丢。

**2026-10-07 · 修掉「图片被卡片裁掉下半」的问题**

- 根因：`.lg` / `.plate-card` 是 `display:grid` + `auto` 行，图片的 `height:100%` / `max-height:100%`
  形成循环依赖被浏览器忽略，图片就按原始比例放大，多出来的部分被 `overflow:hidden` 裁掉。
- 修法：给这两类卡片显式的网格轨道 `grid-template-rows:minmax(0,1fr)`，
  图片统一 `width/height:100%` + `object-fit:contain`，完整显示、永不裁切。
- 受影响并已修好：万有引力π「图形标志 / 中文名称 / 英文名称」、三张项目扉页图
  （LUPAI 平面形象、喵汪咩嘶红包海报、鹤叔形象）。
- 「标志与色彩」这一排改成 **4:3**，并把 `pat-45.webp`（图形标志）内部的空白裁掉、
  等比放大回同一画布，标志可视面积约 **+30%**。

> ⚠️ 注意：`pat-45.webp` 是单独处理过的。如果重跑 `web_optimize.cjs` 会把它覆盖回去，
> 需要再补跑一次 `python ../.codex-work/trim_mark.py`。

全站自检脚本（会把所有纵向被裁的图片列出来）：
`node ../.codex-work/web_clip.cjs` —— 目前只剩移动端横向滚动轨道的**有意**横向溢出。
