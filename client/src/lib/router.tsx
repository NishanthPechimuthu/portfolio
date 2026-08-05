import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense, type ComponentType } from 'react'
import RootLayout from '@/components/layout/RootLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Retry wrapper: if a dynamic import fails (stale chunk after deploy),
// force a full page reload so the browser fetches fresh HTML + chunks.
function lazyRetry(factory: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(() =>
    factory().catch(() => {
      // Only reload once to avoid infinite loops
      const reloaded = sessionStorage.getItem('chunk-reload')
      if (!reloaded) {
        sessionStorage.setItem('chunk-reload', '1')
        window.location.reload()
        return { default: () => null } as any
      }
      sessionStorage.removeItem('chunk-reload')
      return factory() // re-throw if it still fails after reload
    })
  )
}

// Public pages
const HomePage = lazyRetry(() => import('@/pages/HomePage'))
const ProjectsPage = lazyRetry(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazyRetry(() => import('@/pages/ProjectDetailPage'))
const BlogPage = lazyRetry(() => import('@/pages/BlogPage'))
const BlogPostPage = lazyRetry(() => import('@/pages/BlogPostPage'))
const CertificationsPage = lazyRetry(() => import('@/pages/CertificationsPage'))
const ResumeViewPage = lazyRetry(() => import('@/pages/ResumeViewPage'))
const SharePage = lazyRetry(() => import('@/pages/SharePage'))
const NotFoundPage = lazyRetry(() => import('@/pages/NotFoundPage'))

// Admin pages
const AdminLoginPage = lazyRetry(() => import('@/pages/admin/LoginPage'))
const DashboardPage = lazyRetry(() => import('@/pages/admin/DashboardPage'))
const AdminSettingsPage = lazyRetry(() => import('@/pages/admin/SettingsPage'))
const AdminThemePage = lazyRetry(() => import('@/pages/admin/ThemePage'))
const AdminHeroPage = lazyRetry(() => import('@/pages/admin/HeroPage'))
const AdminProjectsPage = lazyRetry(() => import('@/pages/admin/ProjectsPage'))
const AdminBlogPage = lazyRetry(() => import('@/pages/admin/BlogPage'))
const AdminExperiencePage = lazyRetry(() => import('@/pages/admin/ExperiencePage'))
const AdminEducationPage = lazyRetry(() => import('@/pages/admin/EducationPage'))
const AdminCertificatesPage = lazyRetry(() => import('@/pages/admin/CertificatesPage'))
const AdminSkillsPage = lazyRetry(() => import('@/pages/admin/SkillsPage'))
const AdminAboutPage = lazyRetry(() => import('@/pages/admin/AboutPage'))
const AdminTestimonialsPage = lazyRetry(() => import('@/pages/admin/TestimonialsPage'))
const AdminServicesPage = lazyRetry(() => import('@/pages/admin/ServicesPage'))
const AdminMessagesPage = lazyRetry(() => import('@/pages/admin/MessagesPage'))
const AdminSharePage = lazyRetry(() => import('@/pages/admin/SharePage'))
const AdminMediaPage = lazyRetry(() => import('@/pages/admin/MediaPage'))
const AdminSocialLinksPage = lazyRetry(() => import('@/pages/admin/SocialLinksPage'))
const AdminNavPage = lazyRetry(() => import('@/pages/admin/NavigationPage'))
const AdminResumePage = lazyRetry(() => import('@/pages/admin/ResumePage'))

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
