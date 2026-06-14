def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Add Print Button
    # Find settings button
    settings_btn = """    <button id="notebook-settings-btn" title="노트 설정" style="position: absolute; top: 10px; right: 20px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">"""
    print_btn = """    <!-- Print Button -->
    <button id="notebook-print-btn" title="인쇄하기" onclick="window.print()" style="position: absolute; top: 10px; right: 60px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">
        <i class="material-icons" style="font-size: 24px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">print</i>
    </button>
    
    <button id="notebook-settings-btn" title="노트 설정" style="position: absolute; top: 10px; right: 20px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">"""
    html = html.replace(settings_btn, print_btn)

    # 2. Add Print CSS
    print_css = """
    <style>
        @media print {
            body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #notebook-settings-btn, #notebook-print-btn, .pagination-controls, .print-hide, .date-nav {
                display: none !important;
            }
            .notebook-wrapper {
                display: block !important;
                background: none !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
            }
            .binding {
                display: none !important;
            }
            .page {
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 20px !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                page-break-after: always;
                break-after: page;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-position: 0 20px !important; /* adjust for padding 20px */
            }
            .page-right {
                page-break-after: auto !important;
                break-after: auto !important;
            }
            /* Right page has a flex layout for columns, keep it flex */
            .right-page-columns {
                display: flex !important;
                height: auto !important; /* Allow it to grow */
            }
            .right-col-half {
                flex: 1 !important;
            }
            /* Hide the red vertical line if it's annoying, or adjust it */
            .page::before {
                left: 45px !important; /* adjusted for padding 20px instead of 40px */
            }
            .page-title {
                position: relative !important;
                top: 0 !important;
                left: 0 !important;
                margin-bottom: 20px !important;
                text-align: center !important;
                font-size: 24px !important;
            }
            #expense-container, .right-page-columns {
                margin-top: 0 !important;
            }
            /* Adjust the red line */
            .page::before {
                display: none !important; /* Hide red line for clean printing */
            }
        }
    </style>
</head>"""

    html = html.replace('</head>', print_css)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
print("Added print feature")
