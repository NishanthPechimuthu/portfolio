import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Briefcase, BookOpen, Mail, Award, Zap, ArrowRight, Activity } from 'lucide-react'
import api from '@/lib/api'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  })

  if (isLoading) return <div className="animate-pulse h-[60vh] bg-zinc-900/50 rounded-3xl" />

  const stats = [
    { label: 'Projects', value: data?.projects || 0, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/admin/projects' },
    { label: 'Blog Posts', value: data?.blogPosts || 0, icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10', link: '/admin/blog' },
    { label: 'Messages', value: data?.messages || 0, icon: Mail, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/admin/messages', badge: data?.unreadMessages },
    { label: 'Certificates', value: data?.certificates || 0, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10', link: '/admin/certificates' },
    { label: 'Skills', value: data?.skills || 0, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/admin/skills' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand" /> Overview
        </h1>
        <p className="text-zinc-400">Welcome to your portfolio content management system.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} to={stat.link}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors relative h-full flex flex-col"
              >
                {stat.badge > 0 && (
                  <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Messages</h2>
            <Link to="/admin/messages" className="text-sm text-brand hover:text-brand-light font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {data?.recentMessages?.length > 0 ? data.recentMessages.map((msg: any) => (
              <div key={msg.id} className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-white">{msg.name}</p>
                    <p className="text-xs text-zinc-400">{msg.email}</p>
                  </div>
                  {!msg.isRead && <span className="bg-brand/20 text-brand px-2 py-0.5 rounded-full text-xs font-medium border border-brand/20">New</span>}
                </div>
                <p className="text-sm text-zinc-300 line-clamp-2">{msg.message}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-zinc-500 text-sm">No recent messages</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/projects" className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-center group">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Add Project</p>
            </Link>
            
            <Link to="/admin/blog" className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-center group">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Write Post</p>
            </Link>

            <Link to="/admin/share" className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-center group">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Share File</p>
            </Link>

            <Link to="/admin/media" className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-center group">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Media Library</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
