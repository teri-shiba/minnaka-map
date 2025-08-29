'use client'

import type { SavedStation, StationProps } from '~/types/station'
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from '~/components/ui/command'
import Loading from '~/public/figure_loading_circle.svg'

interface StationSuggestionsProps {
  isLoading: boolean
  isError: boolean
  filteredStations: StationProps[]
  matchedRecent: SavedStation[]
  onSelect: (station: StationProps) => void
}

export default function StationSuggestions({
  isLoading,
  isError,
  filteredStations,
  matchedRecent,
  onSelect,
}: StationSuggestionsProps) {
  if (isLoading) {
    return (
      <CommandList
        id="autocomplete-list"
        className="absolute -left-px top-full z-10 mt-2 box-content w-full rounded-md border border-input bg-white"
      >
        <CommandEmpty className="p-2 text-center text-sm">
          <Loading
            aria-label="ローディング中"
            width={28}
            height={28}
            className="mx-auto"
          />
        </CommandEmpty>
      </CommandList>
    )
  }

  if (isError) {
    return (

      <CommandList
        id="autocomplete-list"
        className="absolute -left-px top-full z-10 mt-2 box-content w-full rounded-md border border-input bg-white"
      >
        <CommandEmpty className="p-2 text-center text-sm">
          エラーが発生しました
        </CommandEmpty>
      </CommandList>
    )
  }

  return (
    <CommandList
      id="autocomplete-list"
      className="absolute -left-px top-full z-10 mt-2 box-content w-full rounded-md border border-input bg-white"
    >
      <CommandEmpty className="p-2 text-center text-sm">
        入力候補がありません
      </CommandEmpty>
      {(filteredStations.length > 0) && (
        <CommandGroup heading="駅候補">
          {filteredStations.map((station: StationProps) => (
            <CommandItem
              key={station.id}
              onMouseDown={e => e.preventDefault()}
              onSelect={() => onSelect(station)}
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
              onSelect={() => onSelect({
                ...station,
                latitude: Number(station.latitude),
                longitude: Number(station.longitude),
              })}
              className="cursor-pointer hover:bg-secondary"
            >
              {station.name}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>
  )
}
