// src/components/forms/FamilySelector.tsx
import { useState } from 'react'
import type { Family } from '@/types/trip'

interface FamilySelectorProps {
  selectedFamilyIds: string[]
  onChange: (familyIds: string[]) => void
  families: Family[]
}

export function FamilySelector({ selectedFamilyIds, onChange, families }: FamilySelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectedFamilies = families.filter(f => selectedFamilyIds.includes(f.id))
  const availableFamilies = families.filter(f => !selectedFamilyIds.includes(f.id))

  const handleAddFamily = (familyId: string) => {
    onChange([...selectedFamilyIds, familyId])
    setIsDropdownOpen(false)
  }

  const handleRemoveFamily = (familyId: string) => {
    onChange(selectedFamilyIds.filter(id => id !== familyId))
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 bg-[#0d1117] border border-[#30363D] rounded min-h-[44px]">
        {selectedFamilies.length === 0 && (
          <span className="text-[#8B949E] py-1">No owners assigned</span>
        )}

        {selectedFamilies.map(family => (
          <span
            key={family.id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#238636] text-white rounded-full text-sm"
          >
            {family.name}
            <button
              type="button"
              onClick={() => handleRemoveFamily(family.id)}
              className="hover:text-[#F85149] transition-colors"
            >
              ×
            </button>
          </span>
        ))}

        {availableFamilies.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1 bg-[#30363D] text-[#8B949E] rounded-full text-sm hover:bg-[#3D444D] transition-colors"
            >
              + Add family
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

                {/* Dropdown menu */}
                <div className="absolute top-full left-0 mt-1 bg-[#161B22] border border-[#30363D] rounded shadow-lg z-20 min-w-[200px]">
                  {availableFamilies.map(family => (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => handleAddFamily(family.id)}
                      className="w-full text-left px-4 py-2 text-[#C9D1D9] hover:bg-[#21262D] transition-colors"
                    >
                      {family.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
