
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// This is a temporary workaround to block navigation in Next.js App Router.
// A more robust solution might be available in future Next.js versions.
// We are listening for the popstate event to detect back/forward button usage.
// For <Link> clicks, we can't directly block them, so we rely on the beforeunload event,
// which is handled on the quiz page itself. This component adds an extra layer for browser navigation.

export function NavigationBlocker({ shouldBlock }: { shouldBlock: boolean }) {
  const [showDialog, setShowDialog] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (shouldBlock) {
        // Prevent the browser's default back/forward action
        history.pushState(null, '', pathname);
        setShowDialog(true);
        // We can't know the next URL from popstate, so we can't redirect.
        // We just block the action.
        setNextUrl(null); 
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, pathname, router]);

  const handleConfirm = () => {
    // This is where you would handle the actual navigation if confirmed.
    // However, for an exam, we simply close the dialog and keep them on the page.
    setShowDialog(false);
  };
  
  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are You Sure You Want to Leave?</AlertDialogTitle>
          <AlertDialogDescription>
            Leaving this page will void your exam submission, and you will be disqualified. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Stay on Page</AlertDialogCancel>
          {/* In a real scenario, this might navigate, but for an exam, we can just have it close the dialog */}
          <AlertDialogAction onClick={handleConfirm}>I Understand</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
