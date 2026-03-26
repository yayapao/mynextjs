import type { CommonResponse } from '@/lib/types/common';
import type { PartialUserConfig, UserConfig } from '@/lib/types/config';
import { fetchC } from '@/lib/fetch-client';

export async function patchConfig(body: PartialUserConfig) {
  try {
    const res = await fetchC('/api/config', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to save theme: ${res.statusText}`);
    }

    return res.json() as Promise<CommonResponse<UserConfig>>;
  } catch (error) {
    return {
      code: 500,
      error,
    };
  }
}
