import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  getAccessibleOrganizations,
  getAttendanceForSession,
  getAttendanceMatrix,
  getDashboardMetrics,
  getParticipantsForSession,
  getScopedDepartments,
  getScopedSessions,
  getScopedUsers,
  getUnreadNotifications,
} from './selectors'
import { useAppStore } from './useAppStore'

function useAttendanceState() {
  return useAppStore(
    useShallow((state) => ({
      attendanceRecords: state.attendanceRecords,
      sessionParticipants: state.sessionParticipants,
      sessions: state.sessions,
      users: state.users,
    })),
  )
}

export function useAccessibleOrganizations() {
  return useAppStore(useShallow(getAccessibleOrganizations))
}

export function useUnreadNotifications() {
  return useAppStore(useShallow(getUnreadNotifications))
}

export function useScopedDepartments(organizationId) {
  return useAppStore(useShallow((state) => getScopedDepartments(state, organizationId)))
}

export function useScopedUsers(options = {}) {
  const { organizationId, departmentId, roles } = options

  return useAppStore(
    useShallow((state) =>
      getScopedUsers(state, {
        organizationId,
        departmentId,
        roles,
      }),
    ),
  )
}

export function useScopedSessions(options = {}) {
  const { organizationId, departmentId } = options

  return useAppStore(
    useShallow((state) =>
      getScopedSessions(state, {
        organizationId,
        departmentId,
      }),
    ),
  )
}

export function useDashboardMetrics(organizationId) {
  return useAppStore(useShallow((state) => getDashboardMetrics(state, organizationId)))
}

export function useAttendanceMatrix(sessionId) {
  const attendanceState = useAttendanceState()

  return useMemo(
    () => (sessionId ? getAttendanceMatrix(attendanceState, sessionId) : []),
    [attendanceState, sessionId],
  )
}

export function useAttendanceForSession(sessionId) {
  const attendanceState = useAttendanceState()

  return useMemo(
    () => (sessionId ? getAttendanceForSession(attendanceState, sessionId) : []),
    [attendanceState, sessionId],
  )
}

export function useParticipantsForSession(sessionId) {
  const attendanceState = useAttendanceState()

  return useMemo(
    () => (sessionId ? getParticipantsForSession(attendanceState, sessionId) : []),
    [attendanceState, sessionId],
  )
}

export function useScopedAttendanceMatrices(options = {}) {
  const sessions = useScopedSessions(options)
  const attendanceState = useAttendanceState()

  return useMemo(
    () =>
      sessions.map((session) => ({
        session,
        matrix: getAttendanceMatrix(attendanceState, session.id),
      })),
    [attendanceState, sessions],
  )
}
