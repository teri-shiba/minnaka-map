'use client'

import type { AreaFormValues } from '~/schemas/station-search.schema'
import useSWRMutation from 'swr/mutation'
import { API_ENDPOINTS } from '~/constants'
import api from '~/lib/axios-interceptor'

interface MidpointResult {
  readonly midpoint: {
    readonly latitude: string
    readonly longitude: string
  }
  readonly signature: string
  readonly expire_at?: string
}

async function postMidpoint(
  _key: string,
  { arg }: { arg: AreaFormValues },
): Promise<MidpointResult> {
  const response = await api.post(API_ENDPOINTS.MIDPOINT, arg)
  return response.data as MidpointResult
}

export function useMidpointMutation() {
  return useSWRMutation(API_ENDPOINTS.MIDPOINT, postMidpoint, {
    throwOnError: true,
  })
}
