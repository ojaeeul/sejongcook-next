export const DEFAULT_HERO_DATA = {
    badge: "프리미엄 요리 제과 아카데미",
    badgeSize: "1rem",     // Default size
    badgeBold: true,       // Default bold
    title: "세종요리제과기술학원",
    titleSize: "3.5rem",   // Default size
    titleBold: true,       // Default bold
    desc: "꿈을 향한 맛있는 도전",
    descSize: "0.6em",     // Default relative size
    descBold: false,       // Default normal (from current code 500/400 mix logic, but explicit setting is better)
    longDesc: "최고의 강사진이 여러분의 꿈을 현실로 만들어드립니다.\n김포요리학원은 자격증, 창업까지, 전문가가 함께합니다.",
    longDescSize: "1.2rem", // Default size
    longDescBold: true,     // Default bold (current is font-black/900)
    photos: [
        // 1. Intro (학원소개)
        [
            "/img/cards/intro_lobby.png",
            "/img/cards/intro_classroom.png",
            "/img/cards/intro_demo.png",
            "/img/cards/intro_exterior.png"
        ],
        // 2. Baking (제과제빵과정)
        [
            "/img/cards/baking_bread.png",
            "/img/cards/baking_cake.png",
            "/img/cards/baking_croissants.png",
            "/img/cards/baking_chocolate.png"
        ],
        // 3. Culinary (조리교육과정)
        [
            "/img/cards/culinary_korean.png",
            "/img/cards/culinary_western.png",
            "/img/cards/culinary_chinese.png",
            "/img/cards/culinary_japanese.png"
        ],
        // 4. Certification (자격증 & 진학)
        [
            "/img/cards/cert_skill.png",
            "/img/cards/cert_dish.png",
            "/img/cards/cert_diploma.png",
            "/img/cards/cert_judge.png"
        ],
        // 5. Brunch (브런지 & 창업)
        [
            "/img/cards/brunch_1.png",
            "/img/cards/brunch_2.png",
            "/img/cards/brunch_3.png",
            "/img/cards/brunch_4.png"
        ],
        // 6. Community (커뮤니티)
        [
            "/img/cards/community_1.png",
            "/img/cards/community_2.png",
            "/img/cards/community_3.png",
            "/img/cards/community_4.png"
        ]
    ] as string[][],
    btn1Text: "과정리뷰하기",
    btn1Link: "/course/baking",
    btn2Text: "상담문의",
    btn2Link: "/inquiry",
    phoneVisible: true,
    phoneNumber: "031-986-1933",
    phoneSize: "24px",
    phoneIcon: "📞",
    phoneBorderColor: "#ffa200",
    phoneAlignment: "center",
    phoneBackgroundColor: "rgba(0, 0, 0, 0.4)",
    phoneTextColor: "#ffffff",
    phoneBold: true,

    // Laurel Banner Settings
    laurelBannerVisible: true,
    laurelStars: 5,
    laurelName: "강란기 대표"
};
