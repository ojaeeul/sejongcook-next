'use client';

import dynamic from "next/dynamic";
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import ko from 'suneditor/src/lang/ko';

const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false, // SunEditor uses window, so disable SSR
});

interface EditorProps {
    onChange: (content: string) => void;
    content?: string;
}

export default function Editor({ onChange, content = "" }: EditorProps) {
    return (
        <div style={{ minHeight: '400px' }}>
            <SunEditor
                width="100%"
                height="400px"
                placeholder="내용을 입력해주세요..."
                defaultValue={content}
                onChange={onChange}
                setOptions={{
                    lang: ko,
                    defaultStyle: "font-family: 'Pretendard', sans-serif; font-size: 16px; line-height: 1.6;",
                    buttonList: [
                        ['undo', 'redo'],
                        ['font', 'fontSize', 'formatBlock'],
                        ['paragraphStyle', 'blockquote'],
                        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                        ['fontColor', 'hiliteColor', 'textStyle'],
                        ['removeFormat'],
                        ['outdent', 'indent'],
                        ['align', 'horizontalRule', 'list', 'lineHeight'],
                        ['table', 'link', 'image', 'video'],
                        ['template'],
                        ['fullScreen', 'showBlocks', 'codeView'],
                        ['preview', 'print']
                    ],
                    // Critical for preserving tables and styles
                    mode: "classic",
                    // @ts-expect-error SunEditor types may not allow null, but it is required to disable sanitation
                    allowedTags: null, // Allow all tags
                    allowedAttributes: null, // Allow all attributes (style, class, etc.)
                    iframe: false,
                    fullPage: false,
                    templates: [
                        {
                            name: '🍊 요리/조리 스타일 (오렌지)',
                            html: `<div class="overflow-x-auto my-4">
                                <table class="w-full border-collapse text-center text-sm">
                                    <thead>
                                        <tr class="bg-gray-50 text-gray-800 border-t-2 border-orange-500">
                                            <th class="py-3 px-2 border-b">구분</th>
                                            <th class="py-3 px-2 border-b">내용 1</th>
                                            <th class="py-3 px-2 border-b">내용 2</th>
                                            <th class="py-3 px-2 border-b">비고</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr class="hover:bg-orange-50 transition-colors">
                                            <td class="py-3 px-2">1</td>
                                            <td class="py-3 px-2">내용을 입력하세요</td>
                                            <td class="py-3 px-2">내용을 입력하세요</td>
                                            <td class="py-3 px-2"></td>
                                        </tr>
                                        <tr class="hover:bg-orange-50 transition-colors">
                                            <td class="py-3 px-2">2</td>
                                            <td class="py-3 px-2">내용을 입력하세요</td>
                                            <td class="py-3 px-2">내용을 입력하세요</td>
                                            <td class="py-3 px-2"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>`
                        },
                        {
                            name: '🥬 생활요리 스타일 (그린)',
                            html: `<div class="overflow-x-auto my-4">
                                <table class="w-full border-collapse text-center text-sm">
                                    <thead>
                                        <tr class="bg-gray-50 text-gray-800 border-t-2 border-green-500">
                                            <th class="py-3 px-2 border-b">구분</th>
                                            <th class="py-3 px-2 border-b">메뉴명</th>
                                            <th class="py-3 px-2 border-b">일정</th>
                                            <th class="py-3 px-2 border-b">시간</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr class="hover:bg-green-50 transition-colors">
                                            <td class="py-3 px-2">1</td>
                                            <td class="py-3 px-2 font-bold text-gray-800">메뉴 입력</td>
                                            <td class="py-3 px-2">주 2회</td>
                                            <td class="py-3 px-2">10:00 - 12:00</td>
                                        </tr>
                                        <tr class="hover:bg-green-50 transition-colors">
                                            <td class="py-3 px-2">2</td>
                                            <td class="py-3 px-2 font-bold text-gray-800">메뉴 입력</td>
                                            <td class="py-3 px-2">주 1회</td>
                                            <td class="py-3 px-2">10:00 - 12:00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>`
                        },
                        {
                            name: '🍞 제과제빵 스타일 (옐로우)',
                            html: `<div class="overflow-x-auto my-4">
                                <table class="w-full border-collapse text-center text-sm">
                                    <thead>
                                        <tr class="bg-gray-50 text-gray-800 border-t-2 border-yellow-500">
                                            <th class="py-3 px-2 border-b">과정명</th>
                                            <th class="py-3 px-2 border-b">요일</th>
                                            <th class="py-3 px-2 border-b">오전반</th>
                                            <th class="py-3 px-2 border-b">오후반</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr class="hover:bg-yellow-50 transition-colors">
                                            <td class="py-3 px-2 font-bold">제과기능사</td>
                                            <td class="py-3 px-2">월, 수</td>
                                            <td class="py-3 px-2">10시</td>
                                            <td class="py-3 px-2">5시</td>
                                        </tr>
                                        <tr class="hover:bg-yellow-50 transition-colors">
                                            <td class="py-3 px-2 font-bold">제빵기능사</td>
                                            <td class="py-3 px-2">화, 목</td>
                                            <td class="py-3 px-2">10시</td>
                                            <td class="py-3 px-2">5시</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>`
                        },
                        {
                            name: '⚪️ 기본 스타일 (깔끔)',
                            html: `<div class="overflow-x-auto my-4">
                                <table class="w-full border-collapse text-center text-sm border border-gray-200">
                                    <thead>
                                        <tr class="bg-gray-100 text-gray-800">
                                            <th class="py-2 px-2 border border-gray-200">항목 1</th>
                                            <th class="py-2 px-2 border border-gray-200">항목 2</th>
                                            <th class="py-2 px-2 border border-gray-200">항목 3</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="py-2 px-2 border border-gray-200">내용</td>
                                            <td class="py-2 px-2 border border-gray-200">내용</td>
                                            <td class="py-2 px-2 border border-gray-200">내용</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>`
                        }
                    ],
                    font: [
                        'Arial', 'Comic Sans MS', 'Courier New', 'Impact',
                        'Georgia', 'Tahoma', 'Trebuchet MS', 'Verdana', 'Noto Sans KR', 'Pretendard'
                    ]
                }}
            />
        </div>
    );
}
