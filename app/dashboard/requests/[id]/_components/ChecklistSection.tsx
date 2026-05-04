import React from 'react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { MissingValue } from '@/lib/missingValue'

export function ChecklistSection({
  checklistItems,
  onToggleChecklistItem,
}: {
  checklistItems: any[]
  onToggleChecklistItem: (itemId: string, currentValue: boolean) => void
}) {
  return (
    <div>
      <div className="divide-y divide-gray-100">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{item.item_name}</p>
              <p className="text-sm text-gray-700">
                {item.is_complete ? (
                  'Complete'
                ) : (
                  <MissingValue>Incomplete</MissingValue>
                )}
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
