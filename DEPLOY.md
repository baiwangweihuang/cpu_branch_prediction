# 部署到 Cloudflare Pages

这个项目是纯静态 Vite/React 站点：构建产物在 `dist/`，不需要后端服务。

## 一键/半一键发布

方式 A：连接 Git 仓库（推荐，push 自动发布）

1. Cloudflare Dashboard → `Workers & Pages` → `Create` → `Pages` → `Connect to Git`。
2. 选择仓库后设置：
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION=20`
3. 保存后，Cloudflare 会给一个 `https://<project>.pages.dev` 地址；之后 push 到绑定分支会自动重新部署。

方式 B：直接上传 `dist`

```bash
npm run build
```

然后在 `Workers & Pages → Create → Pages → Upload assets` 上传 `dist/` 目录。

## 自定义域名 DNS 检查清单

1. Pages 项目 → `Custom domains` → `Set up a custom domain`，输入例如 `branch.example.com`。
2. 如果域名 DNS 已托管在 Cloudflare：通常会自动添加 `CNAME branch -> <project>.pages.dev`，保持 Proxied 橙色云。
3. 如果 DNS 在其他厂商：添加 `CNAME` 记录，主机记录 `branch`，值 `<project>.pages.dev`；不要对同一主机名同时放冲突的 `A`/`CNAME`。
4. 根域名/apex（如 `example.com`）：优先把 DNS 迁到 Cloudflare 用 CNAME flattening；不能迁时按 DNS 厂商支持用 `ALIAS`/`ANAME` 指向 `<project>.pages.dev`。
5. SSL/TLS：Cloudflare 里用 `Full` 或 `Full (strict)`；开启 `Always Use HTTPS`；等证书状态从 Pending 变 Active。
6. 验证：`dig CNAME branch.example.com`、`curl -I https://branch.example.com`、检查是否 301 到 HTTPS、证书域名是否匹配。
7. 常见问题：DNS 未生效先查 TTL/缓存；522/523 多为源站或 DNS 指向错误；证书一直 Pending 检查 CNAME 是否被灰云/DNSSEC/冲突记录影响。

## SPA 深链接

已放 `public/_redirects`：

```txt
/* /index.html 200
```

当前站点只有单页；以后加多路由时，Cloudflare Pages 会把深链接回退到 `index.html`。
