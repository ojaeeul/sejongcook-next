'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-4">
            <div className="bg-red-50 p-8 rounded-lg border border-red-100 max-w-md w-full">
                <h2 className="text-2xl font-bold text-red-600 mb-4">문제가 발생했습니다.</h2>
                <p className="text-gray-600 mb-6">
                    페이지를 로드하는 도중 오류가 발생했습니다.<br />
                    잠시 후 다시 시도해 주세요.
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
                >
                    다시 시도하기
                </button>
            </div>
            <p className="mt-8 text-sm text-gray-400">
                오류가 지속되면 관리자에게 문의바랍니다.
            </p>
        </div>
    );
}
