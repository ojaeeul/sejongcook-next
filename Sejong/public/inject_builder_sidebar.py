import sys

def inject_sidebar():
    with open('exam_settings.html', 'r', encoding='utf-8') as f:
        settings_html = f.read()

    start_idx = settings_html.find('        <!-- Sidebar Navigation')
    end_idx = settings_html.find('        <!-- Main Content -->')
    sidebar_html = settings_html[start_idx:end_idx]

    with open('exam_builder.html', 'r', encoding='utf-8') as f:
        builder_html = f.read()

    # 1. Update app-container
    builder_html = builder_html.replace(
        '<div class="app-container" style="display:block;">', 
        '<div class="app-container">\n' + sidebar_html
    )

    # 2. Update main
    builder_html = builder_html.replace(
        '<main style="width:100%; display:flex; flex-direction:column; height:100vh;">',
        '<main class="main-content" style="display:flex; flex-direction:column; height:100vh; overflow-y:auto; overflow-x:hidden;">'
    )

    # 3. Add sidebar toggle button
    builder_html = builder_html.replace(
        '<button onclick="location.href=\'exam_management.html\'"',
        '<button class="menu-toggle" onclick="toggleSidebar()" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#64748b; margin-right:5px;"><i class="fas fa-bars"></i></button>\n                    <button onclick="location.href=\'exam_management.html\'"'
    )

    # 4. Add scripts at the end
    script_html = """
    <script src="sidebar_sync.js?v=20260717-25"></script>
    <script>
        function toggleSidebar() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.sidebar-overlay').classList.toggle('active');
        }
        function toggleNavSub(element) {
            const subMenu = element.nextElementSibling;
            if(subMenu && subMenu.classList.contains('nav-sub-menu')) {
                subMenu.classList.toggle('show');
                element.classList.toggle('active');
            }
        }
    </script>
</body>
"""
    builder_html = builder_html.replace('</body>', script_html)

    with open('exam_builder.html', 'w', encoding='utf-8') as f:
        f.write(builder_html)

if __name__ == '__main__':
    inject_sidebar()
    print("Injected sidebar into exam_builder.html")
