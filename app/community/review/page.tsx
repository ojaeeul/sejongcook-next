import BoardList from "@/components/BoardList";

export default function ReviewPage() {
    const reviews = [
        { id: '1', title: '한식조리기능사 합격 후기입니다!', author: '김철수', date: '2026-01-15', hit: '45' },
        { id: '2', title: '제과제빵 창업반 수료했어요~', author: '이영희', date: '2026-01-18', hit: '32' },
    ];

    return (
        <BoardList
            boardCode="review"
            boardName="수강후기"
            posts={reviews}
        />
    );
}
