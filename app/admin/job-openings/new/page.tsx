
'use client';

import DataEditor from '../../components/DataEditor';

export default function NewJobOpening() {
    return (
        <DataEditor
            title="새 구인구직 작성"
            type="job-openings"
            backLink="/admin/job-openings"
            // Job openings uses 'hits' instead of 'hit'
            initialData={{ hits: 0 }}
        />
    );
}
