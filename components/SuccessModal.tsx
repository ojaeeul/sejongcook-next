'use client';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title = "저장이 완료되었습니다",
    message = "내용이 성공적으로 수정되었습니다.",
    buttonText = "확인"
}: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full text-center transform scale-100 transition-all border-t-8 border-indigo-500 animate-in fade-in zoom-in duration-200">
                <div className="mb-4 text-indigo-500">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6 font-medium">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform active:scale-95 duration-100"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
