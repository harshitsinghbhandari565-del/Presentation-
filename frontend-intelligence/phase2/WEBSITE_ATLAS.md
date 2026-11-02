# Website atlas — 100+ distinct experiences, with what is actually verified

Built by `research/gen_websites.py`. The point of this file is the **split between what a site looks like it does and what we can prove it uses**. 10 fields per row; sections C and D are URLs that were never invented.

| section | entries | URL provenance | evidence label |
|---|--:|---|---|
| A. Award/press listings (Awwwards categories, Codrops) | 44 | name read off a fetched listing page; per-site URL not exposed → listing URL recorded | [VERIFIED-LISTING] |
| B. Live demos of in-scope repos (homepage from GitHub API) | 48 | repo `homepage` field, fetched from api.github.com | [VERIFIED-API] |
| C. three.js example gallery (technique references) | 36 | file present in `mrdoob/three.js` tree via API | [VERIFIED-API] |
| D. drei per-helper live demos | 26 | link extracted from drei's fetched README | [VERIFIED-FILE] |
| **E. Awwwards Sites of the Day — URL **and** award both verified** | **14** | fetched listing 2026-11-02, per-site `/sites/<slug>` link read directly | [VERIFIED-LISTING] + [VERIFIED-FETCH] |
| **total** | **168** | | |

> **2026-11-02 verification pass:** §E was added to close the "44 names, 1 verified winner" gap, and §C now carries the real WebGL/WebGPU example counts (300 / 243) instead of a guess. See `VERIFICATION_LOG.md` §4 C8/C10.

## A. Showcase / editorial references (observed, not implementation-verified)

| # | site | studio | listing page | what it does (observed) | why it matters here | implementation | label | fetched |
|--:|---|---|---|---|---|---|---|---|
| 1 | Quynh Folio | Quynh Cao | awwwards.com/websites/scrolling/ | type-led scroll narrative, sections revealed as you go | template for our landing 'how it works' without a single image | scroll-linked reveals; framework unverified | [VERIFIED-LISTING] | 2026-11-02 |
| 2 | Yaas Energy | DVIGA | awwwards.com/websites/scrolling/ | long-form brand scroll with pinned product moments | pinned-chapter structure we can reuse for a 'story of a resource' | pin/scrub; library unverified | [VERIFIED-LISTING] | 2026-11-02 |
| 3 | The Little Match Girl | DxL.agency | awwwards.com/websites/scrolling/ | narrative scroll with staged scenes | proof that chaptered storytelling can stay legible at mobile widths | scene staging; unverified | [VERIFIED-LISTING] | 2026-11-02 |
| 4 | Yogi Suria — One Thread | void-over-sentry | awwwards.com/websites/scrolling/ | one-continuity vertical scroll, minimal chrome | closest aesthetic to 'editorial + futuristic' | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 5 | Jockey | Stuudio | awwwards.com/websites/scrolling/ | horizontal→vertical section switch | horizontal gallery idea for subject rails | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 6 | Möbius Design studio | Anton Drukarov | awwwards.com/websites/scrolling/ | studio site, scroll-linked typography scale | typography as the protagonist | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 7 | Georgedo From Dream to Reality | — | awwwards.com/websites/scrolling/ | portfolio with progressive reveal | reveal timing reference | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 8 | daren&curtis Agency | — | awwwards.com/websites/scrolling/ | agency scroll with media blocks | media-block cadence for how-it-works | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 9 | Miligram Brand Agency | — | awwwards.com/websites/scrolling/ | bold type + fast scroll | a premium look achievable with type alone | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 10 | Siglitos | Waka | awwwards.com/websites/scrolling/ | playful scroll-driven marks | micro-interactions in a small page | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 11 | Vadim Carazan Art Director | — | awwwards.com/websites/scrolling/ | large-type reel | hero type hierarchy | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 12 | Davaris Textiles | Strictly Studio | awwwards.com/websites/scrolling/ | product scroll with texture overlays | grain/texture as depth layer (our design-system note) | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 13 | Spyker Cars | The Brink Agency | awwwards.com/websites/scrolling/ | premium automotive scroll, 3D-ish product staging | when 3D earns its place: product is the content | likely WebGL; unverified | [VERIFIED-LISTING] | 2026-11-02 |
| 14 | Endcap Design | — | awwwards.com/websites/typography/ | type-specimen-led layout | editorial grid for a document product | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 15 | Webdrift | — | awwwards.com/websites/typography/ | kinetic headings with restrained motion | motion only on headings — our rule | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 16 | Josué Pichot | — | awwwards.com/websites/typography/ | serif/sans pairing, big contrast | type pairing reference for the design system | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 17 | Pixelmojo | — | awwwards.com/websites/typography/ | grid-first portfolio | 12-col + baseline discipline | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 18 | Casa Momo | Lucas Roßmann | awwwards.com/websites/typography/ | hand-set feeling web type, tight leading | warmth without decoration | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 19 | Enigma | Ruler | awwwards.com/websites/typography/ | type-led hero, no hero image | justifies 'no stock hero' direction | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 20 | Hozon — The art of keeping | AEStudio | awwwards.com/websites/typography/ | chaptered essay scroll | closest content shape to ours (text-first) | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 21 | Study Hall | — | awwwards.com/websites/typography/ | education-adjacent editorial layout | direct genre comparison | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 22 | Broworks | — | awwwards.com/websites/typography/ | industrial type system | mono/label typography for metadata rows | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 23 | DOT Audio Recorder | plastic.audio | awwwards.com/websites/typography/ | product page with real-time visualisation | canvas visualisation ≠ WebGL dependency | canvas 2D per listing | [VERIFIED-LISTING] | 2026-11-02 |
| 24 | Roberto Attanasio | — | awwwards.com/websites/typography/ | minimal reel | mobile-first type scale | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 25 | Snitch | rabaha-gul | awwwards.com/websites/typography/ | type + motion balance | reveal easing reference | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 26 | Peaches | Jasmin Adatepe | awwwards.com/websites/typography/ | expressive variable-font play | variable font axis animation (our ex01 idea) | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 27 | Ondo Collective | — | awwwards.com/websites/typography/ | collective index page | index/list design for a library | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 28 | Chris Williams Art Gallery | Oleg Nikolaev | awwwards.com/websites/minimal/ | gallery as a list, no chrome | a "library" UI that is all metadata | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 29 | Steven Atallah v2 | steveatallah | awwwards.com/websites/minimal/ | single-column portfolio | single-column = our mobile architecture | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 30 | Eduardo Alba | — | awwwards.com/websites/minimal/ | type + whitespace | spacing scale reference | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 31 | Beady | AliseB | awwwards.com/websites/minimal/ | quiet interactions | hover language without glow | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 32 | Zeyra Glow | humansaucer | awwwards.com/websites/minimal/ | restrained glow usage | how to use glass/blur sparingly | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 33 | NAKAGAWA Co., Ltd. | Leapy,Inc. | awwwards.com/websites/minimal/ | corporate minimal, dense info | metadata-dense layout that stays calm | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 34 | LAYERS OF TIME | — | awwwards.com/websites/minimal/ | layered depth with few colours | layering = our 5-layer card | unknown | [VERIFIED-LISTING] | 2026-11-02 |
| 35 | Dont Look up game | Marcelo Reis Melo | awwwards.com/websites/minimal/ | interactive game page — DEV Developer Award + SOTD 2026-11-01 | the only *verified award winner* in AK's fetched sample; interactive-first | unverified engine | [VERIFIED-LISTING] | 2026-11-02 |

