'use client'
import type { FormEvent } from 'react'
import type { StationProps } from '~/app/types/station'
import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage } from '~/app/hooks/useLocalStorage'
import useSearchStation from '~/app/hooks/useSearchStation'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command/Command'

interface AutocompleteProps {
  value: string
  placeholder: string
  onChange: (value: string) => void
}

interface SavedStation {
  id: number
  name: string
}

export default function Autocomplete({
  value,
  placeholder,
  onChange,
}: AutocompleteProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [recentStations, setRecentStations, refreshRecentStations] = useLocalStorage<SavedStation[]>(
    'recentStations',
    [],
    { refreshOnFocus: true },
  )
  const { stations, isLoading, isError } = useSearchStation(value)

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
    setIsSelected(false)
  }, [isSelected, onChange, value])

  const handleSelect = useCallback((station: StationProps) => {
    setIsSelected(true)
    onChange(station.name)

    setRecentStations((prev) => {
      const filtered = prev.filter(s => s.id !== station.id)
      return [{ id: station.id, name: station.name }, ...filtered].slice(0, 5)
    })
  }, [onChange, setRecentStations])

  const matchedRecent = useMemo(() => {
    if (!value.trim()) {
      return recentStations
    }

    return recentStations.filter((saved) =>
      stations.some((station: StationProps) => station.id === saved.id)
    )
  }, [recentStations, stations])

  const filteredStations = useMemo(() => {
    return stations.filter(
      (station: StationProps) => !recentStations.some(s => s.id === station.id)
    )
  }, [stations, recentStations])

  const showSuggestions = isFocused && !isSelected && (
    filteredStations.length > 0 || matchedRecent.length > 0
  )

  return (
    <div>
      <Command
        className="relative overflow-visible focus-within:border-primary"
        shouldFilter={false}
      >
        <CommandInput
          value={value}
          onInput={handleInputChange}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="h-12"
        />

        {/* {isLoading && (
          <CommandList
            className="absolute -left-px top-full z-10 mt-2 box-content w-full rounded-md border border-input bg-white"
          >
            <CommandEmpty className="p-2 text-center text-sm">
              ローディング中
            </CommandEmpty>
          </CommandList>
        )}
        {isError && (
          <CommandList
            className="absolute -left-px top-full z-10 mt-2 box-content w-full rounded-md border border-input bg-white"
          >
            <CommandEmpty className="p-2 text-center text-sm">
              エラー発生
            </CommandEmpty>
          </CommandList>
        )} */}

        {showSuggestions && (
          <CommandList
            className="absolute -left-px top-full z-10 mt-2 box-content w-full rounded-md border border-input bg-white"
          >
            {(filteredStations.length > 0) && (
              <CommandGroup heading="駅候補">
                {filteredStations.map((station: StationProps) => (
                  <CommandItem
                    key={station.id}
                    onMouseDown={e => e.preventDefault()}
                    onSelect={() => handleSelect(station)}
                    className="cursor-pointer hover:bg-secondary"
                  >
                    {station.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {matchedRecent.length > 0 && (
              <CommandGroup heading="過去に検索した場所">
                {matchedRecent.map(station => (
                  <CommandItem
                    key={station.id}
                    onMouseDown={e => e.preventDefault()}
                    onSelect={() => handleSelect(station as StationProps)}
                    className="cursor-pointer hover:bg-secondary"
                  >
                    {station.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredStations.length === 0 && value !== '' && (
              <CommandEmpty className="p-2 text-center text-sm">
                入力候補がありません
              </CommandEmpty>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
