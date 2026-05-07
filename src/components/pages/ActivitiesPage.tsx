import { useState } from 'react'
import { Plus, MapPin } from 'lucide-react'
import { useActivities, useDeleteActivity } from '@/hooks'
import { TimelineGroup } from '@/components/ui/TimelineGroup'
import { DetailSidePanel } from '@/components/ui/DetailSidePanel'
import { AddActivityModal, EditActivityModal } from '@/components/modals'
import type { Activity } from '@/types'
import { DEFAULT_TRIP_ID } from '@/lib/constants'

const DAY_OPTIONS = [
  { id: 'all', label: 'All Days' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' },
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
]

const DAY_LABELS: Record<string, string> = {
  thu: 'THURSDAY',
  fri: 'FRIDAY',
  sat: 'SATURDAY',
  sun: 'SUNDAY',
  mon: 'MONDAY',
  tue: 'TUESDAY',
  wed: 'WEDNESDAY',
}

export function ActivitiesPage() {
  const { data: allActivities = [], isLoading, isError } = useActivities()
  const deleteActivity = useDeleteActivity()

  const [selectedDay, setSelectedDay] = useState('all')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filter activities by selected day
  const filteredActivities = selectedDay === 'all'
    ? allActivities
    : allActivities.filter(activity => activity.dayId === selectedDay)

  // Group activities by day
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    if (!groups[activity.dayId]) {
      groups[activity.dayId] = []
    }
    groups[activity.dayId].push(activity)
    return groups
  }, {} as Record<string, Activity[]>)

  // Sort days chronologically
  const dayOrder = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed']
  const sortedDays = Object.keys(groupedActivities).sort((a, b) =>
    dayOrder.indexOf(a) - dayOrder.indexOf(b)
  )

  const handleDelete = (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteActivity.mutate({ tripId: DEFAULT_TRIP_ID, activityId })
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

      {/* Day Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {DAY_OPTIONS.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDay === day.id
                ? 'bg-[#58A6FF] text-white'
                : 'bg-[#21262D] text-[#8B949E] hover:bg-[#30363D]'
            }`}
          >
            {day.label}
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
          No activities scheduled for {DAY_OPTIONS.find(d => d.id === selectedDay)?.label}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {sortedDays.map(dayId => (
            <TimelineGroup
              key={dayId}
              dayId={dayId}
              dayLabel={DAY_LABELS[dayId] || dayId.toUpperCase()}
              items={groupedActivities[dayId]}
              onItemClick={(item) => setSelectedActivity(item as Activity)}
              onEdit={(item) => handleEdit(item as Activity)}
              onDelete={handleDelete}
            />
          ))}
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
