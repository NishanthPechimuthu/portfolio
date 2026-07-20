import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── Admin User ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    12
  );
  await prisma.adminUser.upsert({
    where: { username: process.env.ADMIN_USERNAME || "admin" },
    update: { passwordHash: hashedPassword },
    create: {
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash: hashedPassword,
    },
  });
  console.log("✅ Admin user created");

  // ── Site Settings ───────────────────────────────────────────────────────────
  const settings = [
    { settingKey: "site_title", settingValue: "Nishanth — Full Stack Developer" },
    { settingKey: "meta_description", settingValue: "Full Stack Developer & UI/UX enthusiast building modern web applications with React, Node.js, and cutting-edge technologies." },
    { settingKey: "meta_keywords", settingValue: "full stack developer, react, nodejs, typescript, web development, portfolio" },
    { settingKey: "meta_author", settingValue: "Nishanth" },
    { settingKey: "og_title", settingValue: "Nishanth — Full Stack Developer" },
    { settingKey: "og_description", settingValue: "Building modern web applications" },
    { settingKey: "og_type", settingValue: "website" },
    { settingKey: "og_url", settingValue: "https://nishanth.qzz.io" },
    { settingKey: "favicon", settingValue: "" },
    { settingKey: "resume_url", settingValue: "" },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { settingKey: s.settingKey },
      update: { settingValue: s.settingValue },
      create: s,
    });
  }
  console.log("✅ Site settings seeded");

  // ── Theme ───────────────────────────────────────────────────────────────────
  await prisma.themeSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      accentColor: "#FF6B2B",
      accentLightColor: "#FF8F5C",
      displayFont: "Inter",
      bodyFont: "Inter",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
    },
  });
  console.log("✅ Theme seeded");

  // ── Hero ────────────────────────────────────────────────────────────────────
  await prisma.hero.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      availabilityText: "Open to opportunities",
      headline: "Hi, I'm <span>Nishanth</span>",
      subheadline: "Full Stack Developer crafting fast, beautiful, and accessible digital experiences with modern technologies.",
      heroImage: "https://picsum.photos/seed/nishanth/800/800",
      badgeText: "Available for work",
      ctaPrimaryText: "View my work",
      ctaPrimaryUrl: "#work",
      ctaSecondaryText: "Get in touch",
      ctaSecondaryUrl: "#contact",
      showProjectsStat: true,
      showClientsStat: true,
      showExperienceStat: true,
      stats: {
        create: [
          { statValue: "20+", statLabel: "Projects built", sortOrder: 1 },
          { statValue: "10+", statLabel: "Happy clients", sortOrder: 2 },
          { statValue: "4+", statLabel: "Years experience", sortOrder: 3 },
        ],
      },
    },
  });
  console.log("✅ Hero seeded");

  // ── Navigation ──────────────────────────────────────────────────────────────
  await prisma.navMenu.deleteMany();
  await prisma.navMenu.createMany({
    data: [
      { label: "Work", url: "#work", sortOrder: 1 },
      { label: "About", url: "#about", sortOrder: 2 },
      { label: "Blog", url: "/blog", sortOrder: 3 },
      { label: "Projects", url: "/projects", sortOrder: 4 },
      { label: "Contact", url: "#contact", sortOrder: 5 },
    ],
  });
  console.log("✅ Navigation seeded");

  // ── Services ────────────────────────────────────────────────────────────────
  await prisma.service.deleteMany();
  await prisma.service.createMany({
    data: [
      {
        title: "Full Stack Development",
        description: "End-to-end web applications using React, Node.js, and PostgreSQL. From REST APIs to real-time features.",
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>',
        sortOrder: 1, cardStyle: "dark",
      },
      {
        title: "UI/UX Design",
        description: "User-centered design with Figma. Beautiful interfaces that are accessible, responsive, and conversion-focused.",
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>',
        sortOrder: 2, cardStyle: "light",
      },
      {
        title: "API Development",
        description: "Scalable REST and GraphQL APIs with Express, authentication, rate limiting, caching, and comprehensive documentation.",
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 019-1.664M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
        sortOrder: 3, cardStyle: "light",
      },
    ],
  });
  console.log("✅ Services seeded");

  // ── About ───────────────────────────────────────────────────────────────────
  await prisma.about.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      subtitle: "About me",
      title: "A developer who<br>loves clean code",
      paragraph1: "I'm Nishanth, a full-stack developer passionate about building products that make a difference. With 4+ years of experience, I specialise in React, Node.js, and PostgreSQL — creating fast, accessible, and beautiful web applications.",
      paragraph2: "When I'm not coding, I write about web development on my blog, contribute to open source, and explore the latest in UI design. I believe great software is both functional and delightful.",
      image: "https://picsum.photos/seed/nishanth-about/700/700",
    },
  });
  console.log("✅ About seeded");

  // ── Skills ──────────────────────────────────────────────────────────────────
  await prisma.skill.deleteMany();
  const skillsData = [
    { name: "React", isFeatured: true, sortOrder: 1 },
    { name: "TypeScript", isFeatured: true, sortOrder: 2 },
    { name: "Node.js", isFeatured: true, sortOrder: 3 },
    { name: "PostgreSQL", isFeatured: true, sortOrder: 4 },
    { name: "Next.js", isFeatured: true, sortOrder: 5 },
    { name: "Tailwind CSS", isFeatured: true, sortOrder: 6 },
    { name: "GraphQL", isFeatured: false, sortOrder: 7 },
    { name: "Docker", isFeatured: false, sortOrder: 8 },
    { name: "AWS", isFeatured: false, sortOrder: 9 },
    { name: "Redis", isFeatured: false, sortOrder: 10 },
    { name: "Prisma", isFeatured: false, sortOrder: 11 },
    { name: "Framer Motion", isFeatured: false, sortOrder: 12 },
    { name: "Git", isFeatured: true, sortOrder: 13 },
    { name: "Figma", isFeatured: false, sortOrder: 14 },
    { name: "Linux", isFeatured: false, sortOrder: 15 },
  ];
  await prisma.skill.createMany({ data: skillsData });
  console.log("✅ Skills seeded");

  // ── Experience ──────────────────────────────────────────────────────────────
  await prisma.experience.deleteMany();
  await prisma.experience.createMany({
    data: [
      {
        title: "Senior Full Stack Developer",
        company: "TechCorp Solutions",
        location: "Chennai, India",
        period: "2023 — Present",
        description: "Leading development of a multi-tenant SaaS platform serving 50k+ users. Built real-time features with WebSockets, optimised DB queries reducing load times by 60%, and mentored a team of 4 junior developers.",
        isCurrent: true,
        sortOrder: 1,
      },
      {
        title: "Full Stack Developer",
        company: "StartupHub",
        location: "Bangalore, India",
        period: "2022 — 2023",
        description: "Built and launched 3 products from scratch using React and Node.js. Integrated payment gateways (Razorpay, Stripe), implemented OAuth, and set up CI/CD pipelines with GitHub Actions.",
        isCurrent: false,
        sortOrder: 2,
      },
      {
        title: "Frontend Developer",
        company: "Digital Agency Pro",
        location: "Remote",
        period: "2021 — 2022",
        description: "Delivered 15+ client websites with pixel-perfect designs. Specialised in performance optimisation, accessibility compliance (WCAG 2.1), and building reusable component libraries.",
        isCurrent: false,
        sortOrder: 3,
      },
      {
        title: "Junior Web Developer",
        company: "Freelance",
        location: "Remote",
        period: "2020 — 2021",
        description: "Developed websites and web applications for local businesses. Gained hands-on experience with PHP, MySQL, WordPress, and later transitioned to modern JavaScript frameworks.",
        isCurrent: false,
        sortOrder: 4,
      },
    ],
  });
  console.log("✅ Experience seeded");

  // ── Education ───────────────────────────────────────────────────────────────
  await prisma.education.deleteMany();
  await prisma.education.createMany({
    data: [
      {
        title: "B.E. Computer Science Engineering",
        institution: "Anna University",
        period: "2018 — 2022",
        grade: "8.4 CGPA",
        isCurrent: false,
        sortOrder: 1,
      },
      {
        title: "Higher Secondary Education",
        institution: "Government Model Higher Secondary School",
        period: "2016 — 2018",
        grade: "92%",
        isCurrent: false,
        sortOrder: 2,
      },
    ],
  });
  console.log("✅ Education seeded");

  // ── Certificates ────────────────────────────────────────────────────────────
  await prisma.certificate.deleteMany();
  await prisma.certificate.createMany({
    data: [
      { title: "Meta Frontend Developer", issuer: "Meta / Coursera", issueDate: "Jan 2024", category: "coursera", skills: "React, HTML, CSS, JavaScript", isFeatured: true, sortOrder: 1 },
      { title: "Google UX Design", issuer: "Google / Coursera", issueDate: "Mar 2023", category: "google", skills: "Figma, UX Research, Prototyping", isFeatured: true, sortOrder: 2 },
      { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", issueDate: "Jun 2023", category: "aws", skills: "AWS EC2, S3, Lambda, RDS", isFeatured: true, sortOrder: 3 },
      { title: "Node.js Application Development", issuer: "IBM / Coursera", issueDate: "Sep 2022", category: "ibm", skills: "Node.js, Express, REST APIs", isFeatured: true, sortOrder: 4 },
      { title: "PostgreSQL for Everybody", issuer: "University of Michigan", issueDate: "Nov 2022", category: "coursera", skills: "PostgreSQL, SQL, Database Design", isFeatured: true, sortOrder: 5 },
      { title: "React – The Complete Guide", issuer: "Udemy", issueDate: "Apr 2022", category: "udemy", skills: "React, Redux, Hooks, Testing", isFeatured: false, sortOrder: 6 },
      { title: "Docker & Kubernetes", issuer: "Udemy", issueDate: "Aug 2023", category: "udemy", skills: "Docker, Kubernetes, CI/CD", isFeatured: false, sortOrder: 7 },
    ],
  });
  console.log("✅ Certificates seeded");

  // ── Testimonials ─────────────────────────────────────────────────────────────
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      {
        quote: "Nishanth delivered our SaaS dashboard ahead of schedule with exceptional quality. His attention to detail and proactive communication made the entire process smooth and stress-free.",
        authorName: "Arjun Mehta",
        authorTitle: "CTO",
        authorCompany: "FlowMetrics",
        authorImage: "https://i.pravatar.cc/150?img=3",
        rating: 5, isFeatured: true, sortOrder: 1, cardStyle: "dark",
      },
      {
        quote: "The portfolio website Nishanth built for us increased our conversion rate by 40%. Clean code, beautiful design, and delivered in half the time we expected.",
        authorName: "Priya Sharma",
        authorTitle: "Marketing Director",
        authorCompany: "BrandForge",
        authorImage: "https://i.pravatar.cc/150?img=5",
        rating: 5, isFeatured: true, sortOrder: 2, cardStyle: "light",
      },
      {
        quote: "Outstanding work on our e-commerce platform. Nishanth handled everything from database design to pixel-perfect UI. Highly recommend for any serious project.",
        authorName: "Vikram Nair",
        authorTitle: "Founder",
        authorCompany: "ShopEase",
        authorImage: "https://i.pravatar.cc/150?img=8",
        rating: 5, isFeatured: true, sortOrder: 3, cardStyle: "light",
      },
      {
        quote: "Nishanth is the rare developer who thinks like a designer. The app he built for us is not just functional — it's genuinely beautiful and users love it.",
        authorName: "Lakshmi Venkat",
        authorTitle: "Product Manager",
        authorCompany: "AppVault",
        authorImage: "https://i.pravatar.cc/150?img=9",
        rating: 5, isFeatured: true, sortOrder: 4, cardStyle: "dark",
      },
    ],
  });
  console.log("✅ Testimonials seeded");

  // ── Blog Categories ──────────────────────────────────────────────────────────
  await prisma.blogCategory.deleteMany();
  const categories = await prisma.blogCategory.createManyAndReturn({
    data: [
      { name: "Web Development", slug: "web-development" },
      { name: "React & Frontend", slug: "react-frontend" },
      { name: "Backend & APIs", slug: "backend-apis" },
      { name: "UI/UX Design", slug: "ui-ux-design" },
      { name: "DevOps & Tools", slug: "devops-tools" },
    ],
  });
  console.log("✅ Blog categories seeded");

  // ── Blog Posts ───────────────────────────────────────────────────────────────
  await prisma.blogPost.deleteMany();
  const postData = [
    {
      title: "Building a Full-Stack App with React 19 and Node.js",
      slug: "fullstack-react-19-nodejs",
      excerpt: "A comprehensive guide to building modern full-stack applications using React 19's new features, concurrent rendering, and Node.js REST APIs.",
      content: "<h2>Introduction</h2><p>React 19 introduces groundbreaking features that make building full-stack applications more efficient than ever...</p>",
      categoryId: categories[0].id,
      featuredImage: "https://picsum.photos/seed/blog1/1200/630",
      readTime: "8 min read",
      isFeatured: true,
      views: 4823,
      publishedAt: new Date("2024-12-15"),
    },
    {
      title: "Mastering TypeScript Generics: A Deep Dive",
      slug: "mastering-typescript-generics",
      excerpt: "TypeScript generics are one of the most powerful features of the language. Learn how to write reusable, type-safe code with practical examples.",
      content: "<h2>What are Generics?</h2><p>Generics allow you to write flexible, reusable code that works with multiple types...</p>",
      categoryId: categories[1].id,
      featuredImage: "https://picsum.photos/seed/blog2/1200/630",
      readTime: "12 min read",
      isFeatured: true,
      views: 7241,
      publishedAt: new Date("2024-11-20"),
    },
    {
      title: "Designing APIs That Developers Love",
      slug: "designing-apis-developers-love",
      excerpt: "Great APIs are intuitive, consistent, and well-documented. Here's a guide to REST API design principles that will make your API a joy to use.",
      content: "<h2>API Design Principles</h2><p>A well-designed API is like a well-written library — it does exactly what you expect, with minimal surprises...</p>",
      categoryId: categories[2].id,
      featuredImage: "https://picsum.photos/seed/blog3/1200/630",
      readTime: "10 min read",
      isFeatured: true,
      views: 3156,
      publishedAt: new Date("2024-10-08"),
    },
    {
      title: "Framer Motion: Advanced Animation Techniques",
      slug: "framer-motion-advanced-techniques",
      excerpt: "Go beyond basic animations with Framer Motion. Learn gesture recognition, layout animations, and complex choreography for stunning UIs.",
      content: "<h2>Beyond Basic Animations</h2><p>Most tutorials cover fade-ins and slide-ups. Let's go deeper...</p>",
      categoryId: categories[1].id,
      featuredImage: "https://picsum.photos/seed/blog4/1200/630",
      readTime: "15 min read",
      views: 9102,
      publishedAt: new Date("2024-09-25"),
    },
    {
      title: "PostgreSQL Performance Tuning: From Slow to Blazing Fast",
      slug: "postgresql-performance-tuning",
      excerpt: "Optimise your PostgreSQL queries with proper indexing, EXPLAIN ANALYZE, connection pooling, and query planning strategies.",
      content: "<h2>Understanding Query Plans</h2><p>The first step to optimising any database is understanding what it's doing under the hood...</p>",
      categoryId: categories[2].id,
      featuredImage: "https://picsum.photos/seed/blog5/1200/630",
      readTime: "18 min read",
      views: 5874,
      publishedAt: new Date("2024-08-14"),
    },
    {
      title: "The Art of Micro-Interactions in Web Design",
      slug: "art-of-micro-interactions",
      excerpt: "Micro-interactions are the tiny moments that make your UI feel alive. Learn how to design and implement them without sacrificing performance.",
      content: "<h2>What Makes a Great Micro-Interaction?</h2><p>The best micro-interactions are barely noticeable — until they're gone...</p>",
      categoryId: categories[3].id,
      featuredImage: "https://picsum.photos/seed/blog6/1200/630",
      readTime: "7 min read",
      views: 2438,
      publishedAt: new Date("2024-07-30"),
    },
    {
      title: "Docker Compose for Full-Stack Development",
      slug: "docker-compose-fullstack",
      excerpt: "Set up a complete development environment with Docker Compose, including Node.js, PostgreSQL, Redis, and Nginx, all in one command.",
      content: "<h2>Why Docker Compose?</h2><p>Docker Compose solves the classic 'works on my machine' problem once and for all...</p>",
      categoryId: categories[4].id,
      featuredImage: "https://picsum.photos/seed/blog7/1200/630",
      readTime: "14 min read",
      views: 6219,
      publishedAt: new Date("2024-06-18"),
    },
    {
      title: "TanStack Query v5: The Ultimate Guide",
      slug: "tanstack-query-v5-guide",
      excerpt: "TanStack Query v5 rewrites the rules for server state management in React. Explore the new APIs, optimistic updates, and best practices.",
      content: "<h2>What's New in v5?</h2><p>TanStack Query v5 is a major release with breaking changes and powerful new features...</p>",
      categoryId: categories[1].id,
      featuredImage: "https://picsum.photos/seed/blog8/1200/630",
      readTime: "11 min read",
      views: 8934,
      publishedAt: new Date("2024-05-05"),
    },
  ];

  for (const post of postData) {
    await prisma.blogPost.create({ data: post });
  }
  console.log("✅ Blog posts seeded");

  // ── Projects ─────────────────────────────────────────────────────────────────
  await prisma.project.deleteMany();
  const projectsData = [
    {
      title: "FlowMetrics — SaaS Analytics Platform",
      slug: "flowmetrics-saas-analytics",
      description: "A multi-tenant SaaS analytics dashboard with real-time data visualisation, custom reports, and team collaboration features.",
      category: "saas",
      featuredImage: "https://picsum.photos/seed/proj1/1200/800",
      liveUrl: "https://flowmetrics.example.com",
      sourceUrl: "",
      showLive: true, showSource: false, isFeatured: true, sortOrder: 1, year: "2024",
      clientName: "FlowMetrics Inc.", roleTitle: "Lead Developer", timeline: "4 months",
      tags: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    },
    {
      title: "ShopEase — E-Commerce Platform",
      slug: "shopease-ecommerce",
      description: "Full-featured e-commerce platform with inventory management, Razorpay integration, real-time order tracking, and vendor dashboard.",
      category: "ecommerce",
      featuredImage: "https://picsum.photos/seed/proj2/1200/800",
      liveUrl: "https://shopease.example.com",
      sourceUrl: "https://github.com/np/shopease",
      showLive: true, showSource: true, isFeatured: true, sortOrder: 2, year: "2024",
      clientName: "ShopEase Ltd.", roleTitle: "Full Stack Developer", timeline: "3 months",
      tags: ["React", "Express", "PostgreSQL", "Razorpay"],
    },
    {
      title: "DevPortal — Developer Documentation Hub",
      slug: "devportal-docs",
      description: "An open-source documentation platform with MDX support, live code examples, search, and versioning for API documentation.",
      category: "saas",
      featuredImage: "https://picsum.photos/seed/proj3/1200/800",
      liveUrl: "https://devportal.example.com",
      sourceUrl: "https://github.com/np/devportal",
      showLive: true, showSource: true, isFeatured: true, sortOrder: 3, year: "2023",
      roleTitle: "Solo Developer", timeline: "2 months",
      tags: ["Next.js", "TypeScript", "MDX", "Tailwind CSS"],
    },
    {
      title: "TaskFlow — Project Management Tool",
      slug: "taskflow-project-management",
      description: "Kanban-style project management tool with real-time collaboration, time tracking, and Slack/email integrations.",
      category: "saas",
      featuredImage: "https://picsum.photos/seed/proj4/1200/800",
      liveUrl: "https://taskflow.example.com",
      sourceUrl: "",
      showLive: true, showSource: false, isFeatured: false, sortOrder: 4, year: "2023",
      clientName: "Startup XYZ", roleTitle: "Full Stack Developer", timeline: "5 months",
      tags: ["React", "Node.js", "WebSocket", "Redis"],
    },
    {
      title: "BrandForge — Agency Landing Page",
      slug: "brandforge-agency",
      description: "Premium agency website with custom animations, case studies, contact forms, and CMS integration for the marketing team.",
      category: "landing",
      featuredImage: "https://picsum.photos/seed/proj5/1200/800",
      liveUrl: "https://brandforge.example.com",
      sourceUrl: "",
      showLive: true, showSource: false, isFeatured: false, sortOrder: 5, year: "2023",
      clientName: "BrandForge Agency", roleTitle: "Frontend Developer", timeline: "6 weeks",
      tags: ["React", "Framer Motion", "Tailwind CSS", "Sanity CMS"],
    },
  ];

  for (const { tags, ...proj } of projectsData) {
    await prisma.project.create({
      data: {
        ...proj,
        tags: { create: tags.map((t) => ({ tagName: t })) },
      },
    });
  }
  console.log("✅ Projects seeded");

  // ── Contact Section ──────────────────────────────────────────────────────────
  await prisma.contactSection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      subtitle: "Get in touch",
      title: "Let's work<br>together",
      description: "Have a project in mind or just want to chat? I'm always open to discussing new opportunities, creative ideas, or ways to build something amazing together.",
    },
  });

  // ── Contact Info ─────────────────────────────────────────────────────────────
  await prisma.contactInfo.deleteMany();
  await prisma.contactInfo.createMany({
    data: [
      { type: "email", label: "np@nishanth.qzz.io", url: "mailto:np@nishanth.qzz.io", iconClass: "fas fa-envelope", sortOrder: 1 },
      { type: "github", label: "github.com/nishanth", url: "https://github.com/nishanth", iconClass: "fab fa-github", sortOrder: 2 },
      { type: "linkedin", label: "linkedin.com/in/nishanth", url: "https://linkedin.com/in/nishanth", iconClass: "fab fa-linkedin", sortOrder: 3 },
      { type: "twitter", label: "@nishanth_dev", url: "https://twitter.com/nishanth_dev", iconClass: "fab fa-twitter", sortOrder: 4 },
    ],
  });
  console.log("✅ Contact info seeded");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
