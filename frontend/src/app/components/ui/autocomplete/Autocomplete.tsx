'use client'
import type { FormEvent } from 'react'
import type { StationProps } from '~/app/types/station'
import { useCallback, useState } from 'react'
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

export default function Autocomplete({
  value,
  placeholder,
  onChange,
}: AutocompleteProps) {
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const [recentStations, setRecentStations] = useLocalStorage<string[]>('recentStations', [])
  const { stations } = useSearchStation(value)

  const handleInputChange = useCallback((e: FormEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value)
    setIsSelected(false)
  }, [onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    if (!isSelected && value !== '') {
      onChange('')
    }
    setIsFocused(false)
    setIsSelected(false)
  }, [isSelected, onChange, value])

  const handleSelect = useCallback((stationName: string) => {
    setIsSelected(true)
    onChange(stationName)

    setRecentStations(prev =>
      [stationName, ...prev.filter(s => s !== stationName)].slice(0, 5),
    )
  }, [onChange, setRecentStations])

  const matchedRecent = recentStations.filter(
    name => name.includes(value),
  )

  const filteredStations = stations.filter(
    (station: StationProps) => !recentStations.includes(station.name),
  )

  const showSuggestions = isFocused && !isSelected && recentStations.length > 0

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
                    onSelect={() => handleSelect(station.name)}
                    className="cursor-pointer hover:bg-secondary"
                  >
                    {station.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {matchedRecent.length > 0 && (
              <CommandGroup heading="過去に検索した場所">
                {matchedRecent.map(name => (
                  <CommandItem
                    key={name}
                    onMouseDown={e => e.preventDefault()}
                    onSelect={() => handleSelect(name)}
                    className="cursor-pointer hover:bg-secondary"
                  >
                    {name}
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
