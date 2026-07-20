import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Settings, Palette, Home, Briefcase, MessageSquare,
  BookOpen, GraduationCap, Award, Wrench, User, Star, Zap, Share2,
  Image, Mail, LogOut, Menu, X, Link as LinkIcon, Navigation
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Theme', path: '/admin/theme', icon: Palette },
  { label: 'Navigation', path: '/admin/navigation', icon: Navigation },
  { label: 'Hero', path: '/admin/hero', icon: Home },
  { label: 'Services', path: '/admin/services', icon: Zap },
  { label: 'Projects', path: '/admin/projects', icon: Briefcase },
  { label: 'Blog', path: '/admin/blog', icon: BookOpen },
  { label: 'Experience', path: '/admin/experience', icon: Wrench },
  { label: 'Education', path: '/admin/education', icon: GraduationCap },
  { label: 'Certificates', path: '/admin/certificates', icon: Award },
  { label: 'Skills', path: '/admin/skills', icon: Zap },
  { label: 'Resume', path: '/admin/resume', icon: BookOpen },
  { label: 'About', path: '/admin/about', icon: User },
  { label: 'Testimonials', path: '/admin/testimonials', icon: Star },
  { label: 'Social Links', path: '/admin/social', icon: LinkIcon },
  { label: 'Temp Share', path: '/admin/share', icon: Share2 },
  { label: 'Media', path: '/admin/media', icon: Image },
  { label: 'Messages', path: '/admin/messages', icon: Mail },
]

export default function AdminLayout() {
  const { isAuthenticated, logout, username } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } finally {
      logout()
      navigate('/admin/login')
      toast.success('Logged out successfully')
    }
  }

  const Sidebar = () => (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-brand">NP</span>
          <span className="text-white font-semibold">Admin</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">CMS Dashboard • {username}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, path, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-brand text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">Admin CMS</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
