'use client'

import {
  REQUEST_DETAIL_TABS,
  type RequestDetailTabId,
} from './requestDetailTabs'

type Props = {
  activeTab: RequestDetailTabId
  onTabChange: (tab: RequestDetailTabId) => void
}

export function RequestDetailTabNav({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="mt-5 border-b border-gray-200 sm:mt-6"
      role="tablist"
      aria-label="Request sections"
    >
      <div className="-mb-px flex gap-1 overflow-x-auto pb-px scrollbar-thin">
        {REQUEST_DETAIL_TABS.map((tab) => {
          const selected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`request-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`request-tabpanel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 rounded-t-lg border px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 sm:px-4 ${
                selected
                  ? 'border-gray-200 border-b-white bg-white text-gray-900 shadow-sm'
                  : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
