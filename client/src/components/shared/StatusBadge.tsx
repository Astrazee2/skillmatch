type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

type StatusBadgeProps =
  | { type: 'project'; status: ProjectStatus }
  | { type: 'application'; status: ApplicationStatus; variant?: 'sme' | 'specialist' }

const projectConfig: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', className: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
}

const applicationConfigSME: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
}

const applicationConfigSpecialist: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Under Review', className: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Accepted! 🎉', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Not Selected', className: 'bg-red-100 text-red-800' },
}

export default function StatusBadge(props: StatusBadgeProps) {
  if (props.type === 'project') {
    const config = projectConfig[props.status] || { label: props.status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }
  const config = props.variant === 'specialist'
    ? applicationConfigSpecialist[props.status]
    : applicationConfigSME[props.status]
  const fallback = { label: props.status, className: 'bg-gray-100 text-gray-800' }
  const { label, className } = config || fallback
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {label}
    </span>
  )
}
