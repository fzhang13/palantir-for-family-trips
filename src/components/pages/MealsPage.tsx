import { useState } from 'react'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { useMeals, useDeleteMeal } from '@/hooks'
import { TimelineGroup } from '@/components/ui/TimelineGroup'
import { DetailSidePanel } from '@/components/ui/DetailSidePanel'
import { AddMealModal, EditMealModal } from '@/components/modals'
import type { Meal } from '@/types'
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

export function MealsPage() {
  const { data: allMeals = [], isLoading, isError } = useMeals()
  const deleteMeal = useDeleteMeal()

  const [selectedDay, setSelectedDay] = useState('all')
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filter meals by selected day
  const filteredMeals = selectedDay === 'all'
    ? allMeals
    : allMeals.filter(meal => meal.dayId === selectedDay)

  // Group meals by day
  const groupedMeals = filteredMeals.reduce((groups, meal) => {
    if (!groups[meal.dayId]) {
      groups[meal.dayId] = []
    }
    groups[meal.dayId].push(meal)
    return groups
  }, {} as Record<string, Meal[]>)

  // Sort days chronologically
  const dayOrder = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed']
  const sortedDays = Object.keys(groupedMeals).sort((a, b) =>
    dayOrder.indexOf(a) - dayOrder.indexOf(b)
  )

  const handleDelete = (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      deleteMeal.mutate({ tripId: DEFAULT_TRIP_ID, mealId })
      setSelectedMeal(null)
    }
  }

  const handleEdit = (meal: Meal) => {
    setSelectedMeal(null)
    setEditingMeal(meal)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8B949E]">Loading meals...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#F85149]">Failed to load meals. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#0A0C10]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E] mb-1">
            Dining
          </div>
          <h1 className="text-2xl font-bold text-[#C9D1D9]">Meals</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
          aria-label="Add new meal"
        >
          <Plus size={16} />
          Add Meal
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
      {allMeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border border-[#30363D] rounded bg-[#161B22]">
          <UtensilsCrossed size={48} className="text-[#8B949E] mb-4" />
          <p className="text-[#8B949E] text-lg mb-2">No meals yet</p>
          <p className="text-[#8B949E] text-sm mb-4">Get started by adding your first meal</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
            aria-label="Add your first meal"
          >
            <Plus size={16} />
            Add Meal
          </button>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center text-[#8B949E] py-12">
          No meals scheduled for {DAY_OPTIONS.find(d => d.id === selectedDay)?.label}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {sortedDays.map(dayId => (
            <TimelineGroup
              key={dayId}
              dayId={dayId}
              dayLabel={DAY_LABELS[dayId] || dayId.toUpperCase()}
              items={groupedMeals[dayId]}
              onItemClick={(item) => setSelectedMeal(item as Meal)}
              onEdit={(item) => handleEdit(item as Meal)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Detail Side Panel */}
      <DetailSidePanel
        item={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onEdit={() => selectedMeal && handleEdit(selectedMeal)}
        onDelete={() => selectedMeal && handleDelete(selectedMeal.id)}
      />

      {/* Add Modal */}
      <AddMealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      {editingMeal && (
        <EditMealModal
          isOpen={true}
          onClose={() => setEditingMeal(null)}
          meal={editingMeal}
        />
      )}
    </div>
  )
}
