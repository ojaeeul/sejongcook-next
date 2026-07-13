import { useState, useEffect, useCallback } from 'react';

const cache: { [key: string]: any } = {};

export function useAdminData<T>(url: string) {
    const [data, setData] = useState<T | null>(cache[url] || null);
    const [loading, setLoading] = useState(!cache[url]);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (force = false) => {
        try {
            if (!force && cache[url]) {
                setData(cache[url]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now());
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();

            cache[url] = json;
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const mutate = useCallback((newData?: T) => {
        if (newData !== undefined) {
            cache[url] = newData;
            setData(newData);
        } else {
            fetchData(true);
        }
    }, [url, fetchData]);

    return { data, loading, error, mutate };
}
