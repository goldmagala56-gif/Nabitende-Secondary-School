import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useState } from 'react'
import AIAssistant from '../components/AIAssistant'
import {
  LayoutDashboard, ClipboardCheck, BookOpen,
  MessageSquare, DollarSign, Users, ClipboardList, User, Calendar
} from 'lucide-react'

const bottomNavConfig = {
  admin: [
    { label: 'Home',       icon: LayoutDashboard, to: '/admin/dashboard'     },
    { label: 'Students',   icon: Users,           to: '/admin/students'      },
    { label: 'Attendance', icon: ClipboardCheck,  to: '/admin/attendance'    },
    { label: 'Fees',       icon: DollarSign,      to: '/admin/fees'          },
    { label: 'Messages',   icon: MessageSquare,   to: '/admin/messages'      },
  ],

  teacher: [
    { label: 'Home',        icon: LayoutDashboard, to: '/teacher/dashboard'   },
    { label: 'Attendance',  icon: ClipboardCheck,  to: '/teacher/attendance'  },
    { label: 'Classes', icon: Users, to: '/teacher/ClassList' },
    { label: 'Timetable',   icon: Calendar,        to: '/teacher/timetable'   },
    { label: 'Assignments', icon: ClipboardList,   to: '/teacher/assignments' },
  ],

  parent: [
    { label: 'Home',       icon: LayoutDashboard, to: '/parent/dashboard'    },
    { label: 'Attendance', icon: ClipboardCheck,  to: '/parent/attendance'   },
    { label: 'Grades',     icon: BookOpen,        to: '/parent/grades'       },
    { label: 'Fees',       icon: DollarSign,      to: '/parent/fees'         },
    { label: 'Messages',   icon: MessageSquare,   to: '/parent/messages'     },
  ],
  student: [
    { label: 'Home',       icon: LayoutDashboard, to: '/student/dashboard'   },
    { label: 'Timetable',  icon: ClipboardCheck,  to: '/student/timetable'   },
    { label: 'Grades',     icon: BookOpen,        to: '/student/grades'      },
    { label: 'Attendance', icon: MessageSquare,   to: '/student/attendance'  },
    { label: 'Assignments', icon: ClipboardList, to: '/student/assignments' },
  ],
  government: [
    { label: 'Home',       icon: LayoutDashboard, to: '/government/dashboard' },
    { label: 'Schools',    icon: Users,           to: '/government/schools'   },
    { label: 'Reports',    icon: BookOpen,        to: '/government/reports'   },
    { label: 'Policies',   icon: ClipboardCheck,  to: '/government/policies'  },
  ],
}

const roleColors = {
  admin:      '#ea580c',
  teacher:    '#1a6b4a',
  parent:     '#0891b2',
  student:    '#7c3aed',
  government: '#1d4ed8',
}

export default function AdminLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const bottomNav = bottomNavConfig[role] || bottomNavConfig.admin
  const color     = roleColors[role] || '#1a6b4a'

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">

      {/* Sidebar — hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex">
        <Sidebar role={role} open={true} onClose={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <Sidebar role={role} open={sidebarOpen}
            onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role={role} onMenuClick={() => setSidebarOpen(o => !o)} />

        {/* Page content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Bottom navigation — mobile only */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
          bg-[var(--color-surface)] border-t border-[var(--color-border)]
          flex items-center justify-around px-2 py-2 bottom-nav-safe">
          {bottomNav.map((item) => {
            const Icon    = item.icon
            const isActive = location.pathname === item.to
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex flex-col items-center gap-0.5 px-3 py-1
                  rounded-xl transition-colors min-w-[48px]"
                style={{
                  color: isActive ? color : 'var(--color-text-muted)',
                  background: isActive ? color + '12' : 'transparent',
                }}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
      <AIAssistant />
    </div>
  )
}