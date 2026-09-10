// ─── Registered schools ───────────────────────────────────────────
export const schools = [
  { id: 'sch1', name: "St. Mary's College",       district: 'Kampala',  type: 'Secondary', enrolment: 842,  passRate: 81, attendance: 91, compliance: 'compliant',     feesReturns: true,  termReturns: true  },
  { id: 'sch2', name: 'Kampala High School',       district: 'Kampala',  type: 'Secondary', enrolment: 1204, passRate: 76, attendance: 88, compliance: 'compliant',     feesReturns: true,  termReturns: true  },
  { id: 'sch3', name: 'Wakiso Secondary School',   district: 'Wakiso',   type: 'Secondary', enrolment: 654,  passRate: 68, attendance: 84, compliance: 'pending',       feesReturns: false, termReturns: true  },
  { id: 'sch4', name: 'Mukono Progressive School', district: 'Mukono',   type: 'Secondary', enrolment: 432,  passRate: 72, attendance: 79, compliance: 'pending',       feesReturns: true,  termReturns: false },
  { id: 'sch5', name: 'Jinja College',             district: 'Jinja',    type: 'Secondary', enrolment: 987,  passRate: 77, attendance: 86, compliance: 'compliant',     feesReturns: true,  termReturns: true  },
  { id: 'sch6', name: 'Mbale Secondary School',    district: 'Mbale',    type: 'Secondary', enrolment: 521,  passRate: 65, attendance: 75, compliance: 'non-compliant', feesReturns: false, termReturns: false },
  { id: 'sch7', name: 'Gulu High School',          district: 'Gulu',     type: 'Secondary', enrolment: 398,  passRate: 70, attendance: 80, compliance: 'pending',       feesReturns: false, termReturns: true  },
  { id: 'sch8', name: 'Lira Modern School',        district: 'Lira',     type: 'Secondary', enrolment: 312,  passRate: 63, attendance: 72, compliance: 'non-compliant', feesReturns: false, termReturns: false },
]

// ─── District summary ─────────────────────────────────────────────
export const districtSummary = [
  { district: 'Kampala', schools: 48, enrolment: 42100, passRate: 79, compliance: 92 },
  { district: 'Wakiso',  schools: 36, enrolment: 28400, passRate: 74, compliance: 78 },
  { district: 'Mukono',  schools: 28, enrolment: 18600, passRate: 68, compliance: 71 },
  { district: 'Jinja',   schools: 31, enrolment: 22800, passRate: 77, compliance: 85 },
  { district: 'Mbale',   schools: 24, enrolment: 14900, passRate: 65, compliance: 63 },
  { district: 'Gulu',    schools: 19, enrolment: 11200, passRate: 70, compliance: 68 },
  { district: 'Lira',    schools: 16, enrolment:  9400, passRate: 63, compliance: 59 },
]

// ─── Policy rollouts ──────────────────────────────────────────────
export const policies = [
  {
    id: 'pol1',
    title: 'New Lower Secondary Curriculum',
    description: 'Implementation of the revised lower secondary curriculum for S.1 and S.2 covering competency-based learning across all subjects.',
    deadline: '2026-09-01',
    status: 'active',
    adoptionRate: 78,
    compliantSchools: 194,
    totalSchools: 248,
    category: 'Curriculum',
  },
  {
    id: 'pol2',
    title: 'Digital Literacy Integration',
    description: 'All secondary schools must integrate digital literacy as a standalone subject for S.1 to S.3 students. ICT labs or tablet programs required.',
    deadline: '2026-12-31',
    status: 'active',
    adoptionRate: 45,
    compliantSchools: 112,
    totalSchools: 248,
    category: 'Technology',
  },
  {
    id: 'pol3',
    title: 'School Feeding Programme',
    description: 'Government-subsidised school feeding programme for day scholars. Schools must provide at least one meal per day for enrolled students.',
    deadline: '2026-07-15',
    status: 'urgent',
    adoptionRate: 61,
    compliantSchools: 151,
    totalSchools: 248,
    category: 'Welfare',
  },
  {
    id: 'pol4',
    title: 'Gender Parity Enrolment Drive',
    description: 'Schools must achieve at least 45% female enrolment. Schools below this threshold must submit action plans to the district education office.',
    deadline: '2027-02-01',
    status: 'active',
    adoptionRate: 83,
    compliantSchools: 206,
    totalSchools: 248,
    category: 'Equity',
  },
]

// ─── Term returns status ──────────────────────────────────────────
export const termReturns = [
  { type: 'Enrolment returns',    submitted: 221, pending: 27, deadline: '2026-05-15' },
  { type: 'Fee collection report', submitted: 198, pending: 50, deadline: '2026-06-01' },
  { type: 'Staff returns',        submitted: 235, pending: 13, deadline: '2026-05-30' },
  { type: 'Exam results upload',  submitted: 187, pending: 61, deadline: '2026-06-20' },
]

export const complianceStyle = {
  'compliant':     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Compliant'     },
  'pending':       { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  label: 'Pending'       },
  'non-compliant': { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Non-compliant' },
}

export const policyStatusStyle = {
  'active': { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'Active'  },
  'urgent': { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Urgent'  },
  'done':   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Done'    },
}