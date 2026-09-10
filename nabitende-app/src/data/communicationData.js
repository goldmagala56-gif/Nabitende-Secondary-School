// ─── Announcements ────────────────────────────────────────────────
export const announcements = [
  {
    id: 'a1',
    title: 'Mid-term examinations timetable',
    body: 'Mid-term exams will run from Monday 16 June to Friday 20 June 2026. All students must be in school by 7:30 AM during exam week. Teachers should submit exam papers to the Deputy Head by 13 June.',
    category: 'Academic',
    target: 'All',
    author: 'Mr. Okello',
    date: '2026-06-07',
    pinned: true,
  },
  {
    id: 'a2',
    title: 'Term 2 fee payment deadline',
    body: 'All outstanding Term 2 fees must be cleared by 15 June 2026. Parents with balances will receive SMS reminders. Students with unpaid fees may not sit mid-term exams. Contact the bursar for payment plans.',
    category: 'Finance',
    target: 'Parents',
    author: 'Mr. Okello',
    date: '2026-06-06',
    pinned: true,
  },
  {
    id: 'a3',
    title: 'Annual sports day — 28 June 2026',
    body: 'The annual sports day is confirmed for Saturday 28 June. All students are expected to participate. Parents are welcome to attend. More details on events and timing will follow next week.',
    category: 'Event',
    target: 'All',
    author: 'Mr. Okello',
    date: '2026-06-05',
    pinned: false,
  },
  {
    id: 'a4',
    title: 'Staff meeting — Wednesday 11 June',
    body: 'There will be a mandatory staff meeting on Wednesday 11 June at 4:00 PM in the staffroom. Agenda: end of term preparations, exam invigilation assignments, and holiday schedule.',
    category: 'Staff',
    target: 'Teachers',
    author: 'Mr. Okello',
    date: '2026-06-04',
    pinned: false,
  },
  {
    id: 'a5',
    title: 'New library books available',
    body: 'The school library has received 200 new books donated by the Parents Association. Students are encouraged to visit the library and borrow books relevant to their subjects.',
    category: 'Academic',
    target: 'Students',
    author: 'Mr. Okello',
    date: '2026-06-03',
    pinned: false,
  },
]

// ─── Messages ─────────────────────────────────────────────────────
export const conversations = [
  {
    id: 'c1',
    participants: ['parent', 'teacher'],
    participantNames: { parent: 'Mr. Ssemanda', teacher: 'Ms. Nakato' },
    messages: [
      { from: 'parent',  text: 'Good morning Ms. Nakato. How is David performing in Mathematics?', time: '2026-06-06 08:12' },
      { from: 'teacher', text: 'Good morning Mr. Ssemanda. David is doing well overall. He scored 78 in Bot 1 which is a B grade. He needs to work more on algebra.', time: '2026-06-06 09:45' },
      { from: 'parent',  text: 'Thank you. We will encourage him to practice more at home.', time: '2026-06-06 10:20' },
      { from: 'teacher', text: 'That would be great. Bot 2 is coming up and I am confident he can improve.', time: '2026-06-06 11:00' },
    ],
  },
  {
    id: 'c2',
    participants: ['admin', 'teacher'],
    participantNames: { admin: 'Mr. Okello', teacher: 'Ms. Nakato' },
    messages: [
      { from: 'admin',   text: 'Ms. Nakato please submit your S.4 marks by this Friday.', time: '2026-06-07 09:00' },
      { from: 'teacher', text: 'Noted Mr. Okello. I will have them ready by Thursday.', time: '2026-06-07 09:30' },
    ],
  },
  {
    id: 'c3',
    participants: ['parent', 'admin'],
    participantNames: { parent: 'Mr. Ssemanda', admin: 'Mr. Okello' },
    messages: [
      { from: 'parent', text: 'Good afternoon. I would like to discuss David\'s fee balance.', time: '2026-06-05 14:00' },
      { from: 'admin',  text: 'Good afternoon Mr. Ssemanda. Please come to the office on Monday at 10 AM and we can arrange a payment plan.', time: '2026-06-05 15:30' },
    ],
  },
]

// ─── Category styles ──────────────────────────────────────────────
export const categoryStyle = {
  Academic: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  Finance:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  Event:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  Staff:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200'},
  Students: { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200'  },
}