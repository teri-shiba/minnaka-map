'use client'

import type { FormEvent } from 'react'
import type { SavedStation, StationProps } from '~/types/station'
import { useCallback, useMemo, useState } from 'react'
import { Command, CommandInput } from '~/components/ui/command'
import { useLocalStorage } from '~/hooks/useLocalStorage'
import useSearchStation from '~/hooks/useSearchStation'
import StationSuggestions from './station-suggestions'

interface StationAutocompleteProps {
  value: string
  placeholder: string
  onChange: (value: string, stationId?: number, latitude?: number, longitude?: number) => void
  excludedStationIds?: number[]
}

export default function StationAutocomplete({
  value,
  placeholder,
  onChange,
  excludedStationIds,
}: StationAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [recentStations, setRecentStations, refreshRecentStations] = useLocalStorage<SavedStation[]>(
    'recentStations',
    [],
    { refreshOnFocus: true },
  )
  const { stations, isLoading, isError } = useSearchStation(value)

  const idExcludeSet = useMemo(() => new Set(excludedStationIds ?? []), [excludedStationIds])

  const handleInputChange = useCallback((e: FormEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value)
    setIsSelected(false)
  }, [onChange])

  const newHandleFocus = useCallback(() => {
    setIsFocused(true)

    if (value === '')
      setIsSelected(false)

    refreshRecentStations()
  }, [refreshRecentStations, value])

  const handleBlur = useCallback(() => {
    if (!isSelected && value !== '')
      onChange('')

    setIsFocused(false)
  }, [isSelected, onChange, value])

  const handleSelect = useCallback((station: StationProps) => {
    setIsSelected(true)
    onChange(station.name, station.id, station.latitude, station.longitude)

    setRecentStations((prev) => {
      const filtered = prev.filter(s => s.id !== station.id)
      return [{
        id: station.id,
        name: station.name,
        latitude: String(station.latitude),
        longitude: String(station.longitude),
      }, ...filtered].slice(0, 5)
    })
  }, [onChange, setRecentStations])

  const newMatchedRecent = useMemo(() => {
    const base: SavedStation[] = !value.trim()
      ? recentStations
      : recentStations.filter(saved =>
          stations.some((s: StationProps) => s.id === saved.id),
        )

    return base.filter(saved => !idExcludeSet.has(saved.id))
  }, [value, recentStations, stations, idExcludeSet])

  const newFilteredStations = useMemo(() => {
    return stations.filter((station: StationProps) =>
      !recentStations.some(s => s.id === station.id)
      && !idExcludeSet.has(station.id),
    )
  }, [stations, recentStations, idExcludeSet])

  return (
    <div>
      <Command
        className="relative overflow-visible focus-within:border-primary"
        shouldFilter={false}
        role="combobox"
      >
        <CommandInput
          value={value}
          onInput={handleInputChange}
          placeholder={placeholder}
          onFocus={newHandleFocus}
          onBlur={handleBlur}
          aria-controls="autocomplete-list"
          aria-expanded={isFocused && !isSelected}
          className="h-12 pr-5"
        />

        {(isFocused && !isSelected) && (
          <StationSuggestions
            isLoading={isLoading}
            isError={isError}
            filteredStations={newFilteredStations}
            matchedRecent={newMatchedRecent}
            onSelect={handleSelect}
          />
        )}
      </Command>
    </div>
  )
}
