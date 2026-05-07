import { X, MapPin } from 'lucide-react'
import type { Meal, Activity } from '@/types'

interface DetailSidePanelProps {
  item: Meal | Activity | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function DetailSidePanel({ item, onClose, onEdit, onDelete }: DetailSidePanelProps) {
  if (!item) return null

  const isMeal = item.type === 'meal'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0A0C10] border-l border-[#30363D] z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-[#30363D] flex items-start justify-between">
          <h2 className="text-xl font-semibold text-[#C9D1D9]">
            {item.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#21262D] transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Day */}
          <div>
            <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Day</div>
            <div className="text-[#C9D1D9]">{item.dayId}</div>
          </div>

          {/* Status */}
          <div>
            <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Status</div>
            <div className="text-[#C9D1D9]">{item.status}</div>
          </div>

          {/* Meal-specific fields */}
          {isMeal && (
            <>
              <div>
                <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Time</div>
                <div className="text-[#C9D1D9] font-mono">
                  {(item as Meal).timeLabel || 'Time TBD'}
                </div>
              </div>
              {(item as Meal).owner && (
                <div>
                  <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Owner</div>
                  <div className="text-[#C9D1D9]">{(item as Meal).owner}</div>
                </div>
              )}
              {(item as Meal).reservationType && (
                <div>
                  <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Reservation Type</div>
                  <div className="text-[#C9D1D9]">{(item as Meal).reservationType}</div>
                </div>
              )}
            </>
          )}

          {/* Activity-specific fields */}
          {!isMeal && (
            <>
              <div>
                <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Window</div>
                <div className="text-[#C9D1D9]">
                  {(item as Activity).window || 'Window TBD'}
                </div>
              </div>
              {(item as Activity).riskLevel && (
                <div>
                  <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Risk Level</div>
                  <div className="text-[#C9D1D9]">{(item as Activity).riskLevel}</div>
                </div>
              )}
              {(item as Activity).weatherSensitivity && (
                <div>
                  <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Weather Sensitivity</div>
                  <div className="text-[#C9D1D9]">{(item as Activity).weatherSensitivity}</div>
                </div>
              )}
              {(item as Activity).description && (
                <div>
                  <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Description</div>
                  <div className="text-[#C9D1D9]">{(item as Activity).description}</div>
                </div>
              )}
              {(item as Activity).backup && (
                <div>
                  <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Backup Plan</div>
                  <div className="text-[#C9D1D9]">{(item as Activity).backup}</div>
                </div>
              )}
            </>
          )}

          {/* Location */}
          {item.locationId && (
            <div>
              <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Location</div>
              <div className="flex items-center gap-2 text-[#C9D1D9]">
                <MapPin size={14} />
                <span>Location linked</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {item.note && (
            <div>
              <div className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Notes</div>
              <div className="text-[#C9D1D9] whitespace-pre-wrap">{item.note}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#30363D] flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2 bg-[#DA3633] text-white text-sm font-medium rounded hover:bg-[#F85149] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}
