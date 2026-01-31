'use client';

import DataEditor from '../../components/DataEditor';

export default function NewCookingPost() {
    return (
        <DataEditor
            title="새 조리 게시판 글 작성"
            type="cooking"
            backLink="/admin/cooking-board"
        />
    );
}
