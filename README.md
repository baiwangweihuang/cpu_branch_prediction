# 分支预测器动画实验室

一个用 React + TypeScript + Vite + Tailwind 做的本地可视化网站：用动画展示 1-bit、2-bit 饱和计数器、Bimodal、Local/Global History、gshare、Tournament、TAGE、Perceptron，以及 BTB/RAS/间接目标预测的实现直觉。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-auto%20deploy-222?logo=github)](https://github.com/baiwangweihuang/cpu_branch_prediction/actions/workflows/deploy-pages.yml)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-ready-F38020?logo=cloudflare&logoColor=white)](./DEPLOY.md)
[![Build](https://img.shields.io/badge/build-npm%20run%20build-0ea5e9)](./package.json)

仓库地址：<https://github.com/baiwangweihuang/cpu_branch_prediction>

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

产物在 `dist/`，是纯静态文件。

## 部署

- GitHub Pages：已内置 `.github/workflows/deploy-pages.yml`。push 到 `main` 后自动构建并发布；仓库 `Settings → Pages` 的 Source 选 `GitHub Actions`。
- Cloudflare Pages：见 [DEPLOY.md](./DEPLOY.md)。Build command `npm run build`，Output `dist`，环境变量 `NODE_VERSION=20`。
- Vercel / Netlify：已分别内置 `vercel.json` 与 `netlify.toml`，导入仓库后按默认 Vite 静态站点识别即可。
