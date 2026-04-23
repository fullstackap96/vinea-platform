'use client'

import { useHashSectionHighlight } from '../_hooks/useHashSectionHighlight'

/**
 * Enables smooth scroll + temporary highlight when using in-page anchors
 * (`#assignment`, etc.) on the request detail page. Renders nothing.
 */
export function RequestSectionHashNavigator() {
  useHashSectionHighlight()
  return null
}
