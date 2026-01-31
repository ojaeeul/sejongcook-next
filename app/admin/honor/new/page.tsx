'use client';

import DataEditor from '../../components/DataEditor';

export default function NewHonor() {
    return (
        <DataEditor
            title="새 명예의 전당 글 작성"
            type="honor"
            backLink="/admin/honor"
        />
    );
}
