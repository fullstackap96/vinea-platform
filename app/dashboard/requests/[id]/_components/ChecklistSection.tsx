import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'

export function ChecklistSection({
  checklistItems,
  onToggleChecklistItem,
}: {
  checklistItems: any[]
  onToggleChecklistItem: (itemId: string, currentValue: boolean) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Checklist</h2>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white shadow-sm"
          >
            <div>
              <p className="font-medium text-gray-900">{item.item_name}</p>
              <p className="text-sm text-gray-700">
                {item.is_complete ? 'Complete' : 'Incomplete'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggleChecklistItem(item.id, item.is_complete)}
              className={`${primaryButtonMd} w-full shrink-0 justify-center sm:w-auto`}
            >
              {item.is_complete ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
