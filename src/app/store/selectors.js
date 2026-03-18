import { format } from 'date-fns'

export function normalizePhone(value) {
  return (value ?? '').replace(/\D/g, '')
}

export function sentenceCase(value) {
  return (value ?? '')
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function formatRole(role) {
  return sentenceCase(role)
}

export function formatName(user) {
  if (!user) {
    return 'Unknown user'
  }

  return `${user.firstName} ${user.lastName}`
}

export function formatDateLabel(value) {
  return format(new Date(value), 'MMM dd, yyyy')
}

export function formatTimeLabel(value) {
  const [hours, minutes] = value.split(':')
  const date = new Date(2026, 0, 1, Number(hours), Number(minutes))
  return format(date, 'hh:mm a')
}

export function formatWindow(session) {
  return `${formatTimeLabel(session.startTime)} - ${formatTimeLabel(session.endTime)}`
}

export function getCurrentUser(state) {
  return state.users.find((user) => user.id === state.auth.currentUserId) ?? null
}

export function isSuperAdmin(state) {
  return getCurrentUser(state)?.role === 'super_admin'
}

export function getAccessibleOrganizations(state) {
  const currentUser = getCurrentUser(state)

  if (!currentUser) {
    return []
  }

  if (currentUser.role === 'super_admin') {
    return state.organizations
  }

  return state.organizations.filter((organization) => organization.id === currentUser.organizationId)
}

export function getOrganizationById(state, organizationId) {
  return state.organizations.find((organization) => organization.id === organizationId) ?? null
}

export function getDepartmentById(state, departmentId) {
  return state.departments.find((department) => department.id === departmentId) ?? null
}

export function getUserById(state, userId) {
  return state.users.find((user) => user.id === userId) ?? null
}

export function getSessionById(state, sessionId) {
  return state.sessions.find((session) => session.id === sessionId) ?? null
}

export function getScopedDepartments(state, organizationId = state.ui.selectedOrganizationId) {
  if (!organizationId) {
    return []
  }

  return state.departments.filter((department) => department.organizationId === organizationId)
}

export function getScopedUsers(
  state,
  {
    organizationId = state.ui.selectedOrganizationId,
    departmentId = state.ui.selectedDepartmentId,
    roles = [],
  } = {},
) {
  return state.users.filter((user) => {
    const matchesOrganization = organizationId ? user.organizationId === organizationId : true
    const matchesDepartment = departmentId ? user.departmentId === departmentId : true
    const matchesRole = roles.length > 0 ? roles.includes(user.role) : true

    return matchesOrganization && matchesDepartment && matchesRole
  })
}

export function getScopedSessions(
  state,
  {
    organizationId = state.ui.selectedOrganizationId,
    departmentId = state.ui.selectedDepartmentId,
  } = {},
) {
  return state.sessions.filter((session) => {
    const matchesOrganization = organizationId ? session.organizationId === organizationId : true
    const matchesDepartment = departmentId ? session.departmentId === departmentId : true

    return matchesOrganization && matchesDepartment
  })
}

export function getParticipantsForSession(state, sessionId) {
  return state.sessionParticipants
    .filter((participant) => participant.sessionId === sessionId)
    .map((participant) => getUserById(state, participant.userId))
    .filter(Boolean)
}

export function getAttendanceForSession(state, sessionId) {
  return state.attendanceRecords
    .filter((record) => record.sessionId === sessionId)
    .map((record) => ({
      ...record,
      user: getUserById(state, record.userId),
      session: getSessionById(state, sessionId),
    }))
}

export function getAttendanceMatrix(state, sessionId) {
  const participants = getParticipantsForSession(state, sessionId)
  const records = getAttendanceForSession(state, sessionId)

  return participants.map((participant) => {
    const record = records.find((item) => item.userId === participant.id)

    return {
      participant,
      record: record ?? null,
    }
  })
}

export function getUnreadNotifications(state) {
  const currentUser = getCurrentUser(state)

  if (!currentUser) {
    return []
  }

  return state.notifications.filter((notification) => {
    const matchesCurrentUser = notification.userId === currentUser.id
    const matchesSuperAdmin = currentUser.role === 'super_admin'

    return !notification.read && (matchesCurrentUser || matchesSuperAdmin)
  })
}

export function getDashboardMetrics(state, organizationId = state.ui.selectedOrganizationId) {
  const scopedUsers = getScopedUsers(state, { organizationId, roles: ['attendee'] })
  const scopedSessions = getScopedSessions(state, { organizationId })
  const scopedAttendance = state.attendanceRecords.filter((record) => {
    const session = getSessionById(state, record.sessionId)
    return organizationId ? session?.organizationId === organizationId : true
  })

  const presentCount = scopedAttendance.filter((record) => record.status === 'present').length
  const lateCount = scopedAttendance.filter((record) => record.status === 'late').length
  const attendanceRate = scopedAttendance.length
    ? Math.round(((presentCount + lateCount) / Math.max(scopedUsers.length, 1)) * 100)
    : 0

  return {
    organizationCount: organizationId ? 1 : state.organizations.length,
    attendeeCount: scopedUsers.length,
    sessionCount: scopedSessions.length,
    activeSessionCount: scopedSessions.filter((session) => session.status === 'active').length,
    attendanceRate,
    lateCount,
  }
}
