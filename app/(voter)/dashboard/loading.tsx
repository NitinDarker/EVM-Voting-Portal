export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-8 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
      <div className="mt-8 h-64 bg-gray-200 rounded" />
    </div>
  )
}
