'use client';

import { useState, useEffect } from "react";

export default function Footer() {
    const [data, setData] = useState({
        academyName: "세종요리제과기술학원",
        ceo: "오재을",
        address: "경기도 김포시 김포대로 841, 6층 (사우동,제우스프라자)",
        tel: "031-986-1933",
        fax: "031-986-1966",
        email: "sejongcooking@naver.com",
        bizNum: "604-96-28050",
        copyright: "Copyright © 2024 Sejong Culinary & Baking Academy. All rights reserved."
    });

    useEffect(() => {
        const url = '/api/admin/data/footer';

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Footer data fetch failed');
                return res.json();
            })
            .then(json => {
                if (json && Array.isArray(json) && json.length > 0) {
                    setData(json[0]);
                } else if (json && !Array.isArray(json)) {
                    setData(json);
                }
            })
            .catch(err => {
                console.warn('Footer data fetch error:', err);
                // Keep default data
            });
    }, []);

    return (
        <footer className="site-footer">
            <div className="modern-container" style={{ padding: '30px 0' }}>
                <div className="footer-content-simple" style={{ color: '#333', textAlign: 'center' }}>
                    <p style={{ marginBottom: '10px', lineHeight: 1.8, fontSize: '14px', color: '#333' }}>
                        <span style={{ fontWeight: 'bold' }}>{data.academyName}</span> &nbsp; 대표자 : {data.ceo} &nbsp;
                        주소 : {data.address}
                        <br />
                        TEL. {data.tel} &nbsp; FAX. {data.fax} &nbsp; 이메일 : {data.email} &nbsp; 사업자 등록번호 : {data.bizNum}
                    </p>
                    <p className="footer-copyright" id="footer-copyright" style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                        {data.copyright}
                        <a href="/login" className="text-gray-300 hover:text-gray-500 transition-colors inline-block ml-2 align-middle" title="관리자 로그인">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
