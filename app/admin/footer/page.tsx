'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AdminFooterPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        academyName: '',
        ceo: '',
        address: '',
        tel: '',
        fax: '',
        email: '',
        bizNum: '',
        copyright: ''
    });

    useEffect(() => {
        const url = '/api/admin/data/footer';
        fetch(url)
            .then(res => res.json())
            .then(json => {
                if (json && json.length > 0) {
                    setData(json[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use confirm delay for consistent UX
        setTimeout(async () => {
            if (!confirm('설정하시겠습니까?')) return;

            setSaving(true);
            try {
                // Wrap in array to match existing structure or change structure if needed
                // Updating entire array with single object as index 0
                const payload = [{ id: "1", ...data }];

                const url = '/api/admin/data/footer';
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                alert('저장되었습니다.');
            } catch (error) {
                alert('저장 실패');
                console.error(error);
            } finally {
                setSaving(false);
            }
        }, 1000);
    };

    if (loading) return <div className="p-8">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">하단 회사 정보 관리 (Footer)</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">학원명 (Company Name)</label>
                            <input
                                type="text"
                                name="academyName"
                                value={data.academyName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">대표자 (CEO)</label>
                            <input
                                type="text"
                                name="ceo"
                                value={data.ceo}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">주소 (Address)</label>
                        <input
                            type="text"
                            name="address"
                            value={data.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">전화번호 (TEL)</label>
                            <input
                                type="text"
                                name="tel"
                                value={data.tel}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">팩스 (FAX)</label>
                            <input
                                type="text"
                                name="fax"
                                value={data.fax}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">이메일 (Email)</label>
                            <input
                                type="text"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">사업자 등록번호 (Business Number)</label>
                            <input
                                type="text"
                                name="bizNum"
                                value={data.bizNum}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">저작권 문구 (Copyright)</label>
                        <input
                            type="text"
                            name="copyright"
                            value={data.copyright}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '설정 저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
