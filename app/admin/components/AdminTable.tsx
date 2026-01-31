
'use client';

import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Column {
    key: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (value: any, item: any) => React.ReactNode;
}

interface AdminTableProps {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    columns: Column[];
    onDelete: (id: string | number) => void;
    newLink: string;
    editLinkPrefix: string;
}

export default function AdminTable({
    title,
    data,
    columns,
    onDelete,
    newLink,
    editLinkPrefix
}: AdminTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <Link
                        href={newLink}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        <Plus size={16} />
                        추가하기
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {columns.map((col) => (
                                <th key={col.key} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                관리
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, idx) => (
                                <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                            {col.render ? col.render(item[col.key], item) : item[col.key]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`${editLinkPrefix}/${item.id}`}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('정말 삭제하시겠습니까?')) {
                                                        onDelete(item.id);
                                                    }
                                                }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
