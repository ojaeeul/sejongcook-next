
'use client';

import DataEditor from '../../components/DataEditor';

export default function NewNotice() {
    return (
        <DataEditor
            title="새 공지사항 작성"
            type="notice"
            backLink="/admin/notice"
        />
    );
}
