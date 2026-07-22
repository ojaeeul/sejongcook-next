import os
import re

files_to_patch = [
    'app/community/qna/write/page.tsx',
    'app/community/review/write/page.tsx',
    'app/job/openings/write/page.tsx',
    'app/job/seekers/write/page.tsx'
]

for fpath in files_to_patch:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Validation
    if "if (author.trim() === '학생'" not in content:
        content = content.replace(
            "e.preventDefault();\n        setLoading(true);\n\n        try {",
            "e.preventDefault();\n        setLoading(true);\n\n        if (author.trim() === '학생' || author.trim().length < 3) {\n            alert('이름은 \"학생\" 이외의 3글자 이상으로 실명을 입력해주세요.');\n            setLoading(false);\n            return;\n        }\n\n        try {"
        )
    
    # 2. Text Notice
    if "안전하게 블라인드 처리됩니다" not in content:
        content = content.replace(
            "onChange={(e) => setPhone(e.target.value)}\n                        required\n                    />\n                </div>",
            "onChange={(e) => setPhone(e.target.value)}\n                        required\n                    />\n                </div>\n                <div className=\"text-sm text-red-500 ml-24 font-bold\">\n                    ※ 이름과 전화번호는 관리자 외에는 볼 수 없도록 안전하게 블라인드 처리됩니다.\n                </div>"
        )
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

# BoardList.tsx
with open('components/BoardList.tsx', 'r', encoding='utf-8') as f:
    boardlist = f.read()
if "{isAdmin ? post.author :" not in boardlist:
    boardlist = boardlist.replace(
        "<span>{post.author}</span>",
        "<span>{isAdmin ? post.author : (post.author && post.author.length > 1 ? post.author[0] + '**' : post.author)}</span>"
    )
    boardlist = boardlist.replace(
        '<td className="py-4 text-gray-500 hidden md:table-cell">{post.author}</td>',
        '<td className="py-4 text-gray-500 hidden md:table-cell">{isAdmin ? post.author : (post.author && post.author.length > 1 ? post.author[0] + \'**\' : post.author)}</td>'
    )
with open('components/BoardList.tsx', 'w', encoding='utf-8') as f:
    f.write(boardlist)

# BoardView.tsx
with open('components/BoardView.tsx', 'r', encoding='utf-8') as f:
    boardview = f.read()
if "{isAdmin ? post.author :" not in boardview:
    boardview = boardview.replace(
        "<span>{post.author}</span>",
        "<span>{isAdmin ? post.author : (post.author && post.author.length > 1 ? post.author[0] + '**' : post.author)}</span>"
    )
    boardview = boardview.replace(
        'dangerouslySetInnerHTML={{ __html: post.content || \'\' }}',
        'dangerouslySetInnerHTML={{ __html: isAdmin ? (post.content || \'\') : (post.content || \'\').replace(/<p><strong>연락처:<\\/strong>.*?<\\/p>(<br\\/>)?/gi, \'\') }}'
    )
with open('components/BoardView.tsx', 'w', encoding='utf-8') as f:
    f.write(boardview)

print("Patch applied successfully.")
