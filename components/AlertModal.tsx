'use client';

import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'success' | 'warning' | 'error' | 'info';
    buttonText?: string;
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'warning',
    buttonText = "확인"
}: AlertModalProps) {
    if (!isOpen) return null;

    const styles = {
        success: {
            border: 'border-green-500',
            text: 'text-green-500',
            bg: 'bg-green-500 hover:bg-green-600',
            icon: <CheckCircle className="w-16 h-16 mx-auto" />
        },
        warning: {
            border: 'border-amber-500',
            text: 'text-amber-500',
            bg: 'bg-amber-500 hover:bg-amber-600',
            icon: <AlertTriangle className="w-16 h-16 mx-auto" />
        },
        error: {
            border: 'border-red-500',
            text: 'text-red-500',
            bg: 'bg-red-500 hover:bg-red-600',
            icon: <XCircle className="w-16 h-16 mx-auto" />
        },
        info: {
            border: 'border-blue-500',
            text: 'text-blue-500',
            bg: 'bg-blue-500 hover:bg-blue-600',
            icon: <Info className="w-16 h-16 mx-auto" />
        }
    };

    const style = styles[type];
    const defaultTitle = type === 'error' ? '오류가 발생했습니다' :
        type === 'warning' ? '알림' :
            type === 'success' ? '완료' : '안내';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full text-center transform scale-100 transition-all border-t-8 ${style.border} animate-in fade-in zoom-in duration-200`}>
                <div className={`mb-4 ${style.text}`}>
                    {style.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title || defaultTitle}</h3>
                <p className="text-gray-500 mb-6 font-medium whitespace-pre-wrap">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className={`w-full ${style.bg} text-white font-bold py-3 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform active:scale-95 duration-100`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
