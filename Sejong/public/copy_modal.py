import re

with open("index.html", "r") as f:
    content = f.read()

match = re.search(r'(<!-- Edit Student Modal -->.*?<!-- Modals End -->|<!-- Edit Student Modal -->.*?<script>)', content, re.DOTALL)
if not match:
    # Try finding up to the closing div of the modal
    match = re.search(r'(<!-- Edit Student Modal -->.*?<div id="editStudentModal".*?</div>\s*</div>\s*</div>)', content, re.DOTALL)

modal_content = match.group(1) if match else None

if not modal_content:
    print("Could not find editStudentModal in index.html")
    exit(1)

# Ensure it doesn't contain the <script> tag if it grabbed too much
modal_content = re.sub(r'<script>.*', '', modal_content, flags=re.DOTALL)

with open("register.html", "r") as f:
    reg_content = f.read()

if 'id="editStudentModal"' in reg_content:
    print("Already in register.html")
else:
    # Insert before <!-- 3D Swiper Modal -->
    reg_content = reg_content.replace('<!-- 3D Swiper Modal -->', modal_content + '\n\n    <!-- 3D Swiper Modal -->')
    with open("register.html", "w") as f:
        f.write(reg_content)
    print("Injected into register.html")

