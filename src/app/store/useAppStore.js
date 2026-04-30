import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { initialPrototypeState } from './mockData'
import { getAccessibleOrganizations, getCurrentUser, normalizePhone } from './selectors'

const DEMO_CODE = '482913'
const PERSISTENCE_KEY = 'rollog-prototype'
const LEGACY_PERSISTENCE_KEY = 'smart-attendance-prototype'

function createAppStorage() {
  return {
    getItem: (name) => {
      const currentValue = localStorage.getItem(name)

      if (currentValue || name !== PERSISTENCE_KEY) {
        return currentValue
      }

      return localStorage.getItem(LEGACY_PERSISTENCE_KEY)
    },
    setItem: (name, value) => {
      localStorage.setItem(name, value)

      if (name === PERSISTENCE_KEY && localStorage.getItem(LEGACY_PERSISTENCE_KEY)) {
        localStorage.removeItem(LEGACY_PERSISTENCE_KEY)
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(name)

      if (name === PERSISTENCE_KEY) {
        localStorage.removeItem(LEGACY_PERSISTENCE_KEY)
      }
    },
  }
}

function cloneInitialState() {
  return JSON.parse(JSON.stringify(initialPrototypeState))
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createQrToken(sessionTitle) {
  const normalized = sessionTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 10)

  return `${normalized}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function pushNotification(state, notification) {
  return [
    {
      id: createId('notification'),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    },
    ...state.notifications,
  ]
}

function resolveSelectedOrganization(state, currentUserId) {
  const draftState = {
    ...state,
    auth: {
      ...state.auth,
      currentUserId,
    },
  }
  const currentUser = getCurrentUser(draftState)
  const organizations = getAccessibleOrganizations(draftState)

  if (!currentUser) {
    return null
  }

  if (currentUser.organizationId) {
    return currentUser.organizationId
  }

  return organizations[0]?.id ?? null
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...cloneInitialState(),

      resetDemo: () => {
        set(cloneInitialState())
      },

      signIn: ({ identifier, password }) => {
        const state = get()
        const normalizedIdentifier = identifier.trim().toLowerCase()
        const normalizedPhone = normalizePhone(identifier)
        const matchedUser = state.users.find((user) => {
          const matchesEmail = user.email.toLowerCase() === normalizedIdentifier
          const matchesPhone = normalizePhone(user.phone) === normalizedPhone
          const isAdminRole = ['super_admin', 'organization_admin'].includes(user.role)

          return (
            isAdminRole &&
            user.status === 'active' &&
            user.mockPassword === password &&
            (matchesEmail || matchesPhone)
          )
        })

        if (!matchedUser) {
          return {
            success: false,
            message: 'The credentials do not match an active admin account.',
          }
        }

        const selectedOrganizationId = resolveSelectedOrganization(state, matchedUser.id)

        set((currentState) => ({
          ...currentState,
          auth: {
            ...currentState.auth,
            currentUserId: matchedUser.id,
            verification: null,
          },
          ui: {
            selectedOrganizationId,
            selectedDepartmentId: null,
            selectedSessionId: null,
          },
        }))

        return {
          success: true,
          user: matchedUser,
        }
      },

      signOut: () => {
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            currentUserId: null,
            verification: null,
          },
          ui: {
            selectedOrganizationId: null,
            selectedDepartmentId: null,
            selectedSessionId: null,
          },
        }))
      },

      beginRegistration: (payload) => {
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            verification: {
              type: 'registration',
              code: DEMO_CODE,
              payload,
            },
          },
        }))

        return {
          success: true,
          code: DEMO_CODE,
        }
      },

      completeRegistration: (code) => {
        const state = get()
        const verification = state.auth.verification

        if (!verification || verification.type !== 'registration') {
          return {
            success: false,
            message: 'No registration is waiting for verification.',
          }
        }

        if (code !== verification.code) {
          return {
            success: false,
            message: 'The verification code is incorrect.',
          }
        }

        const organizationId = createId('org')
        const userId = createId('user')
        const organization = {
          id: organizationId,
          name: verification.payload.organizationName,
          email: verification.payload.email,
          phone: verification.payload.phone,
          address: verification.payload.address,
          logoUrl: '',
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        const user = {
          id: userId,
          authUserId: createId('auth'),
          organizationId,
          departmentId: null,
          firstName: verification.payload.firstName,
          lastName: verification.payload.lastName,
          email: verification.payload.email,
          phone: verification.payload.phone,
          role: 'organization_admin',
          employeeCode: `ORG-ADM-${Math.floor(Math.random() * 900 + 100)}`,
          status: 'active',
          avatarUrl: '',
          mockPassword: verification.payload.password,
          createdAt: new Date().toISOString(),
        }

        set((currentState) => ({
          ...currentState,
          organizations: [organization, ...currentState.organizations],
          users: [user, ...currentState.users],
          notifications: pushNotification(currentState, {
            userId,
            title: 'Workspace created',
            message: `${organization.name} is ready for department, attendee, and session setup.`,
            tone: 'success',
          }),
          auth: {
            currentUserId: userId,
            verification: null,
          },
          ui: {
            selectedOrganizationId: organizationId,
            selectedDepartmentId: null,
            selectedSessionId: null,
          },
        }))

        return {
          success: true,
        }
      },

      beginPasswordReset: (email) => {
        const state = get()
        const targetUser = state.users.find(
          (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
        )

        if (!targetUser) {
          return {
            success: false,
            message: 'That email is not part of the current mock admin dataset.',
          }
        }

        set((currentState) => ({
          ...currentState,
          auth: {
            ...currentState.auth,
            verification: {
              type: 'password_reset',
              code: DEMO_CODE,
              userId: targetUser.id,
              email: targetUser.email,
            },
          },
        }))

        return {
          success: true,
          code: DEMO_CODE,
        }
      },

      completePasswordReset: ({ code, password }) => {
        const state = get()
        const verification = state.auth.verification

        if (!verification || verification.type !== 'password_reset') {
          return {
            success: false,
            message: 'No password reset request is waiting for verification.',
          }
        }

        if (code !== verification.code) {
          return {
            success: false,
            message: 'The verification code is incorrect.',
          }
        }

        set((currentState) => ({
          ...currentState,
          users: currentState.users.map((user) =>
            user.id === verification.userId ? { ...user, mockPassword: password } : user,
          ),
          auth: {
            ...currentState.auth,
            verification: null,
          },
        }))

        return {
          success: true,
        }
      },

      setSelectedOrganization: (organizationId) => {
        set((state) => ({
          ...state,
          ui: {
            ...state.ui,
            selectedOrganizationId: organizationId,
            selectedDepartmentId: null,
            selectedSessionId: null,
          },
        }))
      },

      setSelectedDepartment: (departmentId) => {
        set((state) => ({
          ...state,
          ui: {
            ...state.ui,
            selectedDepartmentId: departmentId,
            selectedSessionId: null,
          },
        }))
      },

      setSelectedSession: (sessionId) => {
        set((state) => ({
          ...state,
          ui: {
            ...state.ui,
            selectedSessionId: sessionId,
          },
        }))
      },

      createOrganization: (payload) => {
        const organization = {
          id: createId('org'),
          logoUrl: '',
          status: payload.status ?? 'active',
          createdAt: new Date().toISOString(),
          ...payload,
        }

        set((state) => ({
          ...state,
          organizations: [organization, ...state.organizations],
          notifications: pushNotification(state, {
            userId: state.auth.currentUserId,
            title: 'Organization created',
            message: `${payload.name} was added to the workspace directory.`,
            tone: 'success',
          }),
        }))

        return organization
      },

      updateOrganization: (organizationId, payload) => {
        set((state) => ({
          ...state,
          organizations: state.organizations.map((organization) =>
            organization.id === organizationId ? { ...organization, ...payload } : organization,
          ),
        }))
      },

      createDepartment: (payload) => {
        const department = {
          id: createId('dept'),
          createdAt: new Date().toISOString(),
          ...payload,
        }

        set((state) => ({
          ...state,
          departments: [department, ...state.departments],
          ui: {
            ...state.ui,
            selectedOrganizationId: payload.organizationId,
          },
          notifications: pushNotification(state, {
            userId: state.auth.currentUserId,
            title: 'Department created',
            message: `${payload.name} is ready for attendee assignment.`,
            tone: 'success',
          }),
        }))

        return department
      },

      updateDepartment: (departmentId, payload) => {
        set((state) => ({
          ...state,
          departments: state.departments.map((department) =>
            department.id === departmentId ? { ...department, ...payload } : department,
          ),
        }))
      },

      createUser: (payload) => {
        const user = {
          id: createId('user'),
          authUserId: createId('auth'),
          avatarUrl: '',
          mockPassword: payload.password,
          createdAt: new Date().toISOString(),
          ...payload,
        }

        set((state) => ({
          ...state,
          users: [user, ...state.users],
          notifications: pushNotification(state, {
            userId: state.auth.currentUserId,
            title: 'User added',
            message: `${payload.firstName} ${payload.lastName} is now assigned to the selected organization flow.`,
            tone: 'success',
          }),
        }))

        return user
      },

      updateUser: (userId, payload) => {
        set((state) => ({
          ...state,
          users: state.users.map((user) => (user.id === userId ? { ...user, ...payload } : user)),
        }))
      },

      toggleUserStatus: (userId) => {
        set((state) => ({
          ...state,
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: user.status === 'active' ? 'inactive' : 'active',
                }
              : user,
          ),
        }))
      },

      createSession: (payload) => {
        const state = get()
        const sessionId = createId('session')
        const session = {
          id: sessionId,
          createdBy: state.auth.currentUserId,
          qrToken: createQrToken(payload.title),
          attendanceMethod: payload.attendanceMethod ?? 'qr',
          locationRequired: payload.locationRequired ?? false,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          radiusMeters: payload.radiusMeters ?? null,
          status: payload.status ?? 'draft',
          createdAt: new Date().toISOString(),
          ...payload,
        }

        const participants = state.users
          .filter((user) => user.role === 'attendee' && user.status === 'active')
          .filter((user) => user.organizationId === payload.organizationId)
          .filter((user) => (payload.departmentId ? user.departmentId === payload.departmentId : true))
          .map((user) => ({
            id: createId('participant'),
            sessionId,
            userId: user.id,
            createdAt: new Date().toISOString(),
          }))

        set((currentState) => ({
          ...currentState,
          sessions: [session, ...currentState.sessions],
          sessionParticipants: [...participants, ...currentState.sessionParticipants],
          notifications: pushNotification(currentState, {
            userId: currentState.auth.currentUserId,
            title: 'Session created',
            message: `${payload.title} is saved as a draft and ready for QR generation.`,
            tone: 'success',
          }),
          ui: {
            selectedOrganizationId: payload.organizationId,
            selectedDepartmentId: payload.departmentId ?? null,
            selectedSessionId: sessionId,
          },
        }))

        return session
      },

      updateSession: (sessionId, payload) => {
        set((state) => ({
          ...state,
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...payload } : session,
          ),
        }))
      },

      openSessionQr: (sessionId) => {
        const state = get()
        const session = state.sessions.find((item) => item.id === sessionId)

        if (!session) {
          return {
            success: false,
            message: 'That session could not be found.',
          }
        }

        set((currentState) => ({
          ...currentState,
          sessions: currentState.sessions.map((item) =>
            item.id === sessionId && item.status === 'draft' ? { ...item, status: 'active' } : item,
          ),
          notifications: pushNotification(currentState, {
            userId: currentState.auth.currentUserId,
            title: 'QR flow opened',
            message: `${session.title} is now available for attendee check-in.`,
            tone: 'info',
          }),
          ui: {
            ...currentState.ui,
            selectedOrganizationId: session.organizationId,
            selectedDepartmentId: session.departmentId,
            selectedSessionId: sessionId,
          },
        }))

        return {
          success: true,
        }
      },

      markAttendanceManually: ({ sessionId, userId, status, remarks }) => {
        const state = get()
        const existingRecord = state.attendanceRecords.find(
          (record) => record.sessionId === sessionId && record.userId === userId,
        )
        const timestamp = new Date().toISOString()
        const recordId = existingRecord?.id ?? createId('attendance')
        const nextRecord = {
          id: recordId,
          sessionId,
          userId,
          checkInTime: timestamp,
          status,
          method: 'manual',
          latitude: null,
          longitude: null,
          deviceInfo: 'Admin manual entry',
          photoUrl: '',
          remarks,
          createdAt: existingRecord?.createdAt ?? timestamp,
          updatedAt: timestamp,
        }

        set((currentState) => ({
          ...currentState,
          attendanceRecords: existingRecord
            ? currentState.attendanceRecords.map((record) =>
                record.id === recordId ? nextRecord : record,
              )
            : [nextRecord, ...currentState.attendanceRecords],
          attendanceLogs: [
            {
              id: createId('log'),
              attendanceRecordId: recordId,
              action: existingRecord ? 'Manual attendance updated' : 'Manual attendance created',
              metadata: {
                actor: currentState.auth.currentUserId,
              },
              createdAt: timestamp,
            },
            ...currentState.attendanceLogs,
          ],
        }))

        return nextRecord
      },

      markNotificationRead: (notificationId) => {
        set((state) => ({
          ...state,
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification,
          ),
        }))
      },

      markAllNotificationsRead: () => {
        const currentUser = getCurrentUser(get())

        set((state) => ({
          ...state,
          notifications: state.notifications.map((notification) => {
            const matchesCurrentUser = currentUser ? notification.userId === currentUser.id : false
            const matchesSuperAdmin = currentUser?.role === 'super_admin'

            return matchesCurrentUser || matchesSuperAdmin
              ? { ...notification, read: true }
              : notification
          }),
        }))
      },

      updateCurrentProfile: (payload) => {
        const currentUserId = get().auth.currentUserId

        if (!currentUserId) {
          return
        }

        set((state) => ({
          ...state,
          users: state.users.map((user) =>
            user.id === currentUserId ? { ...user, ...payload } : user,
          ),
        }))
      },

      updateSettings: (payload) => {
        set((state) => ({
          ...state,
          settings: {
            ...state.settings,
            ...payload,
          },
        }))
      },
    }),
    {
      name: PERSISTENCE_KEY,
      storage: createJSONStorage(createAppStorage),
      version: 1,
    },
  ),
)
