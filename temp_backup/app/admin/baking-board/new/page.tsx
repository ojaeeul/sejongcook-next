'use client';

import DataEditor from '../../components/DataEditor';

export default function NewBakingPost() {
    return (
        <DataEditor
            title="새 제과제빵 게시판 글 작성"
            type="baking"
            backLink="/admin/baking-board"
        />
    );
}
