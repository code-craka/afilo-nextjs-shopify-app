/**
 * Cookie Policy API Routes
 * Handles cookie policy version management
 *
 * @fileoverview API endpoints for cookie policy versioning and retrieval
 * @version 1.0
 * @compliance CCPA, PIPEDA, UK GDPR, Australia Privacy Act
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  CookiePolicyVersionSchema,
  type CookiePolicyVersion,
} from '@/lib/validations/cookie-consent';

/**
 * GET /api/cookies/policy
 * Retrieve current cookie policy version or specific version
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const version = searchParams.get('version');
    const includeHistory = searchParams.get('include_history') === 'true';

    if (version) {
      // Get specific version
      const policy = await prisma.cookie_policy_versions.findUnique({
        where: { version },
      });

      if (!policy) {
        return NextResponse.json(
          { error: 'Policy version not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        policy: {
          version: policy.version,
          effective_date: policy.effective_date,
          policy_content: policy.policy_content,
          policy_summary: policy.policy_summary,
          changelog: policy.changelog,
          is_current: policy.is_current,
          requires_reconsent: policy.requires_reconsent,
          created_at: policy.created_at,
        },
      });
    }

    if (includeHistory) {
      // Get all policy versions
      const policies = await prisma.cookie_policy_versions.findMany({
        orderBy: { effective_date: 'desc' },
      });

      return NextResponse.json({
        policies: policies.map(policy => ({
          version: policy.version,
          effective_date: policy.effective_date,
          policy_summary: policy.policy_summary,
          changelog: policy.changelog,
          is_current: policy.is_current,
          requires_reconsent: policy.requires_reconsent,
          created_at: policy.created_at,
        })),
        current_version: policies.find(p => p.is_current)?.version || '1.0',
      });
    }

    // Get current policy version (default behavior)
    const currentPolicy = await prisma.cookie_policy_versions.findFirst({
      where: { is_current: true },
    });

    if (!currentPolicy) {
      return NextResponse.json(
        { error: 'No current policy version found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      policy: {
        version: currentPolicy.version,
        effective_date: currentPolicy.effective_date,
        policy_content: currentPolicy.policy_content,
        policy_summary: currentPolicy.policy_summary,
        is_current: currentPolicy.is_current,
        requires_reconsent: currentPolicy.requires_reconsent,
      },
    });

  } catch (error: unknown) {
    console.error('GET /api/cookies/policy error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve policy' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cookies/policy
 * Create a new cookie policy version (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedPolicy: CookiePolicyVersion = CookiePolicyVersionSchema.parse(body);

    // Check if version already exists
    const existingPolicy = await prisma.cookie_policy_versions.findUnique({
      where: { version: validatedPolicy.version },
    });

    if (existingPolicy) {
      return NextResponse.json(
        { error: 'Policy version already exists' },
        { status: 409 }
      );
    }

    // Create new policy version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If this should be the current version, deactivate others
      if (body.is_current) {
        await tx.cookie_policy_versions.updateMany({
          where: { is_current: true },
          data: { is_current: false },
        });
      }

      // Create new policy version
      const newPolicy = await tx.cookie_policy_versions.create({
        data: {
          version: validatedPolicy.version,
          effective_date: new Date(validatedPolicy.effective_date),
          policy_content: validatedPolicy.policy_content,
          policy_summary: validatedPolicy.policy_summary,
          changelog: validatedPolicy.changelog,
          is_current: body.is_current || false,
          requires_reconsent: validatedPolicy.requires_reconsent,
          created_by: userId,
        },
      });

      return newPolicy;
    });

    return NextResponse.json({
      success: true,
      policy: {
        id: result.id,
        version: result.version,
        effective_date: result.effective_date,
        is_current: result.is_current,
        requires_reconsent: result.requires_reconsent,
        created_at: result.created_at,
      },
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('POST /api/cookies/policy error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to create policy version', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cookies/policy
 * Update existing policy version or set as current (admin only)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true },
    });

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { version, is_current, requires_reconsent } = body;

    if (!version) {
      return NextResponse.json(
        { error: 'Policy version is required' },
        { status: 400 }
      );
    }

    // Find existing policy
    const existingPolicy = await prisma.cookie_policy_versions.findUnique({
      where: { version },
    });

    if (!existingPolicy) {
      return NextResponse.json(
        { error: 'Policy version not found' },
        { status: 404 }
      );
    }

    // Update policy in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If setting as current, deactivate others
      if (is_current && !existingPolicy.is_current) {
        await tx.cookie_policy_versions.updateMany({
          where: { is_current: true },
          data: { is_current: false },
        });
      }

      // Update the policy
      const updatedPolicy = await tx.cookie_policy_versions.update({
        where: { version },
        data: {
          is_current: is_current ?? existingPolicy.is_current,
          requires_reconsent: requires_reconsent ?? existingPolicy.requires_reconsent,
        },
      });

      return updatedPolicy;
    });

    return NextResponse.json({
      success: true,
      policy: {
        version: result.version,
        is_current: result.is_current,
        requires_reconsent: result.requires_reconsent,
        effective_date: result.effective_date,
      },
    });

  } catch (error: unknown) {
    console.error('PUT /api/cookies/policy error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update policy', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}