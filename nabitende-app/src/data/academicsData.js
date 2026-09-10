// ─── Uganda grading scale ─────────────────────────────────────────
export function computeGrade(mark) {
  if (mark >= 80) return { grade: 'D1', points: 1 }
  if (mark >= 75) return { grade: 'D2', points: 2 }
  if (mark >= 70) return { grade: 'C3', points: 3 }
  if (mark >= 65) return { grade: 'C4', points: 4 }
  if (mark >= 60) return { grade: 'C5', points: 5 }
  if (mark >= 55) return { grade: 'C6', points: 6 }
  if (mark >= 45) return { grade: 'P7', points: 7 }
  if (mark >= 35) return { grade: 'P8', points: 8 }
  return { grade: 'F9', points: 9 }
}

export function gradeColor(grade) {
  if (['D1','D2'].includes(grade))       return { text: 'text-green-700',  bg: 'bg-green-100'  }
  if (['C3','C4','C5','C6'].includes(grade)) return { text: 'text-blue-700', bg: 'bg-blue-100'   }
  if (['P7','P8'].includes(grade))       return { text: 'text-amber-700', bg: 'bg-amber-100' }
  return { text: 'text-red-700', bg: 'bg-red-100' }
}

// ─── Subjects ─────────────────────────────────────────────────────
export const subjects = [
  'Mathematics', 'English', 'Physics',
  'Chemistry', 'Biology', 'History',
  'Geography', 'CRE',
]

// ─── Teacher's classes and subjects ───────────────────────────────
export const teacherSubjects = {
  'S.2B': ['Mathematics'],
  'S.3A': ['Mathematics'],
  'S.4A': ['Mathematics'],
  'S.1A': ['Mathematics'],
}

// ─── Existing marks records ───────────────────────────────────────
export const marksRecords = [
  // S.3A Mathematics — Bot 1
  { studentId: 's301', studentName: 'David Ssemanda',   class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 78 },
  { studentId: 's302', studentName: 'Queen Nabirye',    class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 85 },
  { studentId: 's303', studentName: 'Robert Tumwine',   class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 62 },
  { studentId: 's304', studentName: 'Sarah Nantongo',   class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 71 },
  { studentId: 's305', studentName: 'Thomas Okello',    class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 55 },
  { studentId: 's306', studentName: 'Ugochi Amara',     class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 90 },
  { studentId: 's307', studentName: 'Victor Ssebunya',  class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 48 },
  { studentId: 's308', studentName: 'Winnie Ayebare',   class: 'S.3A', subject: 'Mathematics', exam: 'Bot 1', mark: 67 },
]

// ─── David Ssemanda full report card (s301) ───────────────────────
export const studentReportCard = [
  { subject: 'Mathematics', bot1: 78, bot2: 82, final: null },
  { subject: 'English',     bot1: 85, bot2: 88, final: null },
  { subject: 'Physics',     bot1: 62, bot2: 59, final: null },
  { subject: 'Chemistry',   bot1: 71, bot2: 74, final: null },
  { subject: 'Biology',     bot1: 75, bot2: 79, final: null },
  { subject: 'History',     bot1: 88, bot2: 91, final: null },
  { subject: 'Geography',   bot1: 65, bot2: 68, final: null },
  { subject: 'CRE',         bot1: 55, bot2: 60, final: null },
]

// ─── Class averages for admin ─────────────────────────────────────
export const classAverages = [
  { class: 'S.1A', average: 72, highest: 94, lowest: 38, students: 40 },
  { class: 'S.1B', average: 68, highest: 91, lowest: 32, students: 42 },
  { class: 'S.2A', average: 74, highest: 96, lowest: 41, students: 38 },
  { class: 'S.2B', average: 70, highest: 93, lowest: 35, students: 42 },
  { class: 'S.3A', average: 71, highest: 90, lowest: 48, students: 44 },
  { class: 'S.3B', average: 65, highest: 88, lowest: 30, students: 40 },
  { class: 'S.4A', average: 69, highest: 92, lowest: 34, students: 40 },
  { class: 'S.4B', average: 63, highest: 85, lowest: 28, students: 38 },
]