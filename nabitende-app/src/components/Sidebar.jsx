import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, ClipboardCheck,
  Calendar, Receipt, BarChart2, Megaphone, MessageSquare,
  Settings, HelpCircle, BookOpen, DollarSign, Building2,
  FileText, ScrollText, X, School, LogOut, User, ClipboardList
} from 'lucide-react'

const navConfig = {
  admin: {
    label: 'School Head',
    color: '#ea580c',
    sections: [
      {
        title: 'Main',
        links: [
          { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
          { to: '/admin/students',   icon: Users,           label: 'Students', badge: '842' },
          { to: '/admin/teachers',   icon: GraduationCap,   label: 'Teachers'  },
          { to: '/admin/subjects',   icon: BookOpen,        label: 'Subjects'  },
          { to: '/admin/attendance', icon: ClipboardCheck,  label: 'Attendance'},
          { to: '/admin/timetable',  icon: Calendar,        label: 'Timetable' },
          { to: '/admin/syllabus',  icon: BookOpen,        label: 'Syllabus'  },
          { to: '/admin/teacher-reports', icon: BarChart2, label: 'Teacher Reports' }
          
        ],
      },
      {
        title: 'Finance',
        links: [
          { to: '/admin/fees',          icon: Receipt,       label: 'Fees',     badge: '12', badgeAlert: true },
          { to: '/admin/finance-reports', icon: BarChart2,     label: 'Finance Reports' },
        ],
      },
      {
        title: 'Communication',
        links: [
          { to: '/admin/announcements', icon: Megaphone,     label: 'Announcements' },
          { to: '/admin/messages',      icon: MessageSquare, label: 'Messages', badge: '5' },
        ],
      },
    ],
    footer: [
      { to: '/admin/settings', icon: Settings,   label: 'Settings' },
      { to: '#',               icon: HelpCircle, label: 'Help' },
    ],
  },
  teacher: {
    label: 'Teacher',
    color: '#1a6b4a',
    sections: [
      {
        title: 'My Work',
        links: [
          { to: '/teacher/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/teacher/attendance',    icon: ClipboardCheck,  label: 'Mark Attendance' },
          { to: '/teacher/grades',        icon: BookOpen,        label: 'Grades' },
          { to: '/teacher/assignments',   icon: ClipboardList,   label: 'Assignments' },
          { to: '/teacher/timetable',     icon: Calendar,        label: 'My Timetable' },
          { to: '/teacher/messages',      icon: MessageSquare,   label: 'Messages', badge: '3' },
          { to: '/teacher/announcements', icon: Megaphone,       label: 'Announcements' },
          { to: '/teacher/classes', icon: Users, label: 'Class Lists' },
          { to: '/teacher/syllabus', icon: BookOpen, label: 'Syllabus Tracker' },
          {to: '/teacher/reports', icon: BarChart2, label: 'Reports' }
        ],
      },
      {
        title: 'My Account',
        links: [
          { to: '/teacher/profile', icon: User, label: 'My Profile' },
        ],
      },
    ],
    footer: [
      { to: '#', icon: Settings,   label: 'Settings' },
      { to: '#', icon: HelpCircle, label: 'Help' },
    ],
  },
  parent: {
    label: 'Parent',
    color: '#0891b2',
    sections: [
      {
        title: 'My Child',
        links: [
          { to: '/parent/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/parent/attendance', icon: ClipboardCheck,  label: 'Attendance' },
          { to: '/parent/grades',     icon: BookOpen,        label: 'Grades' },
          { to: '/parent/fees',       icon: DollarSign,      label: 'Fee Payments' },
          { to: '/parent/messages',   icon: MessageSquare,   label: 'Messages', badge: '2' },
          { to: '/parent/announcements', icon: Megaphone, label: 'Announcements' },
          { to: '/parent/notifications', icon: ScrollText, label: 'Notifications' },
          { to: '/parent/payments', icon: Receipt, label: 'Payment History' },
        ],
      },
    ],
    footer: [
      { to: '#', icon: Settings,   label: 'Settings' },
      { to: '#', icon: HelpCircle, label: 'Help' },
    ],
  },
  student: {
    label: 'Student',
    color: '#7c3aed',
    sections: [
      {
        title: 'My School',
        links: [
          { to: '/student/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/student/timetable',     icon: Calendar,        label: 'My Timetable' },
          { to: '/student/grades',        icon: BookOpen,        label: 'My Grades' },
          { to: '/student/attendance',    icon: ClipboardCheck,  label: 'My Attendance' },
          { to: '/student/assignments',   icon: ClipboardList,   label: 'Assignments' },
          { to: '/student/messages',      icon: MessageSquare,   label: 'Messages' },
          { to: '/student/announcements', icon: Megaphone,       label: 'Announcements' },
          { to: '/student/payments',      icon: DollarSign,      label: 'Payments' },
          { to: '/student/syllabus',      icon: BookOpen,        label: 'Syllabus' },
        ],
      },
    ],
    footer: [
      { to: '#', icon: Settings,   label: 'Settings' },
      { to: '#', icon: HelpCircle, label: 'Help' },
    ],
  },
  government: {
    label: 'Government',
    color: '#1d4ed8',
    sections: [
      {
        title: 'Overview',
        links: [
          { to: '/government/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/government/schools',   icon: Building2,       label: 'Schools' },
          { to: '/government/reports',   icon: FileText,        label: 'District Reports' },
          { to: '/government/policies',  icon: ScrollText,      label: 'Policy Rollouts' },
          { to: '/government/announcements', icon: Megaphone, label: 'Announcements' },
        ],
      },
    ],
    footer: [
      { to: '#', icon: Settings,   label: 'Settings' },
      { to: '#', icon: HelpCircle, label: 'Help' },
    ],
  },
}

export default function Sidebar({ role, open, onClose, onLogout }) {
  const config = navConfig[role] || navConfig.admin

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col w-[220px] min-w-[220px]
        bg-[var(--color-surface)] border-r border-[var(--color-border)]
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: config.color }}
            >
              <School size={16} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[var(--color-text)] leading-none">
                EduConnect
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                {config.label} portal
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-[var(--color-text-muted)]">
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {config.sections.map((section) => (
            <div key={section.title} className="mb-4">
              <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {section.title}
              </div>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5
                    text-[13.5px] transition-colors duration-150
                    ${isActive
                      ? 'bg-[#1a6b4a]/10 text-[#1a6b4a] font-medium'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
                    }
                  `}
                >
                  <link.icon size={16} />
                  <span className="flex-1">{link.label}</span>
                  {link.badge && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      link.badgeAlert
                        ? 'bg-red-50 text-red-600'
                        : 'bg-[#1a6b4a]/10 text-[#1a6b4a]'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer links */}
<div className="px-2 py-3 border-t border-[var(--color-border)]">
  {config.footer.map((link) => (
    <NavLink
      key={link.label}
      to={link.to}
      className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5
        text-[13.5px] text-[var(--color-text-muted)]
        hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]
        transition-colors duration-150"
    >
      <link.icon size={16} />
      {link.label}
    </NavLink>
  ))}
  <button
    onClick={onLogout}
    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md
      text-[13.5px] text-red-500 hover:bg-red-50 transition-colors duration-150"
  >
    <LogOut size={16} />
    Sign out
  </button>
</div>
      </aside>
    </>
  )
}