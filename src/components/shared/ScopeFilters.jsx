import { Select } from '../ui/select'

export function ScopeFilters({
  organizations = [],
  departments = [],
  sessions = [],
  selectedOrganizationId = '',
  selectedDepartmentId = '',
  selectedSessionId = '',
  onOrganizationChange,
  onDepartmentChange,
  onSessionChange,
  showSession = false,
  organizationDisabled = false,
  departmentDisabled = false,
  sessionDisabled = false,
}) {
  return (
    <div className={`grid gap-4 ${showSession ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
      <div>
        <label className="mb-2 block text-label">Organization</label>
        <Select
          value={selectedOrganizationId ?? ''}
          onChange={(event) => onOrganizationChange(event.target.value)}
          disabled={organizationDisabled}
        >
          <option value="">Select organization</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-label">Department</label>
        <Select
          value={selectedDepartmentId ?? ''}
          onChange={(event) => onDepartmentChange(event.target.value)}
          disabled={departmentDisabled}
        >
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
      </div>
      {showSession ? (
        <div>
          <label className="mb-2 block text-label">Session</label>
          <Select
            value={selectedSessionId ?? ''}
            onChange={(event) => onSessionChange(event.target.value)}
            disabled={sessionDisabled}
          >
            <option value="">Select session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
    </div>
  )
}
