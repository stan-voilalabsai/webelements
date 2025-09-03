/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true'
const repo = 'webelements' // 

export default {
  output: 'export',                // static export (goes to ./out)
  images: { unoptimized: true },   // needed on GitHub Pages
  basePath: isPages ? `/${repo}` : undefined,   // correct paths when under /repo
  assetPrefix: isPages ? `/${repo}/` : undefined
}
