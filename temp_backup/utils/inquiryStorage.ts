export interface Inquiry {
    id: string;
    name: string;
    phone: string;
    courses: string[];
    date: string;
    isRead: boolean;
}

const STORAGE_KEY = 'sejong_inquiries';

export const InquiryStorage = {
    getAll: (): Inquiry[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    add: (inquiry: Omit<Inquiry, 'id' | 'date' | 'isRead'>) => {
        const inquiries = InquiryStorage.getAll();
        const newInquiry: Inquiry = {
            ...inquiry,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            isRead: false
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newInquiry, ...inquiries]));
        return newInquiry;
    },

    delete: (id: string) => {
        const inquiries = InquiryStorage.getAll();
        const filtered = inquiries.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
