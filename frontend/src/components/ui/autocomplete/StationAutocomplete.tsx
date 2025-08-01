'use client'
import type { FormEvent } from 'react'
import type { SavedStation, StationProps } from '~/types/station'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '~/hooks/useLocalStorage'
import useSearchStation from '~/hooks/useSearchStation'
import { Command, CommandInput } from '../command/Command'
import StationSuggestions from './StationSuggestions'

interface StationAutocompleteProps {
  value: string
  placeholder: string
  onChange: (value: string, latitude?: number, longitude?: number) => void
  excludedStations?: string[]
}

export default function StationAutocomplete({
  value,
  placeholder,
  onChange,
  excludedStations,
}: StationAutocompleteProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [recentStations, setRecentStations, refreshRecentStations] = useLocalStorage<SavedStation[]>(
    'recentStations',
    [],
    { refreshOnFocus: true },
  )
  const { stations, isLoading, isError } = useSearchStation(value)

  const excludedStationNames = useMemo(() => {
    return excludedStations ?? []
  }, [excludedStations])

  const prevValueRef = useRef(value)
  if (prevValueRef.current !== value) {
    if (value === '') {
      setIsSelected(false)
    }
    prevValueRef.current = value
  }

  const handleInputChange = useCallback((e: FormEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value)
    setIsSelected(false)
  }, [onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    refreshRecentStations()
  }, [refreshRecentStations])

  const handleBlur = useCallback(() => {
    if (!isSelected && value !== '') {
      onChange('')
    }
    setIsFocused(false)
  }, [isSelected, onChange, value])

  const handleSelect = useCallback((station: StationProps) => {
    setIsSelected(true)
    onChange(station.name, station.latitude, station.longitude)

    setRecentStations((prev) => {
      const filtered = prev.filter(s => s.id !== station.id)
      return [{
        id: station.id,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
      }, ...filtered].slice(0, 5)
    })
  }, [onChange, setRecentStations])

  const matchedRecent = useMemo(() => {
    if (!value.trim()) {
      return recentStations.filter(
        saved => !excludedStationNames.includes(saved.name),
      )
    }
    return recentStations.filter(saved =>
      stations.some((station: StationProps) => station.id === saved.id)
      && !excludedStationNames.includes(saved.name),
    )
  }, [value, recentStations, stations, excludedStationNames])

  const filteredStations = useMemo(() => {
    return stations.filter(
      (station: StationProps) =>
        !recentStations.some(s => s.id === station.id)
        && !excludedStationNames.includes(station.name),
    )
  }, [stations, recentStations, excludedStationNames])

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
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="h-12"
        />

        {(isFocused && !isSelected) && (
          <StationSuggestions
            isLoading={isLoading}
            isError={isError}
            filteredStations={filteredStations}
            matchedRecent={matchedRecent}
            onSelect={handleSelect}
          />
        )}
      </Command>
    </div>
  )
}
