import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/Dashboard'
import TeacherDashboard from './pages/teacher/Dashboard'
import ParentDashboard from './pages/parent/Dashboard'
import StudentDashboard from './pages/student/Dashboard'
import NotFound from './pages/NotFound'
import TeacherAttendance from './pages/teacher/Attendance'
import ParentAttendance from './pages/parent/Attendance'
import AdminAttendance from './pages/admin/Attendance'
import TeacherGrades from './pages/teacher/Grades'
import StudentGrades from './pages/student/Grades'
import ParentGrades  from './pages/parent/Grades'
import AdminAnnouncements from './pages/admin/Announcements'
import AdminMessages   from './pages/admin/Messages'
import TeacherMessages from './pages/teacher/Messages'
import ParentMessages  from './pages/parent/Messages'
import AdminFees  from './pages/admin/Fees'
import ParentFees from './pages/parent/Fees'
import AdminTimetable   from './pages/admin/Timetable'
import TeacherTimetable from './pages/teacher/Timetable'
import StudentTimetable from './pages/student/Timetable'
import AdminStudents from './pages/admin/Students'
import AdminTeachers from './pages/admin/Teachers'
import AdminSubjects from './pages/admin/Subjects'
import StudentMessages from './pages/student/Messages'
import Notifications from './pages/Notifications'
import Announcements from './pages/Announcements'
import StudentProfile from './pages/admin/StudentProfile'
import AdminPaymentLedger from './pages/admin/PaymentLedger'
import PaymentHistory from './pages/PaymentHistory'
import TeacherAssignments from './pages/teacher/Assignments'
import StudentAssignments from './pages/student/Assignments'
import AdminTeacherProfile from './pages/admin/TeacherProfile'
import TeacherOwnProfile from './pages/teacher/Profile'
import TeacherClassList from './pages/teacher/ClassList'
import TeacherSyllabus from './pages/teacher/Syllabus'
import AdminReports from './pages/admin/Reports'
import TeacherReports from './pages/teacher/Reports'
import AdminTeacherReports from './pages/admin/TeacherReports'
import StudentAttendance from './pages/student/Attendance'
import StudentSyllabus from './pages/student/Syllabus'
import InstallPrompt from './components/InstallPrompt'



function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-border)]
        flex items-center justify-center text-2xl">🚧</div>
      <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="text-[var(--color-text-muted)] text-sm">Coming in a later phase</p>
    </div>
  )
}

function PrivateRoute({ role, children }) {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      {children}
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Admin (School Head) */}
          <Route path="/admin" element={
            <PrivateRoute role="admin"><AdminLayout role="admin" /></PrivateRoute>
          }>
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="payments" element={<AdminPaymentLedger />} />
            <Route path="reports"       element={<AdminReports />} />
            <Route path="teacher-reports" element={<AdminTeacherReports />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings"      element={<Placeholder title="Settings" />} />
            <Route path="subjects"      element={<AdminSubjects />} />
            <Route path="notifications" element={<Notifications role="admin" />} />
            <Route path="teachers"     element={<AdminTeachers />} />
            <Route path="teachers/:id" element={<AdminTeacherProfile />} />
            <Route path="students/:id" element={<StudentProfile />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={
            <PrivateRoute role="teacher"><AdminLayout role="teacher" /></PrivateRoute>
          }>
            <Route path="dashboard"  element={<TeacherDashboard />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="announcements" element={<Announcements role="teacher" />} />
            <Route path="grades" element={<TeacherGrades />} />
            <Route path="messages" element={<TeacherMessages />} />
            <Route path="timetable" element={<TeacherTimetable />} />
            <Route path="notifications" element={<Notifications role="teacher" />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="profile" element={<TeacherOwnProfile />} />
            <Route path="classes" element={<TeacherClassList/>}/>
            <Route path="syllabus" element={<TeacherSyllabus />} />
            <Route path="reports" element={<TeacherReports />} />
          </Route>

          {/* Parent */}
          <Route path="/parent" element={
            <PrivateRoute role="parent"><AdminLayout role="parent" /></PrivateRoute>
          }>
            <Route path="dashboard"  element={<ParentDashboard />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="grades"     element={<ParentGrades />} />
            <Route path="fees" element={<ParentFees />} />
            <Route path="payments" element={<PaymentHistory role="parent" />} />
            <Route path="announcements" element={<Announcements role="parent" />} />
            <Route path="messages" element={<ParentMessages />} />
            <Route path="notifications" element={<Notifications role="parent" />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={
            <PrivateRoute role="student"><AdminLayout role="student" /></PrivateRoute>
          }>
            <Route path="dashboard"  element={<StudentDashboard />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="payments" element={<PaymentHistory role="student" />} />
            <Route path="announcements" element={<Announcements role="student" />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="messages" element={<StudentMessages />} />
            <Route path="notifications" element={<Notifications role="student" />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="syllabus" element={<StudentSyllabus />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPrompt />
      </BrowserRouter>
    </AuthProvider>
  )
}