import { renderHook } from '@testing-library/react'
import useScrollToTopOnChange from '~/hooks/useScrollToTopOnChange'

interface RefLike<T extends HTMLElement> { current: T | null }

function makeRef<T extends HTMLElement>(element: T | null): RefLike<T> {
  return { current: element }
}

function makeElement() {
  return { scrollTo: jest.fn() } as unknown as HTMLElement
}

describe('useScrollToTopOnChange', () => {
  it('マウント時に top: 0, behavior: smooth で scrollTo が呼ばれる', () => {
    const element = makeElement()
    const ref = makeRef(element)
    renderHook(({ ref, key }) => useScrollToTopOnChange(ref, key), {
      initialProps: { ref, key: 'init' },
    })

    expect((element as any).scrollTo).toHaveBeenCalledTimes(1)
    expect((element as any).scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('containerRef.current が null のときは何もしない', () => {
    const element = makeElement()
    const ref = makeRef<HTMLElement>(null)
    const { rerender } = renderHook(({ ref, key }) => useScrollToTopOnChange(ref, key), {
      initialProps: { ref, key: 'init' },
    })

    expect((element as any).scrollTo).not.toHaveBeenCalled()

    ref.current = element
    rerender({ ref, key: 'changed' })

    expect((element as any).scrollTo).toHaveBeenCalledTimes(1)
    expect((element as any).scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('depKey が変わると再度 scrollTo が呼ばれる（ref は同一オブジェクト）', () => {
    const element = makeElement()
    const ref = makeRef(element)
    const { rerender } = renderHook(({ ref, key }) => useScrollToTopOnChange(ref, key), {
      initialProps: { ref, key: 'page-1' },
    })

    expect((element as any).scrollTo).toHaveBeenCalledTimes(1)

    rerender({ ref, key: 'page-2' })
    expect((element as any).scrollTo).toHaveBeenCalledTimes(2)
  })

  it('containerRef オブジェクト自体が変わると再度 scrollTo が呼ばれる', () => {
    const element = makeElement()
    const ref1 = makeRef(element)
    const { rerender } = renderHook(({ ref, key }) => useScrollToTopOnChange(ref, key), {
      initialProps: { ref: ref1, key: 'init' },
    })

    expect((element as any).scrollTo).toHaveBeenCalledTimes(1)

    const ref2 = makeRef(element)
    rerender({ ref: ref2, key: 'init' })

    expect((element as any).scrollTo).toHaveBeenCalledTimes(2)
  })

  it('依存が不変なまま再レンダーしても再度は呼ばれない', () => {
    const element = makeElement()
    const ref = makeRef(element)
    const { rerender } = renderHook(({ ref, key }) => useScrollToTopOnChange(ref, key), {
      initialProps: { ref, key: 'init' },
    })

    expect((element as any).scrollTo).toHaveBeenCalledTimes(1)

    rerender({ ref, key: 'init' })
    expect((element as any).scrollTo).toHaveBeenCalledTimes(1)
  })
})
