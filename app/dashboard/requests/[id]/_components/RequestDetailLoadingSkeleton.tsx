function SkeletonLine({ className = '' }: { className?: string }) {
  return <span className={`block h-3 rounded bg-gray-200 ${className}`} aria-hidden />
}

export function RequestDetailLoadingSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading request"
    >
      <span className="sr-only">Loading request workspace.</span>

      <div className="animate-pulse" aria-hidden>
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <SkeletonLine className="w-28" />
            <span className="block h-7 w-72 max-w-full rounded bg-gray-200" />
            <div className="flex flex-wrap gap-2">
              <span className="h-6 w-24 rounded-full bg-gray-200" />
              <span className="h-6 w-32 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="flex gap-2">
            <span className="h-10 w-28 rounded-lg bg-gray-200" />
            <span className="h-10 w-24 rounded-lg bg-gray-200" />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-hidden border-b border-gray-200 pb-3">
          {[72, 92, 104, 80].map((width) => (
            <span
              key={width}
              className="h-8 shrink-0 rounded-lg bg-gray-200"
              style={{ width }}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <SkeletonLine className="w-40" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="space-y-2">
                    <SkeletonLine className="w-20" />
                    <SkeletonLine className="w-4/5" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <SkeletonLine className="w-48" />
              <div className="mt-5 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3">
                    <span className="h-5 w-5 shrink-0 rounded bg-gray-200" />
                    <SkeletonLine className={item === 1 ? 'w-3/5' : 'w-4/5'} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            {[0, 1].map((item) => (
              <section key={item} className="rounded-lg border border-gray-200 bg-white p-5">
                <SkeletonLine className="w-32" />
                <div className="mt-4 space-y-3">
                  <SkeletonLine className="w-full" />
                  <SkeletonLine className="w-5/6" />
                  <SkeletonLine className="w-2/3" />
                </div>
              </section>
            ))}
          </aside>
        </div>
      </div>
    </main>
  )
}
