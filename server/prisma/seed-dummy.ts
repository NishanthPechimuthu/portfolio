import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { slugify } from '../src/utils/helpers'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding dummy data...')

  // 1. Hero
  await prisma.hero.upsert({
    where: { id: 1 },
    update: {
      availabilityText: 'Available for work',
      headline: 'Hi, I am Nishanth',
      subheadline: 'A Full Stack Developer passionate about creating interactive applications and experiences on the web.',
      heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      badgeText: 'Full Stack Engineer',
      ctaPrimaryText: 'View Work',
      ctaPrimaryUrl: '#projects',
      ctaSecondaryText: 'Contact Me',
      ctaSecondaryUrl: '#contact',
    },
    create: {
      id: 1,
      availabilityText: 'Available for work',
      headline: 'Hi, I am Nishanth',
      subheadline: 'A Full Stack Developer passionate about creating interactive applications and experiences on the web.',
      heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      badgeText: 'Full Stack Engineer',
      ctaPrimaryText: 'View Work',
      ctaPrimaryUrl: '#projects',
      ctaSecondaryText: 'Contact Me',
      ctaSecondaryUrl: '#contact',
    },
  })

  // 2. Services
  await prisma.service.deleteMany()
  await prisma.service.createMany({
    data: [
      {
        title: 'Web Development',
        description: 'Building responsive, fast, and accessible web applications using modern technologies.',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        sortOrder: 1,
        cardStyle: 'dark',
      },
      {
        title: 'Backend Architecture',
        description: 'Designing scalable APIs and databases for robust cloud-native applications.',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
        sortOrder: 2,
        cardStyle: 'light',
      },
      {
        title: 'UI/UX Design',
        description: 'Crafting beautiful, intuitive interfaces that provide exceptional user experiences.',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-tool"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
        sortOrder: 3,
        cardStyle: 'light',
      }
    ]
  })

  // 3. Projects
  await prisma.project.deleteMany()
  const p1 = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform',
      slug: slugify('E-Commerce Platform'),
      description: 'A full-stack e-commerce solution built with React, Node.js, and PostgreSQL.',
      content: '<p>Complete scalable architecture for managing online stores.</p>',
      category: 'web',
      featuredImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
      liveUrl: 'https://example.com',
      sourceUrl: 'https://github.com',
      year: '2025',
      sortOrder: 1,
      isFeatured: true,
      tags: { create: [{ tagName: 'React' }, { tagName: 'Node.js' }] }
    }
  })

  const p2 = await prisma.project.create({
    data: {
      title: 'Task Management App',
      slug: slugify('Task Management App'),
      description: 'Real-time collaborative task manager with drag-and-drop.',
      category: 'saas',
      featuredImage: 'https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?auto=format&fit=crop&w=800&q=80',
      year: '2024',
      sortOrder: 2,
      isFeatured: true,
      tags: { create: [{ tagName: 'Vue' }, { tagName: 'Firebase' }] }
    }
  })

  // 4. Experience
  await prisma.experience.deleteMany()
  await prisma.experience.createMany({
    data: [
      {
        title: 'Senior Frontend Engineer',
        company: 'Tech Innovators Inc.',
        location: 'Remote',
        period: '2023 - Present',
        description: 'Led the frontend team in rewriting the core product using React and Vite, improving load times by 40%.',
        isCurrent: true,
        sortOrder: 1
      },
      {
        title: 'Web Developer',
        company: 'Digital Agency',
        location: 'New York, NY',
        period: '2020 - 2023',
        description: 'Developed responsive websites for various clients across different industries.',
        isCurrent: false,
        sortOrder: 2
      }
    ]
  })

  // 5. Education
  await prisma.education.deleteMany()
  await prisma.education.createMany({
    data: [
      {
        title: 'Bachelor of Science in Computer Science',
        institution: 'University of Technology',
        period: '2016 - 2020',
        grade: '3.8 GPA',
        sortOrder: 1
      }
    ]
  })

  // 6. Testimonials
  await prisma.testimonial.deleteMany()
  await prisma.testimonial.createMany({
    data: [
      {
        quote: 'Nishanth is an exceptional developer who always delivers high-quality code on time. His attention to detail is outstanding.',
        authorName: 'Sarah Jenkins',
        authorTitle: 'Product Manager',
        authorCompany: 'Tech Innovators',
        rating: 5,
        isFeatured: true,
        sortOrder: 1
      },
      {
        quote: 'Working with Nishanth was a breeze. He translated our complex requirements into a beautiful and functional web application.',
        authorName: 'Michael Chen',
        authorTitle: 'Startup Founder',
        authorCompany: 'NextGen Solutions',
        rating: 5,
        isFeatured: true,
        sortOrder: 2
      }
    ]
  })

  // 7. Skills
  await prisma.skill.deleteMany()
  await prisma.skill.createMany({
    data: [
      { name: 'React', isFeatured: true, sortOrder: 1, iconType: 'class', iconClass: 'fa-brands fa-react' },
      { name: 'TypeScript', isFeatured: true, sortOrder: 2, iconType: 'class', iconClass: 'fa-brands fa-js' },
      { name: 'Node.js', isFeatured: true, sortOrder: 3, iconType: 'class', iconClass: 'fa-brands fa-node-js' },
      { name: 'PostgreSQL', isFeatured: true, sortOrder: 4, iconType: 'class', iconClass: 'fa-solid fa-database' },
      { name: 'Tailwind CSS', isFeatured: true, sortOrder: 5, iconType: 'class', iconClass: 'fa-brands fa-css3' },
    ]
  })

  // 8. Contact Info (Socials)
  await prisma.contactInfo.deleteMany()
  await prisma.contactInfo.createMany({
    data: [
      { type: 'social', url: 'https://github.com/Nishanth', iconClass: 'fa-brands fa-github', label: 'GitHub', sortOrder: 1 },
      { type: 'social', url: 'https://linkedin.com/in/nishanth', iconClass: 'fa-brands fa-linkedin', label: 'LinkedIn', sortOrder: 2 },
      { type: 'social', url: 'https://twitter.com/nishanth', iconClass: 'fa-brands fa-twitter', label: 'Twitter', sortOrder: 3 },
    ]
  })

  // 9. About
  await prisma.about.upsert({
    where: { id: 1 },
    update: {
      subtitle: 'About Me',
      title: 'Passionate Developer based in India',
      paragraph1: 'I am a highly motivated full-stack developer with a passion for building scalable web applications. I love learning new technologies and solving complex problems.',
      paragraph2: 'When I am not coding, you can find me exploring new places, reading books, or experimenting with new design trends.',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    },
    create: {
      id: 1,
      subtitle: 'About Me',
      title: 'Passionate Developer based in India',
      paragraph1: 'I am a highly motivated full-stack developer with a passion for building scalable web applications. I love learning new technologies and solving complex problems.',
      paragraph2: 'When I am not coding, you can find me exploring new places, reading books, or experimenting with new design trends.',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    }
  })

  // 10. Blog
  await prisma.blogCategory.deleteMany()
  const cat = await prisma.blogCategory.create({
    data: { name: 'Tutorials', slug: 'tutorials' }
  })
  
  await prisma.blogPost.deleteMany()
  await prisma.blogPost.create({
    data: {
      title: 'Getting Started with React and Vite',
      slug: slugify('Getting Started with React and Vite'),
      excerpt: 'Learn how to set up a blazing fast React application using Vite.',
      content: '<p>Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects.</p>',
      categoryId: cat.id,
      featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      readTime: '5 min read',
      isPublished: true,
      publishedAt: new Date()
    }
  })

  console.log('✅ Dummy data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
