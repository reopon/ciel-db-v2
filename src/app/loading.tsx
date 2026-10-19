// Root-level loading.tsx wraps every route's page content in a Suspense
// boundary, so this one file covers navigation across the whole site (the
// header/nav from layout.tsx stays visible, only the content area below it
// shows this spinner while the next page's data is loading).
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 rounded-full border-2 border-brand/25 border-t-brand animate-spin" />
    </div>
  )
}
