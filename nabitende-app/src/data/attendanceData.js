// ─── Students per class ───────────────────────────────────────────
export const students = {
  'S.1A': [
    { id: 's101', name: 'Aisha Tendo'      },
    { id: 's102', name: 'Brian Mukasa'     },
    { id: 's103', name: 'Cynthia Akello'   },
    { id: 's104', name: 'David Ssengooba'  },
    { id: 's105', name: 'Esther Namuli'    },
    { id: 's106', name: 'Frank Kibuuka'    },
    { id: 's107', name: 'Grace Nansubuga'  },
    { id: 's108', name: 'Henry Wasswa'     },
  ],
  'S.2B': [
    { id: 's201', name: 'Irene Nakazibwe'  },
    { id: 's202', name: 'James Kiggundu'   },
    { id: 's203', name: 'Karen Atim'       },
    { id: 's204', name: 'Liam Ochieng'     },
    { id: 's205', name: 'Mary Nakitto'     },
    { id: 's206', name: 'Noah Ssali'       },
    { id: 's207', name: 'Olivia Namukasa'  },
    { id: 's208', name: 'Peter Byaruhanga' },
  ],
  'S.3A': [
    { id: 's301', name: 'David Ssemanda'   },
    { id: 's302', name: 'Queen Nabirye'    },
    { id: 's303', name: 'Robert Tumwine'   },
    { id: 's304', name: 'Sarah Nantongo'   },
    { id: 's305', name: 'Thomas Okello'    },
    { id: 's306', name: 'Ugochi Amara'     },
    { id: 's307', name: 'Victor Ssebunya'  },
    { id: 's308', name: 'Winnie Ayebare'   },
  ],
  'S.4A': [
    { id: 's401', name: 'Xavier Mugisha'   },
    { id: 's402', name: 'Yvonne Namutebi'  },
    { id: 's403', name: 'Zara Akiiki'      },
    { id: 's404', name: 'Aaron Kato'       },
    { id: 's405', name: 'Brenda Nalwoga'   },
    { id: 's406', name: 'Calvin Ssekandi'  },
    { id: 's407', name: 'Diana Nakimuli'   },
    { id: 's408', name: 'Edwin Tumusiime'  },
  ],
}

// ─── Attendance records (past 7 days) ────────────────────────────
// status: 'present' | 'absent' | 'late'
export const attendanceRecords = [
  // S.3A — David Ssemanda (parent view child)
  { studentId: 's301', class: 'S.3A', date: '2026-06-02', status: 'present' },
  { studentId: 's301', class: 'S.3A', date: '2026-06-03', status: 'present' },
  { studentId: 's301', class: 'S.3A', date: '2026-06-04', status: 'absent'  },
  { studentId: 's301', class: 'S.3A', date: '2026-06-05', status: 'present' },
  { studentId: 's301', class: 'S.3A', date: '2026-06-06', status: 'late'    },
  { studentId: 's301', class: 'S.3A', date: '2026-06-07', status: 'present' },
  { studentId: 's301', class: 'S.3A', date: '2026-06-08', status: 'present' },

  // S.3A — other students
  { studentId: 's302', class: 'S.3A', date: '2026-06-08', status: 'present' },
  { studentId: 's303', class: 'S.3A', date: '2026-06-08', status: 'absent'  },
  { studentId: 's304', class: 'S.3A', date: '2026-06-08', status: 'present' },
  { studentId: 's305', class: 'S.3A', date: '2026-06-08', status: 'present' },
  { studentId: 's306', class: 'S.3A', date: '2026-06-08', status: 'late'    },
  { studentId: 's307', class: 'S.3A', date: '2026-06-08', status: 'present' },
  { studentId: 's308', class: 'S.3A', date: '2026-06-08', status: 'absent'  },

  // S.2B
  { studentId: 's201', class: 'S.2B', date: '2026-06-08', status: 'present' },
  { studentId: 's202', class: 'S.2B', date: '2026-06-08', status: 'present' },
  { studentId: 's203', class: 'S.2B', date: '2026-06-08', status: 'present' },
  { studentId: 's204', class: 'S.2B', date: '2026-06-08', status: 'absent'  },
  { studentId: 's205', class: 'S.2B', date: '2026-06-08', status: 'present' },
  { studentId: 's206', class: 'S.2B', date: '2026-06-08', status: 'present' },
  { studentId: 's207', class: 'S.2B', date: '2026-06-08', status: 'late'    },
  { studentId: 's208', class: 'S.2B', date: '2026-06-08', status: 'present' },

  // S.4A
  { studentId: 's401', class: 'S.4A', date: '2026-06-08', status: 'present' },
  { studentId: 's402', class: 'S.4A', date: '2026-06-08', status: 'present' },
  { studentId: 's403', class: 'S.4A', date: '2026-06-08', status: 'absent'  },
  { studentId: 's404', class: 'S.4A', date: '2026-06-08', status: 'present' },
  { studentId: 's405', class: 'S.4A', date: '2026-06-08', status: 'present' },
  { studentId: 's406', class: 'S.4A', date: '2026-06-08', status: 'absent'  },
  { studentId: 's407', class: 'S.4A', date: '2026-06-08', status: 'present' },
  { studentId: 's408', class: 'S.4A', date: '2026-06-08', status: 'late'    },
]

// ─── Summary per class for admin view ────────────────────────────
export const classSummary = [
  { class: 'S.1A', total: 40, present: 38, absent: 2,  late: 0 },
  { class: 'S.1B', total: 42, present: 35, absent: 5,  late: 2 },
  { class: 'S.2A', total: 38, present: 36, absent: 1,  late: 1 },
  { class: 'S.2B', total: 42, present: 35, absent: 4,  late: 3 },
  { class: 'S.3A', total: 44, present: 38, absent: 4,  late: 2 },
  { class: 'S.3B', total: 40, present: 33, absent: 5,  late: 2 },
  { class: 'S.4A', total: 40, present: 34, absent: 4,  late: 2 },
  { class: 'S.4B', total: 38, present: 28, absent: 7,  late: 3 },
  { class: 'S.5A', total: 35, present: 26, absent: 7,  late: 2 },
  { class: 'S.6A', total: 32, present: 29, absent: 2,  late: 1 },
]

// ─── Teacher's assigned classes ───────────────────────────────────
export const teacherClasses = ['S.2B', 'S.3A', 'S.4A', 'S.1A']