
'use client';

import DataEditor from '../../components/DataEditor';

export default function NewLink() {
    return (
        <DataEditor
            title="새 링크/페이지 작성"
            type="sites"
            backLink="/admin/links"
        />
    );
}
