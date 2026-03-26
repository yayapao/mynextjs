import { NextRequest, NextResponse } from 'next/server';
import { readConfig, updateConfig, deleteConfig } from '@/lib/config';
import type { PartialUserConfig, UserConfig } from '@/lib/types/config';
import type { CommonResponse } from '@/lib/types/common';

/**
 * GET /api/config
 *
 * Read current user configuration from JSON file.
 *
 * @returns JSON response with current config or error message
 *
 * @example
 * const response = await fetch('/api/config');
 * const { data } = await response.json();
 * console.log(data.theme); // 'light' | 'dark'
 */
export async function GET() {
  try {
    const config = await readConfig();

    return NextResponse.json<CommonResponse<UserConfig>>({
      code: 0,
      data: config,
    });
  } catch (error) {
    console.error('GET /api/config error:', error);

    return NextResponse.json<CommonResponse>({
      code: 500,
      error: 'Failed to read configuration',
    });
  }
}

/**
 * PATCH /api/config
 *
 * Update user configuration (partial update).
 * Only the fields provided in the request body will be updated.
 *
 * @param request - Request with JSON body containing fields to update
 * @returns JSON response with updated config or error message
 *
 * @example
 * // Update theme only
 * const response = await fetch('/api/config', {
 *   method: 'PATCH',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ theme: 'dark' })
 * });
 */
export async function PATCH(request: NextRequest) {
  try {
    const updates: PartialUserConfig = await request.json();

    // Validate that at least one field is provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json<CommonResponse>({
        code: 400,
        error: 'No fields to update',
      });
    }

    const newConfig = await updateConfig(updates);

    return NextResponse.json<CommonResponse<UserConfig>>({
      code: 0,
      data: newConfig,
    });
  } catch (error) {
    console.error('PATCH /api/config error:', error);

    return NextResponse.json<CommonResponse>({
      code: 500,
      error: 'Failed to update configuration',
    });
  }
}

/**
 * PUT /api/config
 *
 * Replace entire user configuration.
 * All fields must be provided in the request body.
 *
 * @param request - Request with JSON body containing complete config
 * @returns JSON response with new config or error message
 *
 * @example
 * // Replace entire config
 * const response = await fetch('/api/config', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ theme: 'dark' })
 * });
 */
export async function PUT(request: NextRequest) {
  try {
    const config: PartialUserConfig = await request.json();

    // Validate required fields
    const requiredFields = ['theme'];
    const missingFields = requiredFields.filter((field) => !(field in config));

    if (missingFields.length > 0) {
      return NextResponse.json<CommonResponse>({
        code: 400,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const newConfig = await updateConfig(config);

    return NextResponse.json<CommonResponse<UserConfig>>({
      code: 0,
      data: newConfig,
    });
  } catch (error) {
    console.error('PUT /api/config error:', error);

    return NextResponse.json<CommonResponse>({
      code: 500,
      error: 'Failed to replace configuration',
    });
  }
}

/**
 * DELETE /api/config
 *
 * Delete configuration file and reset to defaults.
 * The next GET request will return default configuration.
 *
 * @returns JSON response indicating success or error
 *
 * @example
 * const response = await fetch('/api/config', {
 *   method: 'DELETE'
 * });
 */
export async function DELETE() {
  try {
    await deleteConfig();

    return NextResponse.json<CommonResponse>({
      code: 0,
    });
  } catch (error) {
    console.error('DELETE /api/config error:', error);

    return NextResponse.json<CommonResponse>({
      code: 500,
      error: 'Failed to delete configuration',
    });
  }
}
