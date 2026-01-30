
'use client';

import DataEditor from '../../components/DataEditor';

export default function NewQna() {
    return (
        <DataEditor
            title="새 문의사항 작성" /* Create New Q&A */
            type="qna"
            backLink="/admin/qna"
            initialData={{ status: '대기중' }} /* Pending */
        />
    );
}
