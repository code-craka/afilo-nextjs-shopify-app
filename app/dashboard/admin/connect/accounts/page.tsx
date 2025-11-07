/**
 * Admin Connect Accounts Page
 *
 * Full account management interface for admins
 * Search, filter, and manage all Connect accounts
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ConnectAccountsManager } from '@/components/admin/ConnectAccountsManager';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Accounts | Admin Dashboard',
  description: 'Manage all Stripe Connect marketplace accounts',
};

async function verifyAdmin(userId: string): Promise<boolean> {
  const userProfile = await prisma.user_profiles.findFirst({
    where: { clerk_user_id: userId },
    select: { role: true },
  });

  return userProfile?.role === 'admin';
}

export default async function AdminConnectAccountsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard/admin/connect/accounts');
  }

  const isAdmin = await verifyAdmin(userId);

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <ConnectAccountsManager />
    </div>
  );
}
