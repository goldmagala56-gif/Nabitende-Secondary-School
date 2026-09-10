// ─── Periods ──────────────────────────────────────────────────────
export const periods = [
  { id: 1, label: 'Period 1', time: '8:00 – 8:45 AM'   },
  { id: 2, label: 'Period 2', time: '8:45 – 9:30 AM'   },
  { id: 3, label: 'Period 3', time: '9:30 – 10:15 AM'  },
  { id: 4, label: 'Break',    time: '10:15 – 10:35 AM', isBreak: true },
  { id: 5, label: 'Period 4', time: '10:35 – 11:20 AM' },
  { id: 6, label: 'Period 5', time: '11:20 – 12:05 PM' },
  { id: 7, label: 'Lunch',    time: '12:05 – 1:00 PM',  isBreak: true },
  { id: 8, label: 'Period 6', time: '1:00 – 1:45 PM'   },
  { id: 9, label: 'Period 7', time: '1:45 – 2:30 PM'   },
  { id: 10, label: 'Period 8', time: '2:30 – 3:15 PM'  },
]

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// ─── S.3A timetable (student view) ───────────────────────────────
export const studentTimetable = {
  Monday:    [
    { periodId: 1,  subject: 'Mathematics', teacher: 'Ms. Nakato',    room: 'Room 12' },
    { periodId: 2,  subject: 'English',     teacher: 'Mr. Kaggwa',    room: 'Room 5'  },
    { periodId: 3,  subject: 'Physics',     teacher: 'Ms. Atim',      room: 'Lab 2'   },
    { periodId: 5,  subject: 'Chemistry',   teacher: 'Mr. Opiyo',     room: 'Lab 1'   },
    { periodId: 6,  subject: 'History',     teacher: 'Mr. Byarugaba', room: 'Room 9'  },
    { periodId: 8,  subject: 'Geography',   teacher: 'Ms. Amongi',    room: 'Room 11' },
    { periodId: 9,  subject: 'CRE',         teacher: 'Mr. Wasswa',    room: 'Room 6'  },
    { periodId: 10, subject: 'Biology',     teacher: 'Ms. Nambi',     room: 'Lab 3'   },
  ],
  Tuesday:   [
    { periodId: 1,  subject: 'English',     teacher: 'Mr. Kaggwa',    room: 'Room 5'  },
    { periodId: 2,  subject: 'Mathematics', teacher: 'Ms. Nakato',    room: 'Room 12' },
    { periodId: 3,  subject: 'Biology',     teacher: 'Ms. Nambi',     room: 'Lab 3'   },
    { periodId: 5,  subject: 'History',     teacher: 'Mr. Byarugaba', room: 'Room 9'  },
    { periodId: 6,  subject: 'Chemistry',   teacher: 'Mr. Opiyo',     room: 'Lab 1'   },
    { periodId: 8,  subject: 'Physics',     teacher: 'Ms. Atim',      room: 'Lab 2'   },
    { periodId: 9,  subject: 'Geography',   teacher: 'Ms. Amongi',    room: 'Room 11' },
    { periodId: 10, subject: 'Mathematics', teacher: 'Ms. Nakato',    room: 'Room 12' },
  ],
  Wednesday: [
    { periodId: 1,  subject: 'Physics',     teacher: 'Ms. Atim',      room: 'Lab 2'   },
    { periodId: 2,  subject: 'CRE',         teacher: 'Mr. Wasswa',    room: 'Room 6'  },
    { periodId: 3,  subject: 'Mathematics', teacher: 'Ms. Nakato',    room: 'Room 12' },
    { periodId: 5,  subject: 'English',     teacher: 'Mr. Kaggwa',    room: 'Room 5'  },
    { periodId: 6,  subject: 'Biology',     teacher: 'Ms. Nambi',     room: 'Lab 3'   },
    { periodId: 8,  subject: 'History',     teacher: 'Mr. Byarugaba', room: 'Room 9'  },
    { periodId: 9,  subject: 'Chemistry',   teacher: 'Mr. Opiyo',     room: 'Lab 1'   },
    { periodId: 10, subject: 'Geography',   teacher: 'Ms. Amongi',    room: 'Room 11' },
  ],
  Thursday:  [
    { periodId: 1,  subject: 'Geography',   teacher: 'Ms. Amongi',    room: 'Room 11' },
    { periodId: 2,  subject: 'Biology',     teacher: 'Ms. Nambi',     room: 'Lab 3'   },
    { periodId: 3,  subject: 'English',     teacher: 'Mr. Kaggwa',    room: 'Room 5'  },
    { periodId: 5,  subject: 'Mathematics', teacher: 'Ms. Nakato',    room: 'Room 12' },
    { periodId: 6,  subject: 'CRE',         teacher: 'Mr. Wasswa',    room: 'Room 6'  },
    { periodId: 8,  subject: 'Chemistry',   teacher: 'Mr. Opiyo',     room: 'Lab 1'   },
    { periodId: 9,  subject: 'Physics',     teacher: 'Ms. Atim',      room: 'Lab 2'   },
    { periodId: 10, subject: 'History',     teacher: 'Mr. Byarugaba', room: 'Room 9'  },
  ],
  Friday:    [
    { periodId: 1,  subject: 'Chemistry',   teacher: 'Mr. Opiyo',     room: 'Lab 1'   },
    { periodId: 2,  subject: 'History',     teacher: 'Mr. Byarugaba', room: 'Room 9'  },
    { periodId: 3,  subject: 'Geography',   teacher: 'Ms. Amongi',    room: 'Room 11' },
    { periodId: 5,  subject: 'Biology',     teacher: 'Ms. Nambi',     room: 'Lab 3'   },
    { periodId: 6,  subject: 'Mathematics', teacher: 'Ms. Nakato',    room: 'Room 12' },
    { periodId: 8,  subject: 'English',     teacher: 'Mr. Kaggwa',    room: 'Room 5'  },
    { periodId: 9,  subject: 'CRE',         teacher: 'Mr. Wasswa',    room: 'Room 6'  },
    { periodId: 10, subject: 'Physics',     teacher: 'Ms. Atim',      room: 'Lab 2'   },
  ],
}

