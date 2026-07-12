import { vineaSectionShellClassName } from '@/lib/vineaUi'

const skeletonWidths = ['w-40', 'w-56', 'w-32'] as const

export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading parish workspace"
      className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8"
      role="status"
    >
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="h-8 w-64 max-w-full rounded bg-gray-200" />
        <div className="h-4 w-full max-w-lg rounded bg-gray-100" />
      </div>

      <section className={`${vineaSectionShellClassName} space-y-4`}>
        <span className="sr-only">Loading the selected parish view.</span>
        <div className="h-5 w-44 rounded bg-gray-200" />
        <div className="grid gap-3 sm:grid-cols-3">
          {skeletonWidths.map((width) => (
            <div
              className="min-h-28 rounded-lg border border-gray-200 bg-gray-50 p-4"
              key={width}
            >
              <div className={`h-4 ${width} max-w-full rounded bg-gray-200`} />
              <div className="mt-4 h-7 w-16 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
