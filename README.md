# iPhyloGeo-frontend

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production output is generated in `dist/`.

## Deploy to Vercel

This repository is configured for Vercel with SPA route rewrites via `vercel.json`.

### Option 1: Deploy from GitHub (recommended)

1. Push this repository to GitHub.
2. In Vercel, import the repository.
3. Keep or set the project settings:
	- Build Command: `npm run build`
	- Output Directory: `dist`
	- Install Command: `npm install`
4. Deploy.

### Option 2: Deploy from CLI

```bash
npm install -g vercel
vercel
```

For production deployment:

```bash
vercel --prod
```