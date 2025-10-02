import type { Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import useScrollToTopOnChange from '~/hooks/useScrollToTopOnChange'

interface RefLike<T extends HTMLElement> { current: T | null }
type ScrollToFn = (options?: ScrollToOptions | number, y?: number) => void
type ScrollableElement = HTMLElement & { scrollTo: Mock }

function makeRef<T extends HTMLElement>(element: T | null): RefLike<T> {
  return { current: element }
}

function makeElement(): ScrollableElement {
  const scrollTo = vi.fn<ScrollToFn>()
  return { scrollTo } as unknown as ScrollableElement
}

describe('useScrollToTopOnChange', () => {
  it('マウント時に top: 0, behavior: smooth で scrollTo が呼ばれる', () => {
    const element = makeElement()
    const ref = makeRef(element)
    renderHook(({ ref, depKey }) => useScrollToTopOnChange(ref, depKey), {
      initialProps: { ref, depKey: 'init' },
    })

    expect(element.scrollTo).toHaveBeenCalledTimes(1)
    expect(element.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('containerRef.current が null のときは何もしない', () => {
    const element = makeElement()
    const ref = makeRef<HTMLElement>(null)
    const { rerender } = renderHook(({ ref, depKey }) => useScrollToTopOnChange(ref, depKey), {
      initialProps: { ref, depKey: 'init' },
    })

    expect(element.scrollTo).not.toHaveBeenCalled()

    ref.current = element
    rerender({ ref, depKey: 'changed' })

    expect(element.scrollTo).toHaveBeenCalledTimes(1)
    expect(element.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('depKey が変わると再度 scrollTo が呼ばれる（ref は同一オブジェクト）', () => {
    const element = makeElement()
    const ref = makeRef(element)
    const { rerender } = renderHook(({ ref, depKey }) => useScrollToTopOnChange(ref, depKey), {
      initialProps: { ref, depKey: 'page-1' },
    })

    expect(element.scrollTo).toHaveBeenCalledTimes(1)

    rerender({ ref, depKey: 'page-2' })
    expect(element.scrollTo).toHaveBeenCalledTimes(2)
  })

  it('containerRef オブジェクト自体が変わると再度 scrollTo が呼ばれる', () => {
    const element = makeElement()
    const ref1 = makeRef(element)
    const { rerender } = renderHook(({ ref, depKey }) => useScrollToTopOnChange(ref, depKey), {
      initialProps: { ref: ref1, depKey: 'init' },
    })

    expect(element.scrollTo).toHaveBeenCalledTimes(1)

    const ref2 = makeRef(element)
    rerender({ ref: ref2, depKey: 'init' })

    expect(element.scrollTo).toHaveBeenCalledTimes(2)
  })

  it('依存が不変なまま再レンダーしても再度は呼ばれない', () => {
    const element = makeElement()
    const ref = makeRef(element)
    const { rerender } = renderHook(({ ref, depKey }) => useScrollToTopOnChange(ref, depKey), {
      initialProps: { ref, depKey: 'init' },
    })

    expect(element.scrollTo).toHaveBeenCalledTimes(1)

    rerender({ ref, depKey: 'init' })
    expect(element.scrollTo).toHaveBeenCalledTimes(1)
  })
})
