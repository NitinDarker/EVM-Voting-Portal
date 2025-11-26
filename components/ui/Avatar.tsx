interface AvatarProps {
  firstName: string
  lastName?: string
  size?: number
  className?: string
  colorIndex?: number
}

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-teal-400 to-cyan-600',
  'from-amber-400 to-orange-500',
  'from-purple-500 to-fuchsia-600',
  'from-emerald-400 to-green-600'
]

const Avatar = ({
  firstName,
  lastName = '',
  size = 40,
  className = '',
  colorIndex = 0
}: AvatarProps) => {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  const gradient = gradients[colorIndex % gradients.length]

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-linear-to-br ${gradient} text-white font-semibold hover:cursor-pointer hover:-translate-y-0.5 transition-all z-20 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`
      }}
    >
      {initials}
    </div>
  )
}

export default Avatar