// ─── Ms. Nakato teacher timetable ────────────────────────────────
export const teacherTimetable = {
  Monday:    [
    { periodId: 1,  class: 'S.3A', subject: 'Mathematics', room: 'Room 12' },
    { periodId: 5,  class: 'S.2B', subject: 'Mathematics', room: 'Room 7'  },
    { periodId: 9,  class: 'S.4A', subject: 'Mathematics', room: 'Room 15' },
  ],
  Tuesday:   [
    { periodId: 2,  class: 'S.3A', subject: 'Mathematics', room: 'Room 12' },
    { periodId: 6,  class: 'S.1A', subject: 'Mathematics', room: 'Room 3'  },
    { periodId: 10, class: 'S.3A', subject: 'Mathematics', room: 'Room 12' },
  ],
  Wednesday: [
    { periodId: 3,  class: 'S.3A', subject: 'Mathematics', room: 'Room 12' },
    { periodId: 8,  class: 'S.4A', subject: 'Mathematics', room: 'Room 15' },
  ],
  Thursday:  [
    { periodId: 5,  class: 'S.3A', subject: 'Mathematics', room: 'Room 12' },
    { periodId: 9,  class: 'S.2B', subject: 'Mathematics', room: 'Room 7'  },
  ],
  Friday:    [
    { periodId: 6,  class: 'S.3A', subject: 'Mathematics', room: 'Room 12' },
    { periodId: 10, class: 'S.1A', subject: 'Mathematics', room: 'Room 3'  },
  ],
}

// ─── Subject colors ───────────────────────────────────────────────
export const subjectColors = {
  'Mathematics': { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  'English':     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  'Physics':     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Chemistry':   { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  'Biology':     { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200'   },
  'History':     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  'Geography':   { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'CRE':         { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200'   },
}