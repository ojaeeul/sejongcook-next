'use client';

import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
    const hasTracked = useRef(false);

    useEffect(() => {
        // Run only once per session/mount
        if (hasTracked.current) return;

        const trackVisit = async () => {
            // Check session storage so we don't count navigating across pages
            if (sessionStorage.getItem('hasVisited')) return;

            try {
                // Determine API endpoint based on environment
                let url = '/api/visitors';
                if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
                    // In production hosting on Hostinger
                    url = '/api.php?board=visitors';
                }

                await fetch(url, { method: 'POST' });
                sessionStorage.setItem('hasVisited', 'true');
                hasTracked.current = true;
            } catch (error) {
                console.error('Failed to track visitor:', error);
            }
        };

        trackVisit();
    }, []);

    return null; // This component doesn't render anything
}