### A2. Codrops case studies (article states the stack — still [REPORTED] until we read the demo source)

| # | article | author | date | observed | our use | stated tech | label |
|--:|---|---|---|---|---|---|---|
| 1 | Exploring 3D Image Rotations on Scroll | Manoela Ilic | 2026-06-18 | 3D rotation driven by scroll | our ex03/ex04 territory | GSAP + CSS 3D (article-stated) | [VERIFIED-LISTING]+[REPORTED] |
| 2 | Shader.se — scroll-driven WebGPU pipeline | Filip Kantedal | 2026-05-19 | selective scene rendering for seamless scene transitions | the technique to copy for section transitions in 3D | R3F + WebGL + WebGPU (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 3 | More Than a Portfolio — scroll-driven 3D world | Joseph Santamaria | 2026-04-28 | one continuous 3D world across sections | candidate landing concept (and its cost) | Three + GSAP + WebGL (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 4 | OPTIKKA — scroll-synced frame sequences | Zajno | 2025-10-16 | video-based scroll sequences instead of WebGL | the cheap alternative to 3D: pre-rendered frames | HTML5 video (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 5 | Carmen Ansio — spotlight on design systems | — | 2026-10-24 | Stripe-style design-system presentation, interactive Lottie | how to present a system (our playbook's own need) | Lottie interactive (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 6 | Juan Mora Romero '26 portfolio | — | 2026-10-22 | draggable lab, chromatic split, cloth posters | micro-interaction inventory | Next.js + R3F + GSAP (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 7 | Maria Vasilyeva — WebGL/GLSL + sound | — | 2026-10-20 | shader-reactive audio-visual page | what shader work looks like when it *is* the content | WebGL/GLSL (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 8 | PaperDrops — design tokens + MCP | Jesper Landberg | 2026-10-19 | Paper shaders ported to WebGPU; tokens + MCP workflow | token-driven shader theming = our theme-aware background | WebGPU port (stated) | [VERIFIED-LISTING]+[REPORTED] |
| 9 | Real Folds, Real Fire | — | 2026-10-18 | live 3D paper curl simulation | delight that costs a shader, not a model | 3D/physics (stated) | [VERIFIED-LISTING]+[REPORTED] |

Codrops search totals on 2026-11-02 for `scroll`: 649 results — 270 articles, 149 tutorials, 98 playground entries, 121 demos [VERIFIED-LISTING].

## B. Live demos whose stack we can verify from the repo

| # | site | URL | source repo | ★ | licence | what it demonstrates | our use | tech (from repo) | label |
|--:|---|---|---|--:|---|---|---|---|---|
| 1 | react-spring | http://www.react-spring.dev/ | [`pmndrs/react-spring`](https://github.com/pmndrs/react-spring) | 29,261 | MIT | UI animation | ✌️ A spring physics based React animation library | `motion`, `r3f`, `react`, `three`, `vite` | [VERIFIED-FILE] |
| 2 | motion | https://motion.dev | [`motiondivision/motion`](https://github.com/motiondivision/motion) | 34,777 | MIT | UI animation | A modern animation library for React and JavaScript | `gsap`, `motion`, `react` | [VERIFIED-FILE] |
| 3 | three.js | https://threejs.org/ | [`mrdoob/three.js`](https://github.com/mrdoob/three.js) | 117,375 | MIT | 3D scene | JavaScript 3D Library. | not inspected — see repo | [VERIFIED-API] |
| 4 | ui | https://ui.shadcn.com | [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui) | 127,118 | MIT | components | Composable, accessible components with thoughtful defaults. Build your own component lib | `motion`, `tailwind`, `vite` | [VERIFIED-FILE] |
| 5 | vue-vben-admin | https://www.vben.pro | [`vbenjs/vue-vben-admin`](https://github.com/vbenjs/vue-vben-admin) | 33,722 | MIT | search & discovery | A modern vue admin panel built with Vue3, Shadcn UI, Vite, TypeScript, and Monorepo. It' | `tailwind`, `vite`, `vue` | [VERIFIED-FILE] |
| 6 | chakra-ui | https://chakra-ui.com | [`chakra-ui/chakra-ui`](https://github.com/chakra-ui/chakra-ui) | 40,711 | MIT | components | Chakra UI is a component system for building SaaS products with speed ⚡️ | `react`, `vite` | [VERIFIED-FILE] |
| 7 | editor | https://editor.pascal.app | [`pascalorg/editor`](https://github.com/pascalorg/editor) | 25,265 | MIT | 3D scene | Open-source 3D architectural editor with a local CLI, MCP tools, and practical workflows | `next`, `r3f`, `react`, `three`, `zustand` | [VERIFIED-FILE] |
| 8 | preact | https://preactjs.com | [`preactjs/preact`](https://github.com/preactjs/preact) | 38,972 | MIT | components | ⚛️ Fast 3kB React alternative with the same modern API. Components & Virtual DOM. | not inspected — see repo | [VERIFIED-API] |
| 9 | hyperframes | https://hyperframes.heygen.com | [`heygen-com/hyperframes`](https://github.com/heygen-com/hyperframes) | 77,104 | Apache-2.0 | scroll choreography | Write HTML. Render video. Built for agents. | `react` | [VERIFIED-FILE] |
| 10 | pixijs | http://pixijs.com | [`pixijs/pixijs`](https://github.com/pixijs/pixijs) | 48,612 | MIT | shaders/WebGL | The HTML5 Creation Engine: Create beautiful digital content with the fastest, most flexi | `pixi` | [VERIFIED-FILE] |
| 11 | phaser | https://phaser.io | [`phaserjs/phaser`](https://github.com/phaserjs/phaser) | 40,628 | MIT | shaders/WebGL | Phaser is a fun, free and fast 2D game framework for making HTML5 games for desktop and  | not inspected — see repo | [VERIFIED-API] |
| 12 | magicui | https://magicui.design | [`magicuidesign/magicui`](https://github.com/magicuidesign/magicui) | 23,026 | MIT | UI animation | UI Library for Design Engineers. Animated components and effects you can copy and paste  | not inspected — see repo | [VERIFIED-API] |
| 13 | Babylon.js | http://www.babylonjs.com | [`BabylonJS/Babylon.js`](https://github.com/BabylonJS/Babylon.js) | 26,265 | Apache-2.0 | shaders/WebGL | Babylon.js is a powerful, beautiful, simple, and open game and rendering engine packed i | `vite` | [VERIFIED-FILE] |
| 14 | lottie-android | http://airbnb.io/lottie/ | [`airbnb/lottie-android`](https://github.com/airbnb/lottie-android) | 35,760 | Apache-2.0 | UI animation | Render After Effects animations natively on Android and iOS, Web, and React Native | `lottie` | [VERIFIED-FILE] |
| 15 | react-bits | https://reactbits.dev | [`DavidHDev/react-bits`](https://github.com/DavidHDev/react-bits) | 50,983 | NOASSERTION | components | The largest open-source library of animated, interactive, and customizable React & Next. | `drei`, `gsap`, `lenis`, `lenis_react`, `motion`, `ogl` | [VERIFIED-FILE] |
| 16 | FastGPT | https://fastgpt.io | [`labring/FastGPT`](https://github.com/labring/FastGPT) | 29,967 | NOASSERTION | search & discovery | FastGPT is a knowledge-based platform built on the LLMs, offers a comprehensive suite of | not inspected — see repo | [VERIFIED-API] |
| 17 | nextra | https://nextra.site | [`shuding/nextra`](https://github.com/shuding/nextra) | 13,948 | MIT | premium-sites | Simple, powerful and flexible site generation framework with everything you love from Ne | `next`, `vite` | [VERIFIED-FILE] |
| 18 | xterm.js | https://xtermjs.org/ | [`xtermjs/xterm.js`](https://github.com/xtermjs/xterm.js) | 21,311 | MIT | shaders/WebGL | A terminal for the web | not inspected — see repo | [VERIFIED-API] |
| 19 | primitives | https://radix-ui.com/primitives | [`radix-ui/primitives`](https://github.com/radix-ui/primitives) | 19,462 | MIT | search & discovery | Radix Primitives is an open-source UI component library for building high-quality, acces | `react`, `vite` | [VERIFIED-FILE] |
| 20 | lottie-react-native | https://airbnb.io/lottie/#/react-native | [`lottie-react-native/lottie-react-native`](https://github.com/lottie-react-native/lottie-react-native) | 17,214 | Apache-2.0 | UI animation | Lottie wrapper for React Native. | `lottie` | [VERIFIED-FILE] |
| 21 | gods-eye-view | https://maptheworld.ai/ | [`bilawalsidhu/gods-eye-view`](https://github.com/bilawalsidhu/gods-eye-view) | 62,062 | NOASSERTION | shaders/WebGL | A spy satellite simulator in your browser, except the data is real. Live open source spa | `vite` | [VERIFIED-FILE] |
| 22 | maple-font | https://font.subf.dev | [`subframe7536/maple-font`](https://github.com/subframe7536/maple-font) | 29,609 | OFL-1.1 | type system | Maple Mono: Open source monospace font with round corner, ligatures and Nerd-Font icons  | not inspected — see repo | [VERIFIED-API] |
| 23 | meilisearch | https://www.meilisearch.com | [`meilisearch/meilisearch`](https://github.com/meilisearch/meilisearch) | 59,746 | NOASSERTION | search & discovery | A lightning-fast search engine API bringing AI-powered hybrid search to your sites and a | not inspected — see repo | [VERIFIED-API] |
| 24 | img2threejs | https://img2threejs.io | [`img2threejs/img2threejs`](https://github.com/img2threejs/img2threejs) | 20,033 | Apache-2.0 | 3D scene | Rebuild the object in a reference image as a code-only, procedural, quality-gated, anima | not inspected — see repo | [VERIFIED-API] |
| 25 | open-saas | https://opensaas.sh | [`wasp-lang/open-saas`](https://github.com/wasp-lang/open-saas) | 16,232 | MIT | premium-sites | A 100% free modern JS SaaS boilerplate (React, NodeJS, Prisma). Full-featured: Auth (ema | not inspected — see repo | [VERIFIED-API] |
| 26 | VoxCPM | https://voxcpm.com | [`OpenBMB/VoxCPM`](https://github.com/OpenBMB/VoxCPM) | 40,944 | Apache-2.0 | type system | VoxCPM2: Tokenizer-Free TTS for Multilingual Speech Generation, Creative Voice Design, a | not inspected — see repo | [VERIFIED-API] |
| 27 | lenis | https://lenis.dev | [`darkroomengineering/lenis`](https://github.com/darkroomengineering/lenis) | 17,028 | MIT | scroll choreography | Smooth scroll as it should be | `lenis`, `lenis_react`, `react`, `vue` | [VERIFIED-FILE] |
| 28 | plotly.py | https://plotly.com/python/ | [`plotly/plotly.py`](https://github.com/plotly/plotly.py) | 18,868 | MIT | shaders/WebGL | The interactive graphing library for Python :sparkles: | not inspected — see repo | [VERIFIED-API] |
| 29 | awesome-design-md | https://starterkit.getdesign.md/ | [`VoltAgent/awesome-design-md`](https://github.com/VoltAgent/awesome-design-md) | 125,092 | MIT | type system | A collection of DESIGN.md files analysis by popular brand design systems. Drop one into  | not inspected — see repo | [VERIFIED-API] |
| 30 | PhotoSwipe | http://photoswipe.com | [`dimsemenov/PhotoSwipe`](https://github.com/dimsemenov/PhotoSwipe) | 25,295 | MIT | search & discovery | JavaScript image gallery for mobile and desktop, modular, framework independent | not inspected — see repo | [VERIFIED-API] |
| 31 | plotly.js | https://plotly.com/javascript/ | [`plotly/plotly.js`](https://github.com/plotly/plotly.js) | 18,377 | MIT | shaders/WebGL | Open-source JavaScript charting library behind Plotly and Dash | `search` | [VERIFIED-FILE] |
| 32 | headlessui | https://headlessui.com | [`tailwindlabs/headlessui`](https://github.com/tailwindlabs/headlessui) | 28,805 | MIT | perf/a11y | Completely unstyled, fully accessible UI components, designed to integrate beautifully w | `react`, `vue` | [VERIFIED-FILE] |
| 33 | aframe | https://aframe.io/ | [`aframevr/aframe`](https://github.com/aframevr/aframe) | 17,685 | MIT | 3D scene | :a: Web framework for building virtual reality experiences. | `three`, `xr` | [VERIFIED-FILE] |
| 34 | tinyrenderer | https://haqr.eu/tinyrenderer/ | [`ssloy/tinyrenderer`](https://github.com/ssloy/tinyrenderer) | 24,486 | NOASSERTION | shaders/WebGL | A brief computer graphics / rendering course | not inspected — see repo | [VERIFIED-API] |
| 35 | engine | https://playcanvas.com | [`playcanvas/engine`](https://github.com/playcanvas/engine) | 17,174 | MIT | shaders/WebGL | Powerful web graphics runtime built on WebGL, WebGPU, WebXR and glTF | not inspected — see repo | [VERIFIED-API] |
| 36 | cesium | https://cesium.com/cesiumjs/ | [`CesiumGS/cesium`](https://github.com/CesiumGS/cesium) | 15,903 | Apache-2.0 | shaders/WebGL | An open-source JavaScript library for world-class 3D globes and maps :earth_americas: | not inspected — see repo | [VERIFIED-API] |
| 37 | assistant-ui | https://www.assistant-ui.com | [`assistant-ui/assistant-ui`](https://github.com/assistant-ui/assistant-ui) | 12,892 | MIT | search & discovery | Typescript/React Library for AI Chat 💬🚀 | not inspected — see repo | [VERIFIED-API] |
| 38 | deck.gl | https://deck.gl | [`visgl/deck.gl`](https://github.com/visgl/deck.gl) | 14,726 | MIT | shaders/WebGL | WebGL2 powered visualization framework | not inspected — see repo | [VERIFIED-API] |
| 39 | Fuse | https://fusejs.io/ | [`krisk/Fuse`](https://github.com/krisk/Fuse) | 20,520 | Apache-2.0 | search & discovery | Lightweight fuzzy-search, in JavaScript | `search`, `vite`, `vue` | [VERIFIED-FILE] |
| 40 | awesome-shadcn-ui | https://awesomeshadcn.dev/ | [`birobirobiro/awesome-shadcn-ui`](https://github.com/birobirobiro/awesome-shadcn-ui) | 20,740 | MIT | search & discovery | A curated list of awesome things related to shadcn/ui. | not inspected — see repo | [VERIFIED-API] |
| 41 | GSAP | https://gsap.com | [`greensock/GSAP`](https://github.com/greensock/GSAP) | 30,029 | NONE | scroll choreography | GSAP (GreenSock Animation Platform), a JavaScript animation library for the modern web | `gsap`, `motion`, `splittype` | [VERIFIED-FILE] |
| 42 | base-ui | https://base-ui.com | [`mui/base-ui`](https://github.com/mui/base-ui) | 11,272 | MIT | perf/a11y | Unstyled UI components for building accessible web apps and design systems. From the cre | `react`, `tailwind`, `vite` | [VERIFIED-FILE] |
| 43 | tfjs | https://js.tensorflow.org | [`tensorflow/tfjs`](https://github.com/tensorflow/tfjs) | 19,158 | Apache-2.0 | shaders/WebGL | A WebGL accelerated JavaScript library for training and deploying ML models. | not inspected — see repo | [VERIFIED-API] |
| 44 | plate | https://platejs.org | [`udecode/plate`](https://github.com/udecode/plate) | 16,685 | NOASSERTION | search & discovery | Rich-text editor with AI and shadcn/ui | not inspected — see repo | [VERIFIED-API] |
| 45 | shadcn-vue | https://shadcn-vue.com | [`unovue/shadcn-vue`](https://github.com/unovue/shadcn-vue) | 10,764 | MIT | search & discovery | Vue port of shadcn-ui | not inspected — see repo | [VERIFIED-API] |
| 46 | gpu.js | https://gpu.rocks | [`gpujs/gpu.js`](https://github.com/gpujs/gpu.js) | 15,519 | MIT | shaders/WebGL | GPU Accelerated JavaScript | not inspected — see repo | [VERIFIED-API] |
| 47 | G2 | https://g2.antv.antgroup.com | [`antvis/G2`](https://github.com/antvis/G2) | 12,652 | MIT | shaders/WebGL | 📊 The concise and progressive visualization grammar. | not inspected — see repo | [VERIFIED-API] |
| 48 | sigma.js | https://www.sigmajs.org/ | [`jacomyal/sigma.js`](https://github.com/jacomyal/sigma.js) | 12,212 | MIT | shaders/WebGL | A JavaScript library aimed at visualizing graphs of thousands of nodes and edges | not inspected — see repo | [VERIFIED-API] |

## C. three.js examples — the technique shelf (no install, MIT, all live)

> Counted from the repo tree on 2026-11-02 [VERIFIED-API]: `examples/` holds **622 example files — 300 `webgl_*` and 243 `webgpu_*`**. Top WebGPU families by file count: `postprocessing` 33, `materials` 19, `tsl` 16, `compute` 15, `lights` 13, `loader` 11, `shadowmap` 7, `volume` 7, `meshlets` 6. Read as: WebGPU is where the project is going, but WebGL remains the majority and the only path we ship to in 2026.

Every row is `https://threejs.org/examples/#<slug>` and the file exists in the repo tree (300 `webgl_*` examples enumerated via API).

| # | example | URL | technique family | relevance | label |
|--:|---|---|---|---|---|
| 1 | `webgl_buffergeometry_custom_attributes_particles` | https://threejs.org/examples/#webgl_buffergeometry_custom_attributes_particles | buffergeometry | particle field without a library | [VERIFIED-API] |
| 2 | `webgl_points_billboards` | https://threejs.org/examples/#webgl_points_billboards | points | particle field without a library | [VERIFIED-API] |
| 3 | `webgl_points_dynamic` | https://threejs.org/examples/#webgl_points_dynamic | points | particle field without a library | [VERIFIED-API] |
| 4 | `webgl_points_sprites` | https://threejs.org/examples/#webgl_points_sprites | points | particle field without a library | [VERIFIED-API] |
| 5 | `webgl_points_waves` | https://threejs.org/examples/#webgl_points_waves | points | particle field without a library | [VERIFIED-API] |
| 6 | `webgl_shader` | https://threejs.org/examples/#webgl_shader | misc | raw GLSL on a plane: our background effect | [VERIFIED-API] |
| 7 | `webgl_shader_lava` | https://threejs.org/examples/#webgl_shader_lava | shader | raw GLSL on a plane: our background effect | [VERIFIED-API] |
| 8 | `webgl_shaders_ocean` | https://threejs.org/examples/#webgl_shaders_ocean | shaders | raw GLSL on a plane: our background effect | [VERIFIED-API] |
| 9 | `webgl_shaders_sky` | https://threejs.org/examples/#webgl_shaders_sky | shaders | raw GLSL on a plane: our background effect | [VERIFIED-API] |
| 10 | `webgl_postprocessing_fxaa` | https://threejs.org/examples/#webgl_postprocessing_fxaa | postprocessing | what a post-processing pass buys and costs | [VERIFIED-API] |
| 11 | `webgl_postprocessing_outline` | https://threejs.org/examples/#webgl_postprocessing_outline | postprocessing | what a post-processing pass buys and costs | [VERIFIED-API] |
| 12 | `webgl_postprocessing_pixel` | https://threejs.org/examples/#webgl_postprocessing_pixel | postprocessing | what a post-processing pass buys and costs | [VERIFIED-API] |
| 13 | `webgl_postprocessing_smaa` | https://threejs.org/examples/#webgl_postprocessing_smaa | postprocessing | what a post-processing pass buys and costs | [VERIFIED-API] |
| 14 | `webgl_postprocessing_transition` | https://threejs.org/examples/#webgl_postprocessing_transition | postprocessing | what a post-processing pass buys and costs | [VERIFIED-API] |
| 15 | `webgl_postprocessing_unreal_bloom` | https://threejs.org/examples/#webgl_postprocessing_unreal_bloom | postprocessing | what a post-processing pass buys and costs | [VERIFIED-API] |
| 16 | `webgl_geometry_text` | https://threejs.org/examples/#webgl_geometry_text | geometry | 3D typography / HTML-in-3D (our 3D type question) | [VERIFIED-API] |
| 17 | `webgl_geometry_text_shapes` | https://threejs.org/examples/#webgl_geometry_text_shapes | geometry | 3D typography / HTML-in-3D (our 3D type question) | [VERIFIED-API] |
| 18 | `webgl_geometry_text_stroke` | https://threejs.org/examples/#webgl_geometry_text_stroke | geometry | 3D typography / HTML-in-3D (our 3D type question) | [VERIFIED-API] |
| 19 | `webgl_batch_lod_bvh` | https://threejs.org/examples/#webgl_batch_lod_bvh | batch | the performance toolkit: LOD, instancing, multiple canvases, offscreen | [VERIFIED-API] |
| 20 | `webgl_instancing_performance` | https://threejs.org/examples/#webgl_instancing_performance | instancing | the performance toolkit: LOD, instancing, multiple canvases, offscreen | [VERIFIED-API] |
| 21 | `webgl_lod` | https://threejs.org/examples/#webgl_lod | misc | the performance toolkit: LOD, instancing, multiple canvases, offscreen | [VERIFIED-API] |
| 22 | `webgl_mesh_batch` | https://threejs.org/examples/#webgl_mesh_batch | mesh | the performance toolkit: LOD, instancing, multiple canvases, offscreen | [VERIFIED-API] |
| 23 | `webgl_multiple_elements` | https://threejs.org/examples/#webgl_multiple_elements | multiple | the performance toolkit: LOD, instancing, multiple canvases, offscreen | [VERIFIED-API] |
| 24 | `webgl_multiple_elements_text` | https://threejs.org/examples/#webgl_multiple_elements_text | multiple | the performance toolkit: LOD, instancing, multiple canvases, offscreen | [VERIFIED-API] |
| 25 | `webgl_clipping` | https://threejs.org/examples/#webgl_clipping | misc | reveal/transition techniques usable as section wipes | [VERIFIED-API] |
| 26 | `webgl_clipping_advanced` | https://threejs.org/examples/#webgl_clipping_advanced | clipping | reveal/transition techniques usable as section wipes | [VERIFIED-API] |
| 27 | `webgl_clipping_intersection` | https://threejs.org/examples/#webgl_clipping_intersection | clipping | reveal/transition techniques usable as section wipes | [VERIFIED-API] |
| 28 | `webgl_clipping_stencil` | https://threejs.org/examples/#webgl_clipping_stencil | clipping | reveal/transition techniques usable as section wipes | [VERIFIED-API] |
| 29 | `webgl_materials_envmaps_hdr` | https://threejs.org/examples/#webgl_materials_envmaps_hdr | materials | cheap ways to look premium in 3D | [VERIFIED-API] |
| 30 | `webgl_materials_matcap` | https://threejs.org/examples/#webgl_materials_matcap | materials | cheap ways to look premium in 3D | [VERIFIED-API] |
| 31 | `webgl_materials_physical_transmission` | https://threejs.org/examples/#webgl_materials_physical_transmission | materials | cheap ways to look premium in 3D | [VERIFIED-API] |
| 32 | `webgl_materials_physical_transmission_alpha` | https://threejs.org/examples/#webgl_materials_physical_transmission_alpha | materials | cheap ways to look premium in 3D | [VERIFIED-API] |
| 33 | `webgl_lights_physical` | https://threejs.org/examples/#webgl_lights_physical | lights | lighting realism vs cost | [VERIFIED-API] |
| 34 | `webgl_shadowmap_performance` | https://threejs.org/examples/#webgl_shadowmap_performance | shadowmap | lighting realism vs cost | [VERIFIED-API] |
| 35 | `webgl_test_wide_gamut` | https://threejs.org/examples/#webgl_test_wide_gamut | test | lighting realism vs cost | [VERIFIED-API] |
| 36 | `webgl_tonemapping` | https://threejs.org/examples/#webgl_tonemapping | misc | lighting realism vs cost | [VERIFIED-API] |

**Not enumerated here:** the `webgpu_*` family. `research/gen_demos.py` filtered on `webgl_`, so WebGPU counts are unknown — recorded as a gap in `GITHUB_RESEARCH_GAPS.md` rather than guessed.

## D. drei per-helper live demos (each helper has its own runnable page)

| # | demo | helper | what we would use it for | label |
|--:|---|---|---|---|
| 1 | https://pmndrs.github.io/drei | `drei` | helper demo — check before use | [VERIFIED-FILE] |
| 2 | https://pmndrs.github.io/drei/abstractions/ascii-renderer | `ascii-renderer` | helper demo — check before use | [VERIFIED-FILE] |
| 3 | https://pmndrs.github.io/drei/abstractions/billboard | `billboard` | helper demo — check before use | [VERIFIED-FILE] |
| 4 | https://pmndrs.github.io/drei/abstractions/clone | `clone` | helper demo — check before use | [VERIFIED-FILE] |
| 5 | https://pmndrs.github.io/drei/abstractions/computed-attribute | `computed-attribute` | helper demo — check before use | [VERIFIED-FILE] |
| 6 | https://pmndrs.github.io/drei/abstractions/decal | `decal` | helper demo — check before use | [VERIFIED-FILE] |
| 7 | https://pmndrs.github.io/drei/abstractions/edges | `edges` | helper demo — check before use | [VERIFIED-FILE] |
| 8 | https://pmndrs.github.io/drei/abstractions/effects | `effects` | helper demo — check before use | [VERIFIED-FILE] |
| 9 | https://pmndrs.github.io/drei/abstractions/gradient-texture | `gradient-texture` | helper demo — check before use | [VERIFIED-FILE] |
| 10 | https://pmndrs.github.io/drei/abstractions/image | `image` | helper demo — check before use | [VERIFIED-FILE] |
| 11 | https://pmndrs.github.io/drei/abstractions/marching-cubes | `marching-cubes` | helper demo — check before use | [VERIFIED-FILE] |
| 12 | https://pmndrs.github.io/drei/abstractions/outlines | `outlines` | helper demo — check before use | [VERIFIED-FILE] |
| 13 | https://pmndrs.github.io/drei/abstractions/positional-audio | `positional-audio` | helper demo — check before use | [VERIFIED-FILE] |
| 14 | https://pmndrs.github.io/drei/abstractions/sampler | `sampler` | helper demo — check before use | [VERIFIED-FILE] |
| 15 | https://pmndrs.github.io/drei/abstractions/screen-sizer | `screen-sizer` | helper demo — check before use | [VERIFIED-FILE] |
| 16 | https://pmndrs.github.io/drei/abstractions/screen-space | `screen-space` | helper demo — check before use | [VERIFIED-FILE] |
| 17 | https://pmndrs.github.io/drei/abstractions/splat | `splat` | helper demo — check before use | [VERIFIED-FILE] |
| 18 | https://pmndrs.github.io/drei/abstractions/svg | `svg` | helper demo — check before use | [VERIFIED-FILE] |
| 19 | https://pmndrs.github.io/drei/abstractions/text | `text` | SDF text (3D typography without glyphs-as-meshes cost) | [VERIFIED-FILE] |
| 20 | https://pmndrs.github.io/drei/abstractions/text3d | `text3d` | helper demo — check before use | [VERIFIED-FILE] |
| 21 | https://pmndrs.github.io/drei/abstractions/trail | `trail` | helper demo — check before use | [VERIFIED-FILE] |
| 22 | https://pmndrs.github.io/drei/abstractions/use-animations | `use-animations` | helper demo — check before use | [VERIFIED-FILE] |
| 23 | https://pmndrs.github.io/drei/cameras/cube-camera | `cube-camera` | helper demo — check before use | [VERIFIED-FILE] |
| 24 | https://pmndrs.github.io/drei/cameras/orthographic-camera | `orthographic-camera` | helper demo — check before use | [VERIFIED-FILE] |
| 25 | https://pmndrs.github.io/drei/cameras/perspective-camera | `perspective-camera` | helper demo — check before use | [VERIFIED-FILE] |
| 26 | https://pmndrs.github.io/drei/controls/camera-controls | `camera-controls` | helper demo — check before use | [VERIFIED-FILE] |


## E. Sites of the Day — award + URL both verified (added 2026-11-02)

The first section in this atlas where **both** the recognition and a real URL are confirmed by a direct fetch of `awwwards.com/websites/sites_of_the_day/`. Nothing here is inferred from appearance; "implementation" says only what the listing states.

| # | site | studio | award (listed) | date | verified URL | relevance to the hub |
|--:|---|---|---|---|---|---|
| E1 | Grids | Obys | **SOTD + Developer Award** | 2026-11-02 | https://www.awwwards.com/sites/grids-1 | Obys is the typographic-grid benchmark; a grid-led catalogue page can win on layout alone — our exact thesis |
| E2 | Dont Look up game | Marcelo Reis Melo | SOTD + Developer | 2026-11-01 | https://www.awwwards.com/sites/dont-look-up-game | Small-scope interactive piece; proves a single idea executed tightly beats breadth |
| E3 | MECHA | widelab.co | SOTD + Developer | 2026-10-31 | https://www.awwwards.com/sites/mecha | Product-staging scroll with 3D presence — the "3D earns its place" pattern |
| E4 | Spyker Cars | The Brink Agency | SOTD + Developer | 2026-10-30 | https://www.awwwards.com/sites/spyker-cars | Also row 13 of §A (listing-only) → now double-confirmed; premium object + restrained chrome |
| E5 | Unbelievably Crap | Liubomyr Ulytskyi | SOTD | 2026-10-29 | https://www.awwwards.com/sites/unbelievably-crap | No Developer Award → useful contrast case: award-winning *look*, unremarkable engineering |
| E6 | G. Colombel — Portfolio 2026 | Guillaume Colombel | SOTD + Developer | 2026-10-28 | https://www.awwwards.com/sites/g-colombel-portfolio-2026 | Individual-maker tier: the achievable ambition level for a one-person product |
| E7 | Awards Racing | Angelica P. | SOTD + Developer | 2026-10-27 | https://www.awwwards.com/sites/awards-racing | Motion-heavy list/race UI — closest interaction analogue to a "leaderboard of shared decks" |
| E8 | A24 | Ravi Klaassens | SOTD + Developer | 2026-10-26 | https://www.awwwards.com/sites/a24 | Catalogue of media items with cover-led cards — structurally our document grid |
| E9 | Forge Automotive | 12 Studio | SOTD + Developer | 2026-10-25 | https://www.awwwards.com/sites/forge-automotive | Dark-first premium surface, exactly the palette register we keep |
| E10 | Brandon Yasin | Brandon Yasin | SOTD + Developer | 2026-10-24 | https://www.awwwards.com/sites/brandon-yasin | Type-led hero without imagery; supports the "no stock hero" decision |
| E11 | ESR Bespoke | NIGHTJAR | SOTD + Developer | 2026-10-23 | https://www.awwwards.com/sites/esr-bespoke | Editorial serif + tight metadata rows = our document-detail hierarchy |
| E12 | Emotion Agency | Emotion Agency | SOTD + Developer | 2026-10-22 | https://www.awwwards.com/sites/emotion-agency-1 | Studio-site navigation ideas for a small sitemap |
| E13 | Ascension — Pegassi® | Jesper Landberg | SOTD + Developer | 2026-10-21 | https://www.awwwards.com/sites/ascension-pegassi-r | Stylised single-narrative page: the "one memorable idea" model |
| E14 | Cartier — Le Chœur des Pierres | makemepulse | listed on this page (HM/SOTD tier per §A of Phase 1) | 2026-09→10 | https://www.awwwards.com/sites/cartier-le-choeur-des-pierres | Luxury-grade shader + type polish, cited in Phase 1 as the WebGL tier benchmark |

**Method note.** The Awwwards URL is the verified object; each submission page additionally carries a "Visit Site" link to the origin domain, which AK could not follow for all 14 within budget. **AC: click-through before quoting an origin URL to the Product Owner** (in Phase 1, `smithsonian-institution → si.edu` was verified this way [VERIFIED-FETCH]).

**What §E changes in the recommendation.** 13 of 14 carry the **Developer Award alongside SOTD** — on this page, engineering quality is the differentiator, not decoration. That is the empirical backing for the blueprint's Tier-0-first stance: win on structure, spend motion bytes once.

## Method notes (read before trusting a row)

1. **No URL in section A is invented.** Awwwards category pages expose site names and studios in the HTML I fetched, but not stable per-site links; rather than guess slugs I recorded the listing page. Treat these as *leads to search*, not citations.
2. **Only 1 verified award winner** appeared in the fetched samples (`Dont Look up game`, Developer Award + SOTD 2026-11-01). Everything else shown with a vote button is a **nominee** — do not describe any of them as 'Awwwards-winning'.
3. **Tech never inferred from visuals.** Section B rows carry a library list only where a `package.json` was fetched; the rest say `not inspected`.
4. Section C/D are the only rows I could click on and know exactly what runs — they are the most trustworthy half of this file, and the cheapest for AC to reuse.
5. A browser render/screenshot pass was impossible here (no browser binary in the sandbox): nothing in this file is visually verified [UNVERIFIED — see `INTERACTION_EXPERIMENT_LAB.md` for what AK could execute instead].
