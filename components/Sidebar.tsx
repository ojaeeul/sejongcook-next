'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="container_1">
            <div id="pm2-_381230_">
                <ul className="dep2">
                    <li className={pathname.includes('/community/notice') ? "on" : ""}>
                        <Link href="/community/notice">공지사항</Link>
                    </li>
                    <li className={pathname.includes('/community/qna') ? "on" : ""}>
                        <Link href="/community/qna">질문오토봇</Link>
                    </li>
                    <li className={pathname.includes('/community/sites') ? "on" : ""}>
                        <Link href="/community/sites">관련사이트</Link>
                    </li>
                    <li className={pathname.includes('/community/honor') ? "on" : ""}>
                        <Link href="/community/honor">명예의 전당</Link>
                    </li>
                </ul>
            </div>

            {/* Search Box - simplified for MVP */}
            <div id="farmBoxSearch" className="board_search_381229_">
                <form onSubmit={(e) => e.preventDefault()}>
                    <fieldset>
                        <legend>Search</legend>
                        <div className="input_wrap">
                            <input type="text" placeholder="게시글 검색" />
                            <button type="submit" className="btn_search" title="검색">🔍</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
