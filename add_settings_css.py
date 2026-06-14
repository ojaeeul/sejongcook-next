def add_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        css = f.read()

    new_css = """
/* Notebook Settings Modal Styles */
.color-preset-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #cbd5e1;
    cursor: pointer;
    transition: transform 0.2s;
}
.color-preset-btn:hover {
    transform: scale(1.1);
}
.switch input:checked + .slider {
    background-color: #3b82f6;
}
.switch input:focus + .slider {
    box-shadow: 0 0 1px #3b82f6;
}
.switch input:checked + .slider:before {
    transform: translateX(20px);
}
.slider.round:before {
    border-radius: 50%;
}
.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
}
"""
    if "Notebook Settings Modal Styles" not in css:
        css += new_css

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(css)

add_css('Sejong/SejongAttendance/public/style.css')
print("Added settings CSS")
