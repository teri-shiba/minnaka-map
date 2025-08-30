export interface CarouselData {
  id: number
  imageUrl: string
  title: string
  text: string
}

export interface CarouselResult {
  activeStep: number
  startSequenceFrom: (stepId: number) => void
}
