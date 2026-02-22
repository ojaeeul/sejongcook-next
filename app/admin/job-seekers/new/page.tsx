'use client';

import DataEditor from '../../components/DataEditor';

export default function NewJobSeeker() {
    return (
        <DataEditor
            title="새 구직정보 등록"
            type="job-seekers"
            backLink="/admin/job-seekers"
        />
    );
}
