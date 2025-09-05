'use client'

import useSWRMutation from 'swr/mutation'
import { API_ENDPOINTS } from '~/constants'
import api from '~/lib/axios-interceptor'

interface MidpointRequest {
  area: { station_ids: number[] }
}

interface MidpointResult {
  readonly midpoint: {
    readonly latitude: string
    readonly longitude: string
  }
  readonly signature: string
  readonly expires_at?: string
}

async function postMidpoint(
  _key: string,
  { arg }: { arg: MidpointRequest },
): Promise<MidpointResult> {
  const response = await api.post(API_ENDPOINTS.MIDPOINT, arg)
  return response.data as MidpointResult
}

export function useMidpointMutation() {
  return useSWRMutation<MidpointResult, Error, string, MidpointRequest>(
    API_ENDPOINTS.MIDPOINT,
    postMidpoint,
    { throwOnError: true },
  )
}
