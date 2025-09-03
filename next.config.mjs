/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true'
const repo = 'YOUR_REPO_NAME' // ← change this

export default {
  output: 'export',                // static export (goes to ./out)
  images: { unoptimized: true },   // needed on GitHub Pages
  basePath: isPages ? `/${repo}` : undefined,   // correct paths when under /repo
  assetPrefix: isPages ? `/${repo}/` : undefined
}
