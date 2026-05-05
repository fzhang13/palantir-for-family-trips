import { useState } from 'react'
import { Plus, Edit2, Trash2, Users, MapPin, Calendar, Car } from 'lucide-react'
import { useFamilies, useDeleteFamily } from '@/hooks'
import { AddFamilyModal } from '@/components/modals'
import type { Family } from '@/types'

export function FamiliesPage() {
  const { data: families = [], isLoading, isError } = useFamilies()
  const deleteFamily = useDeleteFamily()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleDelete = (familyId: string) => {
    if (window.confirm('Are you sure you want to delete this family?')) {
      deleteFamily.mutate({ familyId })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8B949E]">Loading families...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#F85149]">Failed to load families. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#0A0C10]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E] mb-1">
            Travel Units
          </div>
          <h1 className="text-2xl font-bold text-[#C9D1D9]">Family Roster</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
          aria-label="Add new family"
        >
          <Plus size={16} />
          Add Family
        </button>
      </div>

      {/* Empty State */}
      {families.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border border-[#30363D] rounded bg-[#161B22]">
          <Users size={48} className="text-[#8B949E] mb-4" />
          <p className="text-[#8B949E] text-lg mb-2">No families yet</p>
          <p className="text-[#8B949E] text-sm mb-4">Get started by adding your first family</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
            aria-label="Add your first family"
          >
            <Plus size={16} />
            Add Family
          </button>
        </div>
      ) : (
        /* Family Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((family) => (
            <FamilyCard
              key={family.id}
              family={family}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Family Modal */}
      <AddFamilyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}

interface FamilyCardProps {
  family: Family
  onDelete: (familyId: string) => void
}

function FamilyCard({ family, onDelete }: FamilyCardProps) {
  return (
    <div className="border border-[#30363D] rounded bg-[#161B22] p-5 hover:border-[#58A6FF] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#C9D1D9] mb-1">
            {family.name || family.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#8B949E]">
            <MapPin size={14} />
            <span>{family.origin || family.shortOrigin}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              alert('Edit functionality coming soon')
            }}
            className="p-1.5 rounded text-[#8B949E] hover:text-[#58A6FF] hover:bg-[#21262D] transition-colors"
            aria-label={`Edit ${family.name || family.title}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(family.id)}
            className="p-1.5 rounded text-[#8B949E] hover:text-[#DA3633] hover:bg-[#21262D] transition-colors"
            aria-label={`Delete ${family.name || family.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5">
        {/* Arrival Day */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-[#8B949E]" />
          <span className="text-[#8B949E]">Arrival:</span>
          <span className="text-[#C9D1D9] font-mono">
            {family.arrivalDayId ? getDayLabel(family.arrivalDayId) : 'Not set'}
          </span>
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-2 text-sm">
          <Car size={14} className="text-[#8B949E]" />
          <span className="text-[#8B949E]">Vehicle:</span>
          <span className="text-[#C9D1D9]">{family.vehicle || 'Not specified'}</span>
        </div>

        {/* Headcount */}
        {family.headcount && (
          <div className="flex items-center gap-2 text-sm">
            <Users size={14} className="text-[#8B949E]" />
            <span className="text-[#8B949E]">Headcount:</span>
            <span className="text-[#C9D1D9]">{family.headcount}</span>
          </div>
        )}

        {/* Readiness Bar */}
        {typeof family.readiness === 'number' && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#8B949E]">Readiness</span>
              <span className="font-mono text-[#C9D1D9]">{family.readiness}%</span>
            </div>
            <div className="w-full bg-[#0d1117] rounded-full h-2">
              <div
                className="bg-[#3FB950] h-2 rounded-full transition-all"
                style={{ width: `${family.readiness}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getDayLabel(dayId: string): string {
  const dayMap: Record<string, string> = {
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
  }
  return dayMap[dayId.toLowerCase()] || dayId
}
