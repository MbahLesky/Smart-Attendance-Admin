import { addDays, format, subDays } from 'date-fns'

const now = new Date()

export const dashboardStats = [
  {
    label: 'Registered attendees',
    value: '1,284',
    change: '+12.4%',
    tone: 'info',
    detail: 'Across all organization',
  },
  {
    label: 'Sessions today',
    value: '18',
    change: '+3',
    tone: 'success',
    detail: '3 active now',
  },
  {
    label: 'Attendance rate',
    value: '93.8%',
    change: '+1.2%',
    tone: 'success',
    detail: 'Monthly average',
  },
  {
    label: 'Manual interventions',
    value: '14',
    change: '-5',
    tone: 'warning',
    detail: 'Fewer than last week',
  },
]

export const organizations = [
  {
    id: 'ORG-001',
    name: 'Bauhaven Organization',
    email: 'bauhavenorg@gmail.com',
    phone: '+237674345678',
    address: 'Mile 4 Nkwen, Bamenda, Cameroon',
    admin: 'Tangka Felicity',
    attendees: 420,
    status: 'Active',
  },
  {
    id: 'ORG-002',
    name: "St Paul's College",
    email: 'adnid@stpaul.org',
    phone: '+237674345678',
    address: 'Mile 3 Nkwen, Bamenda, Cameroon',
    admin: 'Mr. Ndifor',
    attendees: 318,
    status: 'Onboarding',
  },
  {
    id: 'ORG-003',
    name: "St. Fautino's College",
    email: 'stfaustino@gmail.com',
    phone: '+237674345678',
    address: 'Mile 4 Nkwen, Bamenda, Cameroon',
    admin: 'Mr. Achu',
    attendees: 546,
    status: 'Active',
  },
]

export const departments = [
  {
    id: 'DEP-101',
    name: 'Computer Science',
    organization: 'Bauhaven Organization',
    lead: 'Mr. Achu',
    attendees: 180,
    description: 'Programming and IT classes',
    status: 'Healthy',
  },
  {
    id: 'DEP-102',
    name: 'Software Engineering',
    organization: "St Paul's College",
    lead: 'Mrs Grace',
    attendees: 112,
    description: 'Shift-based practical attendance monitoring.',
    status: 'At Risk',
  },
  {
    id: 'DEP-103',
    name: 'Computer Science',
    organization: "St. Fautino's College",
    lead: 'Mr. Paul',
    attendees: 94,
    description: 'Computer Science classes',
    status: 'Healthy',
  },
]

export const attendees = [
  {
    id: 'ATT-1001',
    name: 'Brenda Ndzi',
    email: 'brenda.ndzi@bti.cm',
    phone: '+237674345678',
    department: 'Computer Science',
    organization: 'Bauhaven Organization',
    status: 'Active',
    attendanceRate: '98%',
  },
  {
    id: 'ATT-1002',
    name: 'Brian Achu',
    email: 'brianachu@gmail.com',
    phone: '+237674345678',
    department: 'Software Engineering',
    organization: "St Paul's College",
    status: 'Attention',
    attendanceRate: '84%',
  },
  {
    id: 'ATT-1003',
    name: 'Tangka Felicity',
    email: 'tangkafelicity@gmail.com',
    phone: '+237674345678',
    department: 'Computer Science',
    organization: "St. Fautino's College",
    status: 'Active',
    attendanceRate: '95%',
  },
  {
    id: 'ATT-1004',
    name: 'Ndzifor Ngwa',
    email: 'ndziforngwa@gmail.com',
    phone: '+237674345678',
    department: 'Computer Science',
    organization: 'Bauhaven Organization',
    status: 'Inactive',
    attendanceRate: '73%',
  },
]

export const sessions = [
  {
    id: 'SES-301',
    title: 'Programming 101',
    department: 'Computer Science',
    organization: 'Bauhaven Organization',
    date: format(now, 'MMM dd, yyyy'),
    window: '08:00 - 10:00',
    grace: '10 mins',
    status: 'Live',
    qr: 'QR ready',
  },
  {
    id: 'SES-302',
    title: 'Software Engineering',
    department: 'Software Engineering',
    organization: "St Paul's College",
    date: format(addDays(now, 1), 'MMM dd, yyyy'),
    window: '10:00 - 12:00',
    grace: '15 mins',
    status: 'Scheduled',
    qr: 'Pending',
  },
  {
    id: 'SES-303',
    title: 'Data Structures',
    department: 'Computer Science',
    organization: "St. Fautino's College",
    date: format(subDays(now, 1), 'MMM dd, yyyy'),
    window: '12:00 - 14:00',
    grace: '5 mins',
    status: 'Closed',
    qr: 'Archived',
  },
]

export const attendanceRecords = [
  {
    id: 'REC-9001',
    attendee: 'Brenda Ndzi',
    session: 'Programming 101',
    checkedAt: '08:03',
    status: 'Present',
    method: 'QR',
  },
  {
    id: 'REC-9002',
    attendee: 'Brian Achu',
    session: 'Programming 101',
    checkedAt: '08:14',
    status: 'Late',
    method: 'QR',
  },
  {
    id: 'REC-9003',
    attendee: 'Tangka Felicity',
    session: 'Data Structures',
    checkedAt: '12:20',
    status: 'Manual',
    method: 'Admin entry',
  },
]

export const notifications = [
  {
    id: 'NOT-1',
    title: 'Low attendance alert',
    message: 'Software Engineering dropped below 85% this week',
    time: '5 mins ago',
    tone: 'warning',
    read: false,
  },
  {
    id: 'NOT-2',
    title: 'New session created',
    message: 'Data Structures is ready to be displayed for check-in',
    time: '32 mins ago',
    tone: 'info',
    read: true,
  },
  {
    id: 'NOT-3',
    title: 'Report ready',
    message: 'Monthly report is ready to download',
    time: 'Yesterday',
    tone: 'success',
    read: true,
  },
]

export const historyRecords = [
  {
    id: 'HIS-1',
    date: format(subDays(now, 2), 'MMM dd, yyyy'),
    session: 'Data Structures',
    attendee: 'Tangka Felicity',
    status: 'Present',
    note: 'Checked in via QR within grace period.',
  },
  {
    id: 'HIS-2',
    date: format(subDays(now, 3), 'MMM dd, yyyy'),
    session: 'Software Engineering',
    attendee: 'Brian Achu',
    status: 'Late',
    note: 'Arrived after 15-minute grace period.',
  },
  {
    id: 'HIS-3',
    date: format(subDays(now, 4), 'MMM dd, yyyy'),
    session: 'Programming 101',
    attendee: 'Ndzifor Ngwa',
    status: 'Absent',
    note: 'No check-in before session close.',
  },
]

export const reportCards = [
  {
    title: 'Daily Attendance',
    value: '91.4%',
    detail: 'Compared to 89.6% yesterday',
  },
  {
    title: 'Late Check-ins',
    value: '36',
    detail: '8 fewer than last week',
  },
  {
    title: 'Export Queue',
    value: '3',
    detail: 'CSV, PDF, and executive summary',
  },
]
