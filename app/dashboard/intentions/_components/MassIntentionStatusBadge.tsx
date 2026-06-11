export function MassIntentionStatusBadge({ isFulfilled }: { isFulfilled: boolean }) {
  if (isFulfilled) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
        Fulfilled
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-950 ring-1 ring-amber-200/80">
      Unfulfilled
    </span>
  )
}
