export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  )
}
