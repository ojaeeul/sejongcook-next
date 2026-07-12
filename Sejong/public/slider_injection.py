import re

with open("exam_management.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Swiper CSS and JS in the <head>
if "swiper-bundle.min.css" not in content:
    content = content.replace("</head>", 
"""    <!-- Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
    <style>
        .exam-item { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .exam-item:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: var(--primary); }
        
        /* 3D Slider Modal */
        #sliderModal {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.95); z-index: 9999; backdrop-filter: blur(5px);
            flex-direction: column; justify-content: center; align-items: center;
        }
        .close-slider {
            position: absolute; top: 30px; right: 40px; color: white; font-size: 3rem;
            cursor: pointer; z-index: 10000; transition: transform 0.2s;
        }
        .close-slider:hover { transform: scale(1.1); color: #ef4444; }
        .slider-title {
            position: absolute; top: 40px; left: 40px; color: white; font-size: 1.8rem;
            font-weight: 700; z-index: 10000;
        }
        
        .swiper {
            width: 100%; padding-top: 50px; padding-bottom: 50px;
        }
        .swiper-slide {
            background-position: center; background-size: cover;
            width: 400px; height: 500px; background: white; border-radius: 20px;
            padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            display: flex; flex-direction: column;
            border: 1px solid #e2e8f0;
        }
        .slide-q { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 30px; line-height: 1.5; }
        .slide-opts { display: flex; flex-direction: column; gap: 15px; }
        .slide-opt { 
            background: #f8fafc; padding: 15px 20px; border-radius: 10px; 
            border: 1px solid #e2e8f0; font-size: 1.1rem; color: #475569;
        }
        .slide-ans {
            margin-top: auto; padding-top: 20px; border-top: 1px dashed #cbd5e1;
            font-weight: bold; color: #3b82f6; font-size: 1.1rem; text-align: center;
        }
        .swiper-pagination-fraction { color: white; font-size: 1.2rem; font-weight: bold; bottom: 20px; }
    </style>
</head>""")

# 2. Add Swiper HTML structure before <main class="main-content">
if 'id="sliderModal"' not in content:
    content = content.replace('<main class="main-content">',
"""<div id="sliderModal">
        <div class="slider-title" id="sliderTitle">시험지 A</div>
        <div class="close-slider" onclick="closeSlider()">&times;</div>
        
        <div class="swiper mySwiper">
            <div class="swiper-wrapper" id="swiperWrapper">
                <!-- Slides will be injected here -->
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next" style="color:white;"></div>
            <div class="swiper-button-prev" style="color:white;"></div>
        </div>
    </div>
    
    <main class="main-content">""")

# 3. Add Swiper JS include and logic
if "swiper-bundle.min.js" not in content:
    content = content.replace("</body>",
"""    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script>
        let swiperInstance = null;

        function showExamSlider(examKey, examName) {
            document.getElementById('sliderModal').style.display = 'flex';
            document.getElementById('sliderTitle').textContent = examName;
            
            const questions = window.qDataGlobal[examKey] || [];
            const wrapper = document.getElementById('swiperWrapper');
            wrapper.innerHTML = '';
            
            questions.forEach((q, idx) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                
                let optsHtml = '';
                if(q.o && Array.isArray(q.o)) {
                    q.o.forEach((opt, i) => {
                        optsHtml += `<div class="slide-opt">${i+1}. ${opt}</div>`;
                    });
                }
                
                let ansText = '정답 미제공';
                if(q.a && q.o && q.o[q.a - 1]) {
                    ansText = `정답: ${q.a}번 (${q.o[q.a - 1]})`;
                } else if(q.a) {
                    ansText = `정답: ${q.a}번`;
                }
                
                slide.innerHTML = `
                    <div class="slide-q">${idx + 1}. ${q.q || '문제 없음'}</div>
                    <div class="slide-opts">${optsHtml}</div>
                    <div class="slide-ans"><i class="fas fa-check-circle"></i> ${ansText}</div>
                `;
                wrapper.appendChild(slide);
            });
            
            if(swiperInstance) {
                swiperInstance.destroy(true, true);
            }
            
            swiperInstance = new Swiper(".mySwiper", {
                effect: "coverflow",
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: "auto",
                coverflowEffect: {
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                },
                pagination: {
                    el: ".swiper-pagination",
                    type: "fraction",
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                keyboard: {
                    enabled: true,
                }
            });
        }
        
        function closeSlider() {
            document.getElementById('sliderModal').style.display = 'none';
        }
    </script>
</body>""")

# 4. Modify the filter and click event in the existing JS
content = content.replace("e.key.includes('_A_G_')", "e.key.includes('_A_Z_')")
content = content.replace("let totalGenerated = 0;", "let totalGenerated = 0;\n                window.qDataGlobal = qData;")

# Add onclick event to exam-item
content = re.sub(
    r'(<div class="exam-item")',
    r'\1 onclick="showExamSlider(\'${exam.key}\', \'${exam.name}\')"',
    content
)

with open("exam_management.html", "w", encoding="utf-8") as f:
    f.write(content)
