import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import RootLayout from '@/components/layout/RootLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Public pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const BlogPage = lazy(() => import('@/pages/BlogPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
const CertificationsPage = lazy(() => import('@/pages/CertificationsPage'))
const ResumeViewPage = lazy(() => import('@/pages/ResumeViewPage'))
const SharePage = lazy(() => import('@/pages/SharePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Admin pages
const AdminLoginPage = lazy(() => import('@/pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'))
const AdminThemePage = lazy(() => import('@/pages/admin/ThemePage'))
const AdminHeroPage = lazy(() => import('@/pages/admin/HeroPage'))
const AdminProjectsPage = lazy(() => import('@/pages/admin/ProjectsPage'))
const AdminBlogPage = lazy(() => import('@/pages/admin/BlogPage'))
const AdminExperiencePage = lazy(() => import('@/pages/admin/ExperiencePage'))
const AdminEducationPage = lazy(() => import('@/pages/admin/EducationPage'))
const AdminCertificatesPage = lazy(() => import('@/pages/admin/CertificatesPage'))
const AdminSkillsPage = lazy(() => import('@/pages/admin/SkillsPage'))
const AdminAboutPage = lazy(() => import('@/pages/admin/AboutPage'))
const AdminTestimonialsPage = lazy(() => import('@/pages/admin/TestimonialsPage'))
const AdminServicesPage = lazy(() => import('@/pages/admin/ServicesPage'))
const AdminMessagesPage = lazy(() => import('@/pages/admin/MessagesPage'))
const AdminSharePage = lazy(() => import('@/pages/admin/SharePage'))
const AdminMediaPage = lazy(() => import('@/pages/admin/MediaPage'))
const AdminSocialLinksPage = lazy(() => import('@/pages/admin/SocialLinksPage'))
const AdminNavPage = lazy(() => import('@/pages/admin/NavigationPage'))
const AdminResumePage = lazy(() => import('@/pages/admin/ResumePage'))

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'projects', element: withSuspense(ProjectsPage) },
      { path: 'project/:slug', element: withSuspense(ProjectDetailPage) },
      { path: 'blog', element: withSuspense(BlogPage) },
      { path: 'blog/:slug', element: withSuspense(BlogPostPage) },
      { path: 'certifications', element: withSuspense(CertificationsPage) },
      { path: 'resume', element: withSuspense(ResumeViewPage) },
      { path: 'share', element: withSuspense(SharePage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
  {
    path: '/admin/login',
    element: withSuspense(AdminLoginPage),
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: withSuspense(DashboardPage) },
      { path: 'settings', element: withSuspense(AdminSettingsPage) },
      { path: 'theme', element: withSuspense(AdminThemePage) },
      { path: 'hero', element: withSuspense(AdminHeroPage) },
      { path: 'projects', element: withSuspense(AdminProjectsPage) },
      { path: 'blog', element: withSuspense(AdminBlogPage) },
      { path: 'experience', element: withSuspense(AdminExperiencePage) },
      { path: 'education', element: withSuspense(AdminEducationPage) },
      { path: 'certificates', element: withSuspense(AdminCertificatesPage) },
      { path: 'skills', element: withSuspense(AdminSkillsPage) },
      { path: 'about', element: withSuspense(AdminAboutPage) },
      { path: 'testimonials', element: withSuspense(AdminTestimonialsPage) },
      { path: 'services', element: withSuspense(AdminServicesPage) },
      { path: 'messages', element: withSuspense(AdminMessagesPage) },
      { path: 'share', element: withSuspense(AdminSharePage) },
      { path: 'media', element: withSuspense(AdminMediaPage) },
      { path: 'social', element: withSuspense(AdminSocialLinksPage) },
      { path: 'navigation', element: withSuspense(AdminNavPage) },
      { path: 'resume', element: withSuspense(AdminResumePage) },
    ],
  },
])
