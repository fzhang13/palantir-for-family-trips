import { useState, useMemo } from 'react'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { useMeals, useDeleteMeal, useActiveTripId, useFamilies, useLocations } from '@/hooks'
import { TimelineGroup } from '@/components/ui/TimelineGroup'
import { DetailSidePanel } from '@/components/ui/DetailSidePanel'
import { AddMealModal, EditMealModal } from '@/components/modals'
import { formatFullDate } from '@/lib/dateUtils'
import type { Meal } from '@/types'

export function MealsPage() {
  const { data: activeTripId } = useActiveTripId()
  const { data: allMeals = [], isLoading, isError } = useMeals()
  const { data: families = [] } = useFamilies()
  const { data: locations = [] } = useLocations(activeTripId || undefined)
  const deleteMeal = useDeleteMeal()

  const [selectedDate, setSelectedDate] = useState('all')
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Generate unique dates from meals for filter buttons
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    allMeals.forEach(meal => {
      const date = meal.mealDate
      if (date) dates.add(date)
    })
    return Array.from(dates).sort()
  }, [allMeals])

  const dateOptions = useMemo(() => {
    return [
      { id: 'all', label: 'All Days' },
      ...availableDates.map(date => ({
        id: date,
        label: formatFullDate(new Date(date + 'T00:00:00')),
      })),
    ]
  }, [availableDates])

  // Filter meals by selected date
  const filteredMeals =
    selectedDate === 'all'
      ? allMeals
      : allMeals.filter(meal => {
          const mealDate = meal.mealDate
          return mealDate === selectedDate
        })

  // Group meals by date
  const groupedMeals = useMemo(() => {
    return filteredMeals.reduce(
      (groups, meal) => {
        const date = meal.mealDate || 'unknown'
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(meal)
        return groups
      },
      {} as Record<string, Meal[]>
    )
  }, [filteredMeals])

  // Sort dates chronologically
  const sortedDates = useMemo(() => {
    return Object.keys(groupedMeals).sort((a, b) => {
      if (a === 'unknown') return 1
      if (b === 'unknown') return -1
      return a.localeCompare(b)
    })
  }, [groupedMeals])

  const handleDelete = (mealId: string) => {
    if (!activeTripId) return
    if (window.confirm('Are you sure you want to delete this meal?')) {
      deleteMeal.mutate({ tripId: activeTripId, mealId })
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
          No meals scheduled for {dateOptions.find(d => d.id === selectedDate)?.label}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {sortedDates.map(date => {
            const dateLabel =
              date === 'unknown'
                ? 'DATE UNKNOWN'
                : formatFullDate(new Date(date + 'T00:00:00')).toUpperCase()

            return (
              <TimelineGroup
                key={date}
                dayId={date}
                dayLabel={dateLabel}
                items={groupedMeals[date]}
                onItemClick={item => setSelectedMeal(item as Meal)}
                onEdit={item => handleEdit(item as Meal)}
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
        item={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onEdit={() => selectedMeal && handleEdit(selectedMeal)}
        onDelete={() => selectedMeal && handleDelete(selectedMeal.id)}
        locations={locations}
      />

      {/* Add Modal */}
      <AddMealModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Edit Modal */}
      {editingMeal && (
        <EditMealModal isOpen={true} onClose={() => setEditingMeal(null)} meal={editingMeal} />
      )}
    </div>
  )
}
