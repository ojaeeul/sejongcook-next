import sys

def inject():
    with open('exam_settings.html', 'r', encoding='utf-8') as f:
        settings_html = f.read()

    start_idx = settings_html.find('    <div class="app-container">')
    end_idx = settings_html.find('        <!-- Main Content -->')
    sidebar_html = settings_html[start_idx:end_idx]

    with open('admin_account.html', 'r', encoding='utf-8') as f:
        account_html = f.read()

    # Update body
    # Replace body content with sidebar + main-content wrapper
    body_start = account_html.find('<body>') + len('<body>')
    body_end = account_html.find('<script src="admin_account.js')
    
    original_body_content = account_html[body_start:body_end].strip()

    new_body = f"""
{sidebar_html}
        <!-- Main Content -->
        <main class="main-content" style="display:flex; justify-content:center; align-items:center; width: 100%;">
            <div style="position: absolute; top: 15px; left: 15px; z-index: 100;">
                <button class="menu-toggle" onclick="toggleSidebar()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#64748b;">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            {original_body_content}
        </main>
    </div>

    <script src="sidebar_sync.js?v=20260726-4"></script>
    <script>
        function toggleSidebar() {{
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        }}
        function toggleNavSub(element) {{
            const subMenu = element.nextElementSibling;
            if(subMenu && subMenu.classList.contains('nav-sub-menu')) {{
                subMenu.classList.toggle('show');
                element.classList.toggle('active');
            }}
        }}
    </script>
    """

    account_html = account_html[:body_start] + new_body + account_html[body_end:]

    # Remove conflicting CSS in admin_account.html
    account_html = account_html.replace('            display: flex;\n            justify-content: center;\n            align-items: center;\n            min-height: 100vh;\n', '')

    with open('admin_account.html', 'w', encoding='utf-8') as f:
        f.write(account_html)

if __name__ == '__main__':
    inject()
    print("Injected sidebar into admin_account.html")
