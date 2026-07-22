export const LoadingSpinner = ({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) => {
  const sz = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
      <div className={`${sz} animate-spin rounded-full border-2 border-gray-200 border-t-brand-500`} />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  )
}

export const ErrorBox = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
    <p className="font-semibold mb-0.5">Something went wrong</p>
    <p className="text-red-600/80">{message}</p>
  </div>
)
