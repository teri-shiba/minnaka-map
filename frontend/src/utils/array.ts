export function createSequence(count: number, startAt = 1): number[] {
  return Array.from({ length: count }, (_, i) => i + startAt)
}
