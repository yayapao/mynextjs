import { NextRequest, NextResponse } from 'next/server';
import { readConfig, updateConfig, deleteConfig } from '@/lib/config';
import type { PartialUserConfig } from '@/lib/types/config';

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

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('GET /api/config error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read configuration',
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
    }

    const newConfig = await updateConfig(updates);

    return NextResponse.json({
      success: true,
      data: newConfig,
    });
  } catch (error) {
    console.error('PATCH /api/config error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update configuration',
      },
      { status: 500 }
    );
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
 *   body: JSON.stringify({
 *     theme: 'dark',
 *     language: 'zh',
 *     notifications: true,
 *     sidebar: 'collapsed'
 *   })
 * });
 */
export async function PUT(request: NextRequest) {
  try {
    const config: PartialUserConfig = await request.json();

    // Validate required fields
    const requiredFields = ['theme', 'language', 'notifications', 'sidebar'];
    const missingFields = requiredFields.filter(
      (field) => !(field in config)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newConfig = await updateConfig(config);

    return NextResponse.json({
      success: true,
      data: newConfig,
    });
  } catch (error) {
    console.error('PUT /api/config error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to replace configuration',
      },
      { status: 500 }
    );
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

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('DELETE /api/config error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete configuration',
      },
      { status: 500 }
    );
  }
}
