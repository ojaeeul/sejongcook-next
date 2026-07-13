
'use client';

import DataEditor from '../../components/DataEditor';

export default function NewReview() {
    return (
        <DataEditor
            title="새 수강후기 작성"
            type="review"
            backLink="/admin/review"
        />
    );
}
