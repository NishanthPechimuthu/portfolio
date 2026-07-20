import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { paginate } from "../utils/helpers";
import path from "path";
import fs from "fs";
import axios from "axios";

const router = Router();

// GET /api/public/home — all homepage data in one shot
router.get("/home", async (_req: Request, res: Response) => {
  try {
    const [
      settings,
      theme,
      hero,
      services,
      featuredProjects,
      about,
      skills,
      testimonials,
      blogPosts,
      experiences,
      educations,
      featuredCerts,
      contactSection,
      contactLinks,
    ] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.themeSetting.findUnique({ where: { id: 1 } }),
      prisma.hero.findUnique({ where: { id: 1 }, include: { stats: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } } }),
      prisma.service.findMany({ where: { isVisible: true }, orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ where: { isFeatured: true }, take: 3, orderBy: { sortOrder: "asc" }, include: { tags: true } }),
      prisma.about.findUnique({ where: { id: 1 } }),
      prisma.skill.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, take: 3, orderBy: { publishedAt: "desc" }, include: { category: true } }),
      prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.certificate.findMany({ where: { isFeatured: true }, take: 5, orderBy: { sortOrder: "asc" } }),
      prisma.contactSection.findUnique({ where: { id: 1 } }),
      prisma.contactInfo.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const settingsMap = Object.fromEntries(settings.map((s) => [s.settingKey, s.settingValue]));
    const totalProjects = await prisma.project.count();
    const totalTestimonials = await prisma.testimonial.count();

    res.json({
      settings: settingsMap,
      theme,
      hero,
      services,
      featuredProjects,
      about,
      skills,
      testimonials,
      blogPosts,
      experiences,
      educations,
      featuredCerts,
      contactSection,
      contactLinks,
      stats: { totalProjects, totalClients: totalTestimonials },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load homepage data" });
  }
});

// GET /api/public/projects?category=&page=&limit=
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const { category, page = "1", limit = "12" } = req.query as Record<string, string>;
    const { skip, take } = paginate(+page, +limit);
    const where = category ? { category } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({ where, skip, take, orderBy: { sortOrder: "asc" }, include: { tags: true } }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total, page: +page, limit: take });
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/public/projects/:slug
router.get("/projects/:slug", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug as string },
      include: { tags: true },
    });
    if (!project) { res.status(404).json({ error: "Project not found" }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// GET /api/public/blog?category=&page=&limit=&search=
router.get("/blog", async (req: Request, res: Response) => {
  try {
    const { category, page = "1", limit = "9", search } = req.query as Record<string, string>;
    const { skip, take } = paginate(+page, +limit);

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = { is: { slug: category } };
    if (search) where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];

    const [posts, total, categories] = await Promise.all([
      prisma.blogPost.findMany({ where, skip, take, orderBy: { publishedAt: "desc" }, include: { category: true } }),
      prisma.blogPost.count({ where }),
      prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    ]);

    res.json({ posts, total, page: +page, limit: take, categories });
  } catch {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// GET /api/public/blog/:slug
router.get("/blog/:slug", async (req: Request, res: Response) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug as string, isPublished: true },
      include: { category: true },
    });
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(post);
  } catch {
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// POST /api/public/blog/:slug/view — track unique view via cookie
router.post("/blog/:slug/view", async (req: Request, res: Response) => {
  try {
    const cookieKey = `viewed_${req.params.slug}`;
    const maxAge = Number(process.env.VIEW_COOKIE_MAX_AGE_HOURS || 24) * 3600 * 1000;

    if (req.cookies[cookieKey]) {
      // Already viewed — return current count without incrementing
      const post = await prisma.blogPost.findUnique({
        where: { slug: req.params.slug as string },
        select: { views: true },
      });
      res.json({ views: post?.views ?? 0, counted: false });
      return;
    }

    const updated = await prisma.blogPost.update({
      where: { slug: req.params.slug as string },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    res.cookie(cookieKey, "1", { maxAge, httpOnly: true, sameSite: "lax" });
    res.json({ views: updated.views, counted: true });
  } catch {
    res.status(500).json({ error: "Failed to track view" });
  }
});

// GET /api/public/certifications
router.get("/certifications", async (_req: Request, res: Response) => {
  try {
    const certs = await prisma.certificate.findMany({ orderBy: { sortOrder: "asc" } });
    res.json(certs);
  } catch {
    res.status(500).json({ error: "Failed to fetch certifications" });
  }
});

// POST /api/public/contact
router.post("/contact", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(200),
      subject: z.string().max(300).optional(),
      message: z.string().min(1).max(5000),
    });
    const data = schema.parse(req.body);
    await prisma.contactMessage.create({ data });
    res.json({ success: true, message: "Message received, thank you!" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", issues: err.errors });
      return;
    }
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/public/share/:key
router.get("/share/:key", async (req: Request, res: Response) => {
  try {
    const file = await prisma.sharedFile.findUnique({ where: { fileKey: req.params.key as string } });
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    if (new Date() > file.expiresAt) {
      const fp = path.join(process.env.UPLOAD_DIR || "./uploads", file.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      await prisma.sharedFile.delete({ where: { id: file.id } });
      res.status(410).json({ error: "File has expired" });
      return;
    }
    res.json({
      originalName: file.originalName,
      fileSize: file.fileSize,
      expiresAt: file.expiresAt,
      isProtected: !!file.passwordHash,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch share info" });
  }
});

// POST /api/public/share/:key/download
router.post("/share/:key/download", async (req: Request, res: Response) => {
  try {
    const file = await prisma.sharedFile.findUnique({ where: { fileKey: req.params.key as string } });
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    if (new Date() > file.expiresAt) { res.status(410).json({ error: "File has expired" }); return; }

    if (file.passwordHash) {
      const { password } = req.body;
      const bcrypt = await import("bcryptjs");
      if (!password || !(await bcrypt.compare(password, file.passwordHash))) {
        res.status(403).json({ error: "Incorrect password" });
        return;
      }
    }

    const fp = path.join(process.env.UPLOAD_DIR || "./uploads", file.filename);
    if (!fs.existsSync(fp)) { res.status(404).json({ error: "File missing from server" }); return; }

    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Length", file.fileSize);
    fs.createReadStream(fp).pipe(res);
  } catch {
    res.status(500).json({ error: "Download failed" });
  }
});

// GET /api/public/nav
router.get("/nav", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.navMenu.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch nav" });
  }
});

// GET /api/public/resume/download
router.get("/resume/download", async (req: Request, res: Response) => {
  try {
    const latexSetting = await prisma.siteSetting.findUnique({ where: { settingKey: "resume_latex" } });
    const latexCode = latexSetting?.settingValue;
    if (!latexCode) {
      res.status(404).json({ error: "LaTeX resume content not found" });
      return;
    }

    const response = await axios.post("https://texlive.net/cgi-bin/latexcgi", {
      "filecontents[]": latexCode,
      "filename[]": "document.tex",
      engine: "pdflatex",
      return: "pdf"
    }, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      responseType: "stream"
    });

    const isInline = req.query.inline === 'true';
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${isInline ? 'inline' : 'attachment'}; filename="resume.pdf"`);
    response.data.pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to compile LaTeX: " + err.message });
  }
});

// GET /api/public/sitemap.xml
router.get("/sitemap.xml", async (_req: Request, res: Response) => {
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

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
