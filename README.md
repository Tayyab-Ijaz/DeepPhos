# DeepPhos Frontend — GitHub + Vercel Deployment

React 18 + Vite + TypeScript frontend for the DeepPhos phosphorylation meta-database.

## Deploy to Vercel

### 1. Push this folder to GitHub

```bash
cd deepphos-frontend
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/deepphos-frontend.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Add environment variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend.alibaba.com`
5. Click **Deploy**

`vercel.json` is already configured — no extra settings needed.

---

## Local development

```bash
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:8000
npm run dev                 # → http://localhost:5173
```

## Build

```bash
npm run build               # output → dist/
```

---

## Project structure

```
src/
├── api/client.ts           # axios API client (reads VITE_API_URL)
├── components/
│   ├── charts/             # Recharts stat charts
│   ├── layout/             # Navbar, Sidebar, Footer
│   └── ui/                 # Badge, LoadingSpinner, EvidenceBar
├── pages/                  # Home, Browse, ProteinExplorer, SiteDetail, Batch, About
├── types/index.ts
└── utils/format.ts
public/
├── banner.png
├── lablogo.png
├── pipeline_flowchart.png
└── favicon.svg
```
