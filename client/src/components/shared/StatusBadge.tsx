type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  variant?: 'sme' | 'specialist'
  className?: string
}

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', className: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
}

const APPLICATION_STATUS_SME: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
}

const APPLICATION_STATUS_SPECIALIST: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Under Review', className: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Accepted! 🎉', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Not Selected', className: 'bg-red-100 text-red-800' },
}

export function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status as ProjectStatus] ?? { label: status, className: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}

export function ApplicationStatusBadge({ status, variant = 'sme', className = '' }: ApplicationStatusBadgeProps) {
  const config = variant === 'specialist'
    ? (APPLICATION_STATUS_SPECIALIST[status as ApplicationStatus] ?? { label: status, className: 'bg-gray-100 text-gray-800' })
    : (APPLICATION_STATUS_SME[status as ApplicationStatus] ?? { label: status, className: 'bg-gray-100 text-gray-800' })
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
