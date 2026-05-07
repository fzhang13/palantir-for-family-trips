import { useState, useMemo } from 'react'
import { Plus, MapPin } from 'lucide-react'
import { useActivities, useDeleteActivity, useActiveTripId, useFamilies, useLocations } from '@/hooks'
import { TimelineGroup } from '@/components/ui/TimelineGroup'
import { DetailSidePanel } from '@/components/ui/DetailSidePanel'
import { AddActivityModal, EditActivityModal } from '@/components/modals'
import { formatFullDate } from '@/lib/dateUtils'
import type { Activity } from '@/types'

export function ActivitiesPage() {
  const { data: activeTripId } = useActiveTripId()
  const { data: allActivities = [], isLoading, isError } = useActivities()
  const { data: families = [] } = useFamilies()
  const { data: locations = [] } = useLocations(activeTripId || undefined)
  const deleteActivity = useDeleteActivity()

  const [selectedDate, setSelectedDate] = useState('all')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Generate unique dates from activities for filter buttons
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    allActivities.forEach(activity => {
      const date = activity.activityDate
      if (date) dates.add(date)
    })
    return Array.from(dates).sort()
  }, [allActivities])

  const dateOptions = useMemo(() => {
    return [
      { id: 'all', label: 'All Days' },
      ...availableDates.map(date => ({
        id: date,
        label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      }))
    ]
  }, [availableDates])

  // Filter activities by selected date
  const filteredActivities = selectedDate === 'all'
    ? allActivities
    : allActivities.filter(activity => {
        const activityDate = activity.activityDate
        return activityDate === selectedDate
      })

  // Group activities by date
  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((groups, activity) => {
      const date = activity.activityDate || 'unknown'
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {} as Record<string, Activity[]>)
  }, [filteredActivities])

  // Sort dates chronologically
  const sortedDates = useMemo(() => {
    return Object.keys(groupedActivities).sort((a, b) => {
      if (a === 'unknown') return 1
      if (b === 'unknown') return -1
      return a.localeCompare(b)
    })
  }, [groupedActivities])

  const handleDelete = (activityId: string) => {
    if (!activeTripId) return
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteActivity.mutate({ tripId: activeTripId, activityId })
      setSelectedActivity(null)
    }
  }

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(null)
    setEditingActivity(activity)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8B949E]">Loading activities...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#F85149]">Failed to load activities. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#0A0C10]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E] mb-1">
            Itinerary
          </div>
          <h1 className="text-2xl font-bold text-[#C9D1D9]">Activities</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
          aria-label="Add new activity"
        >
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      {/* Date Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {dateOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setSelectedDate(option.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDate === option.id
                ? 'bg-[#58A6FF] text-white'
                : 'bg-[#21262D] text-[#8B949E] hover:bg-[#30363D]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {allActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border border-[#30363D] rounded bg-[#161B22]">
          <MapPin size={48} className="text-[#8B949E] mb-4" />
          <p className="text-[#8B949E] text-lg mb-2">No activities yet</p>
          <p className="text-[#8B949E] text-sm mb-4">Get started by adding your first activity</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
            aria-label="Add your first activity"
          >
            <Plus size={16} />
            Add Activity
          </button>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center text-[#8B949E] py-12">
          No activities scheduled for {dateOptions.find(d => d.id === selectedDate)?.label}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {sortedDates.map(date => {
            const dateLabel = date === 'unknown'
              ? 'DATE UNKNOWN'
              : formatFullDate(new Date(date + 'T00:00:00')).toUpperCase()

            return (
              <TimelineGroup
                key={date}
                dayId={date}
                dayLabel={dateLabel}
                items={groupedActivities[date]}
                onItemClick={(item) => setSelectedActivity(item as Activity)}
                onEdit={(item) => handleEdit(item as Activity)}
                onDelete={handleDelete}
                locations={locations}
                families={families}
              />
            )
          })}
        </div>
      )}

      {/* Detail Side Panel */}
      <DetailSidePanel
        item={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onEdit={() => selectedActivity && handleEdit(selectedActivity)}
        onDelete={() => selectedActivity && handleDelete(selectedActivity.id)}
      />

      {/* Add Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      {editingActivity && (
        <EditActivityModal
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          activity={editingActivity}
        />
      )}
    </div>
  )
}
