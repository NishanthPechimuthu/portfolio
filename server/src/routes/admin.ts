import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middleware/auth";
import { uploadImage, uploadFile, getFileUrl } from "../middleware/upload";
import { slugify, generateShareKey, paginate } from "../utils/helpers";
import { sendEmail } from "../utils/email";
import axios from "axios";

const router = Router();
router.use(authenticate);

// ── DASHBOARD ────────────────────────────────────────────────────────────────
router.get("/dashboard", async (_req: Request, res: Response) => {
  const [projects, blogPosts, messages, unreadMessages, certificates, skills] = await Promise.all([
    prisma.project.count(),
    prisma.blogPost.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.certificate.count(),
    prisma.skill.count(),
  ]);
  const recentMessages = await prisma.contactMessage.findMany({ take: 5, orderBy: { createdAt: "desc" } });
  res.json({ projects, blogPosts, messages, unreadMessages, certificates, skills, recentMessages });
});

// ── SETTINGS ─────────────────────────────────────────────────────────────────
router.get("/settings", async (_req: Request, res: Response) => {
  const rows = await prisma.siteSetting.findMany();
  res.json(Object.fromEntries(rows.map((r) => [r.settingKey, r.settingValue])));
});

router.put("/settings", async (req: Request, res: Response) => {
  const data: Record<string, string> = req.body;
  
  if (data.resume_latex && data.resume_latex.trim().length > 0) {
    try {
      const response = await axios.post("https://texlive.net/cgi-bin/latexcgi", {
        "filecontents[]": data.resume_latex,
        "filename[]": "document.tex",
        engine: "pdflatex",
        return: "pdf"
      }, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "arraybuffer"
      });

      const buffer = Buffer.from(response.data);
      if (buffer.toString('utf8', 0, 5) === '%PDF-') {
        const uploadDir = process.env.UPLOAD_DIR || "./uploads";
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        
        const pdfFileName = "resume_latex.pdf";
        const pdfPath = path.join(uploadDir, pdfFileName);
        fs.writeFileSync(pdfPath, buffer);
        
        data.resume_pdf_url = `/uploads/${pdfFileName}`;
      } else {
        throw new Error("LaTeX compilation failed due to syntax errors.");
      }
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  for (const [key, value] of Object.entries(data)) {
    await prisma.siteSetting.upsert({ where: { settingKey: key }, update: { settingValue: value }, create: { settingKey: key, settingValue: value } });
  }
  res.json({ success: true });
});

// ── THEME ─────────────────────────────────────────────────────────────────────
router.get("/theme", async (_req: Request, res: Response) => {
  const theme = await prisma.themeSetting.findUnique({ where: { id: 1 } });
  res.json(theme);
});

router.put("/theme", async (req: Request, res: Response) => {
  const { accentColor, accentLightColor, displayFont, bodyFont } = req.body;
  const displayEnc = (displayFont as string).replace(/ /g, "+");
  const bodyEnc = (bodyFont as string).replace(/ /g, "+");
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${displayEnc}:wght@400;700&family=${bodyEnc}:wght@300;400;500&display=swap`;
  const theme = await prisma.themeSetting.upsert({
    where: { id: 1 },
    update: { accentColor, accentLightColor, displayFont, bodyFont, googleFontsUrl },
    create: { id: 1, accentColor, accentLightColor, displayFont, bodyFont, googleFontsUrl },
  });
  res.json(theme);
});

// ── HERO ──────────────────────────────────────────────────────────────────────
router.get("/hero", async (_req: Request, res: Response) => {
  const hero = await prisma.hero.findUnique({ where: { id: 1 }, include: { stats: { orderBy: { sortOrder: "asc" } } } });
  res.json(hero);
});

router.put("/hero", async (req: Request, res: Response) => {
  const { stats, ...heroData } = req.body;
  const hero = await prisma.hero.upsert({
    where: { id: 1 },
    update: heroData,
    create: { id: 1, ...heroData },
  });
  if (stats) {
    await prisma.heroStat.deleteMany({ where: { heroId: 1 } });
    await prisma.heroStat.createMany({ data: stats.map((s: Record<string, unknown>) => ({ ...s, heroId: 1 })) });
  }
  res.json({ success: true, hero });
});

// ── NAVIGATION ────────────────────────────────────────────────────────────────
crudRoutes(router, "/menu", prisma.navMenu,
  (b) => ({ label: b.label as string, url: b.url as string, sortOrder: b.sortOrder as number ?? 0, isActive: b.isActive as boolean ?? true }),
  (b) => ({ label: b.label as string, url: b.url as string, sortOrder: b.sortOrder as number ?? 0, isActive: b.isActive as boolean ?? true })
);

// Generic CRUD factory
function crudRoutes<T>(
  r: Router,
  path: string,
  model: { findMany: Function; create: Function; update: Function; delete: Function; count?: Function },
  getCreateData: (body: Record<string, unknown>) => Record<string, unknown>,
  getUpdateData: (body: Record<string, unknown>) => Record<string, unknown>,
  findManyArgs: () => Record<string, unknown> = () => ({ orderBy: { sortOrder: "asc" } })
) {
  r.get(path, async (_req: Request, res: Response) => {
    try { res.json(await model.findMany(findManyArgs())); } catch { res.status(500).json({ error: "Fetch failed" }); }
  });
  r.post(path, async (req: Request, res: Response) => {
    try { const item = await model.create({ data: getCreateData(req.body) }); res.json({ success: true, item }); } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
  });
  r.put(`${path}/:id`, async (req: Request, res: Response) => {
    try { const item = await model.update({ where: { id: +req.params.id }, data: getUpdateData(req.body) }); res.json({ success: true, item }); } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
  });
  r.delete(`${path}/:id`, async (req: Request, res: Response) => {
    try { await model.delete({ where: { id: +req.params.id } }); res.json({ success: true }); } catch { res.status(400).json({ error: "Delete failed" }); }
  });
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
crudRoutes(router, "/services", prisma.service,
  (b) => ({ title: b.title, description: b.description, iconSvg: b.iconSvg, sortOrder: b.sortOrder ?? 0, isFeatured: b.isFeatured ?? true, isVisible: b.isVisible ?? true, cardStyle: b.cardStyle ?? "light" }),
  (b) => ({ title: b.title, description: b.description, iconSvg: b.iconSvg, sortOrder: b.sortOrder ?? 0, isFeatured: b.isFeatured ?? true, isVisible: b.isVisible ?? true, cardStyle: b.cardStyle ?? "light" })
);

// ── PROJECTS ──────────────────────────────────────────────────────────────────
router.get("/projects", async (req: Request, res: Response) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const { skip, take } = paginate(+page, +limit);
  const [projects, total] = await Promise.all([
    prisma.project.findMany({ skip, take, orderBy: { sortOrder: "asc" }, include: { tags: true } }),
    prisma.project.count(),
  ]);
  res.json({ projects, total });
});

router.post("/projects", async (req: Request, res: Response) => {
  try {
    const { tags, ...data } = req.body;
    const slug = slugify(data.title);

    const formattedTags = Array.isArray(tags) 
      ? tags.map((t: any) => typeof t === 'object' ? t.tagName : t).filter(Boolean)
      : [];

    const project = await prisma.project.create({
      data: { ...data, slug, tags: { create: formattedTags.map((t: string) => ({ tagName: t })) } },
      include: { tags: true },
    });
    res.json({ success: true, project });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.put("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { tags, ...data } = req.body;
    const slug = slugify(data.title);
    
    // Handle tags format from frontend (could be array of strings or array of objects)
    const formattedTags = Array.isArray(tags) 
      ? tags.map((t: any) => typeof t === 'object' ? t.tagName : t).filter(Boolean)
      : [];

    await prisma.projectTag.deleteMany({ where: { projectId: +req.params.id } });
    const project = await prisma.project.update({
      where: { id: +req.params.id },
      data: { ...data, slug, tags: { create: formattedTags.map((t: string) => ({ tagName: t })) } },
      include: { tags: true },
    });
    res.json({ success: true, project });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.delete("/projects/:id", async (req: Request, res: Response) => {
  await prisma.project.delete({ where: { id: +req.params.id } });
  res.json({ success: true });
});

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
crudRoutes(router, "/testimonials", prisma.testimonial,
  (b) => ({ quote: b.quote, authorName: b.authorName, authorTitle: b.authorTitle, authorCompany: b.authorCompany, authorImage: b.authorImage, rating: b.rating ?? 5, isFeatured: b.isFeatured ?? true, sortOrder: b.sortOrder ?? 0, cardStyle: b.cardStyle ?? "light" }),
  (b) => ({ quote: b.quote, authorName: b.authorName, authorTitle: b.authorTitle, authorCompany: b.authorCompany, authorImage: b.authorImage, rating: b.rating ?? 5, isFeatured: b.isFeatured ?? true, sortOrder: b.sortOrder ?? 0, cardStyle: b.cardStyle ?? "light" })
);

// ── BLOG ──────────────────────────────────────────────────────────────────────
router.get("/blog", async (req: Request, res: Response) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const { skip, take } = paginate(+page, +limit);
  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({ skip, take, orderBy: { publishedAt: "desc" }, include: { category: true } }),
    prisma.blogPost.count(),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  res.json({ posts, total, categories });
});

router.post("/blog", async (req: Request, res: Response) => {
  try {
    const slug = slugify(req.body.title);
    const post = await prisma.blogPost.create({ data: { ...req.body, slug }, include: { category: true } });
    res.json({ success: true, post });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.put("/blog/:id", async (req: Request, res: Response) => {
  try {
    const slug = slugify(req.body.title);
    const post = await prisma.blogPost.update({ where: { id: +req.params.id }, data: { ...req.body, slug }, include: { category: true } });
    res.json({ success: true, post });
  } catch (e: unknown) { res.status(400).json({ error: (e as Error).message }); }
});

router.delete("/blog/:id", async (req: Request, res: Response) => {
  await prisma.blogPost.delete({ where: { id: +req.params.id } });
  res.json({ success: true });
});

// ── BLOG CATEGORIES ───────────────────────────────────────────────────────────
crudRoutes(router, "/blog-categories", prisma.blogCategory,
  (b) => ({ name: b.name as string, slug: slugify(b.name as string) }),
  (b) => ({ name: b.name as string, slug: slugify(b.name as string) }),
  () => ({ orderBy: { name: "asc" } })
);

// ── EXPERIENCE ────────────────────────────────────────────────────────────────
crudRoutes(router, "/experience", prisma.experience,
  (b) => ({ title: b.title, company: b.company, location: b.location, period: b.period, description: b.description, logo: b.logo ?? "", isCurrent: b.isCurrent ?? false, sortOrder: b.sortOrder ?? 0 }),
  (b) => ({ title: b.title, company: b.company, location: b.location, period: b.period, description: b.description, logo: b.logo ?? "", isCurrent: b.isCurrent ?? false, sortOrder: b.sortOrder ?? 0 })
);

// ── EDUCATION ─────────────────────────────────────────────────────────────────
crudRoutes(router, "/education", prisma.education,
  (b) => ({ title: b.title, institution: b.institution, period: b.period, grade: b.grade, logo: b.logo ?? "", isCurrent: b.isCurrent ?? false, sortOrder: b.sortOrder ?? 0 }),
  (b) => ({ title: b.title, institution: b.institution, period: b.period, grade: b.grade, logo: b.logo ?? "", isCurrent: b.isCurrent ?? false, sortOrder: b.sortOrder ?? 0 })
);

// ── CERTIFICATES ──────────────────────────────────────────────────────────────
crudRoutes(router, "/certificates", prisma.certificate,
  (b) => ({ title: b.title, issuer: b.issuer, issueDate: b.issueDate, credentialId: b.credentialId, credentialUrl: b.credentialUrl, imageUrl: b.imageUrl, logo: b.logo ?? "", category: b.category ?? "coursera", skills: b.skills, isFeatured: b.isFeatured ?? false, sortOrder: b.sortOrder ?? 0 }),
  (b) => ({ title: b.title, issuer: b.issuer, issueDate: b.issueDate, credentialId: b.credentialId, credentialUrl: b.credentialUrl, imageUrl: b.imageUrl, logo: b.logo ?? "", category: b.category ?? "coursera", skills: b.skills, isFeatured: b.isFeatured ?? false, sortOrder: b.sortOrder ?? 0 })
);

// ── SKILLS ────────────────────────────────────────────────────────────────────
crudRoutes(router, "/skills", prisma.skill,
  (b) => ({ name: b.name, isFeatured: b.isFeatured ?? true, iconType: b.iconType ?? "class", iconNetwork: b.iconNetwork ?? "fontawesome", iconClass: b.iconClass ?? "", iconImage: b.iconImage ?? "", sortOrder: b.sortOrder ?? 0 }),
  (b) => ({ name: b.name, isFeatured: b.isFeatured ?? true, iconType: b.iconType ?? "class", iconNetwork: b.iconNetwork ?? "fontawesome", iconClass: b.iconClass ?? "", iconImage: b.iconImage ?? "", sortOrder: b.sortOrder ?? 0 })
);

// ── ABOUT ─────────────────────────────────────────────────────────────────────
router.get("/about", async (_req: Request, res: Response) => {
  res.json(await prisma.about.findUnique({ where: { id: 1 } }));
});
router.put("/about", async (req: Request, res: Response) => {
  const a = await prisma.about.upsert({ where: { id: 1 }, update: req.body, create: { id: 1, ...req.body } });
  res.json({ success: true, about: a });
});

// ── CONTACT SECTION ───────────────────────────────────────────────────────────
router.get("/contact-section", async (_req: Request, res: Response) => {
  res.json(await prisma.contactSection.findUnique({ where: { id: 1 } }));
});
router.put("/contact-section", async (req: Request, res: Response) => {
  const s = await prisma.contactSection.upsert({ where: { id: 1 }, update: req.body, create: { id: 1, ...req.body } });
  res.json({ success: true, section: s });
});

// ── CONTACT INFO (Social Links) ───────────────────────────────────────────────
crudRoutes(router, "/contact-info", prisma.contactInfo,
  (b) => ({ type: "social", label: b.platform as string, url: b.url as string, iconClass: b.iconClass as string, sortOrder: b.sortOrder as number ?? 0 }),
  (b) => ({ type: "social", label: b.platform as string, url: b.url as string, iconClass: b.iconClass as string, sortOrder: b.sortOrder as number ?? 0 })
);

// ── MESSAGES ──────────────────────────────────────────────────────────────────
router.get("/messages", async (req: Request, res: Response) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const { skip, take } = paginate(+page, +limit);
  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.count(),
  ]);
  res.json({ messages, total });
});

router.put("/messages/:id/read", async (req: Request, res: Response) => {
  await prisma.contactMessage.update({ where: { id: +req.params.id }, data: { isRead: true } });
  res.json({ success: true });
});

router.post("/messages/:id/reply", async (req: Request, res: Response) => {
  try {
    const message = await prisma.contactMessage.findUnique({ where: { id: +req.params.id } });
    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    const { subject, content } = req.body;
    if (!subject || !content) {
      res.status(400).json({ error: "Subject and content are required" });
      return;
    }

    const signatureSetting = await prisma.siteSetting.findUnique({ where: { settingKey: "email_signature" } });
    const finalContent = signatureSetting && signatureSetting.settingValue 
      ? `${content}<br><br>${signatureSetting.settingValue}` 
      : content;

    const result = await sendEmail({
      to: message.email,
      subject,
      html: finalContent,
    });

    // Mark as read after replying
    await prisma.contactMessage.update({ where: { id: message.id }, data: { isRead: true } });

    res.json({ success: true, result });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete("/messages/:id", async (req: Request, res: Response) => {
  await prisma.contactMessage.delete({ where: { id: +req.params.id } });
  res.json({ success: true });
});

// ── UPLOAD ────────────────────────────────────────────────────────────────────
router.post("/upload", uploadImage("").single("file"), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const subdir = (req.body.subdir as string) || "";
  res.json({ success: true, url: getFileUrl(req.file.filename, subdir) });
});

router.post("/upload/file", uploadFile("").single("file"), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const subdir = (req.body.subdir as string) || "files";
  res.json({ success: true, url: getFileUrl(req.file.filename, subdir), filename: req.file.filename });
});

// ── TEMP SHARE ────────────────────────────────────────────────────────────────
router.get("/share", async (_req: Request, res: Response) => {
  const now = new Date();
  const expired = await prisma.sharedFile.findMany({ where: { expiresAt: { lt: now } } });
  for (const f of expired) {
    const fp = path.join(process.env.UPLOAD_DIR || "./uploads", f.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  if (expired.length) await prisma.sharedFile.deleteMany({ where: { expiresAt: { lt: now } } });
  const files = await prisma.sharedFile.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, fileKey: true, originalName: true, fileSize: true, expiresAt: true, createdAt: true, passwordHash: true } });
  res.json(files.map((f) => ({ ...f, isProtected: !!f.passwordHash, passwordHash: undefined })));
});

router.post("/share", uploadFile("temp_share").single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const password = req.body.password as string | undefined;
    const expiryHours = Math.min(Number(req.body.expiry || 24), Number(process.env.SHARE_MAX_EXPIRY_HOURS || 168));
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const key = generateShareKey();
    const expiresAt = new Date(Date.now() + expiryHours * 3600 * 1000);
    await prisma.sharedFile.create({
      data: {
        fileKey: key,
        filename: `temp_share/${req.file.filename}`,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        passwordHash,
        expiresAt,
      },
    });
    res.json({ success: true, key, url: `/share/${key}`, expiresAt });
  } catch (e: unknown) { res.status(500).json({ error: (e as Error).message }); }
});

router.delete("/share/:id", async (req: Request, res: Response) => {
  try {
    const file = await prisma.sharedFile.findUnique({ where: { id: +req.params.id } });
    if (file) {
      const fp = path.join(process.env.UPLOAD_DIR || "./uploads", file.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      await prisma.sharedFile.delete({ where: { id: file.id } });
    }
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Delete failed" }); }
});

// ── MEDIA LIBRARY ─────────────────────────────────────────────────────────────
router.get("/media", async (_req: Request, res: Response) => {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  if (!fs.existsSync(uploadDir)) { res.json([]); return; }
  const files = fs.readdirSync(uploadDir)
    .filter((f) => fs.statSync(path.join(uploadDir, f)).isFile())
    .map((f) => {
      const stat = fs.statSync(path.join(uploadDir, f));
      return { name: f, url: getFileUrl(f), size: stat.size, time: stat.mtimeMs };
    })
    .sort((a, b) => b.time - a.time);
  res.json(files);
});

router.put("/media/rename", async (req: Request, res: Response) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) {
    res.status(400).json({ error: "Missing oldName or newName" });
    return;
  }
  const safeOld = path.basename(decodeURIComponent(oldName));
  const safeNew = path.basename(decodeURIComponent(newName)).replace(/[^a-zA-Z0-9.\-_]/g, '-');
  
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const oldPath = path.join(uploadDir, safeOld);
  const newPath = path.join(uploadDir, safeNew);

  if (!fs.existsSync(oldPath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  
  try {
    fs.renameSync(oldPath, newPath);
    res.json({ success: true, newName: safeNew, url: getFileUrl(safeNew) });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete("/media/:filename", (req: Request, res: Response) => {
  const safe = path.basename(decodeURIComponent(req.params.filename));
  const fp = path.join(process.env.UPLOAD_DIR || "./uploads", safe);
  if (fs.existsSync(fp)) { fs.unlinkSync(fp); res.json({ success: true }); }
  else { res.status(404).json({ error: "File not found" }); }
});

export default router;
