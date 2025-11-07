/**
 * Admin Connect Transfers Page
 *
 * Full transfer management interface for admins
 * Create transfers and view all marketplace transfers
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { TransferManager } from '@/components/admin/TransferManager';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Transfers | Admin Dashboard',
  description: 'Create and manage marketplace transfers',
};

async function verifyAdmin(userId: string): Promise<boolean> {
  const userProfile = await prisma.user_profiles.findFirst({
    where: { clerk_user_id: userId },
    select: { role: true },
  });

  return userProfile?.role === 'admin';
}

export default async function AdminConnectTransfersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/admin/connect/transfers');
  }

  const isAdmin = await verifyAdmin(userId);

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <TransferManager />
    </div>
  );
}
