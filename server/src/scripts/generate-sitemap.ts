import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function generateSitemap() {
  try {
    const baseUrl = process.env.CORS_ORIGIN || "https://nishanth.qzz.io";
    const [projects, posts] = await Promise.all([
      prisma.project.findMany({ select: { slug: true } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true } }),
    ]);

    const urls = [
      `${baseUrl}/`,
      `${baseUrl}/projects`,
      `${baseUrl}/blog`,
      `${baseUrl}/certifications`,
      ...projects.map((p) => `${baseUrl}/project/${p.slug}`),
      ...posts.map((p) => `${baseUrl}/blog/${p.slug}`),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`).join("\n")}
</urlset>`;

    const distPath = path.join(__dirname, "../../../client/dist/sitemap.xml");
    const publicPath = path.join(__dirname, "../../../client/public/sitemap.xml");

    if (fs.existsSync(path.join(__dirname, "../../../client/dist"))) {
      fs.writeFileSync(distPath, sitemap);
      console.log(`✅ Sitemap written to ${distPath}`);
    }
    if (fs.existsSync(path.join(__dirname, "../../../client/public"))) {
      fs.writeFileSync(publicPath, sitemap);
      console.log(`✅ Sitemap written to ${publicPath}`);
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateSitemap();
