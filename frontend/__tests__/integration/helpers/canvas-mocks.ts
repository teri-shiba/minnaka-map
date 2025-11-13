export function setupCanvasMocks() {
  vi.hoisted(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'mock-url')
    globalThis.URL.revokeObjectURL = vi.fn()

    class WorkerMock {
      url: string
      onmessage: ((event: MessageEvent) => void) | null = null

      constructor(url: string) {
        this.url = url
      }

      postMessage() {}
      terminate() {}
      addEventListener() {}
      removeEventListener() {}
      dispatchEvent() { return true }
    }

    globalThis.Worker = WorkerMock as any

    class ImageDataMock {
      data: Uint8ClampedArray
      width: number
      height: number

      constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.data = new Uint8ClampedArray(width * height * 4)
      }
    }

    globalThis.ImageData = ImageDataMock as any

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      canvas: {},
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: Array.from({ length: 4 }),
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })) as any
  })
}
