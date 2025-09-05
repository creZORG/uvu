
"use client";

// This file is no longer used as individual program pages are now dynamically generated.
// It can be safely deleted. You can manage this content from the 'Projects' section 
// in the admin dashboard.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DeprecatedPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/programs');
    }, [router]);
    return null;
}

    