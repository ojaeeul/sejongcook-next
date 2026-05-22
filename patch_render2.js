const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const target = `                    if (status === 'late') status = '△';
                    if (status === 'early') status = '조퇴';
                    
                    // Custom Memo - Preview Bubble
                    if (status.length > 2 && status !== '조퇴') {
                        td.textContent = status.substring(0, 1) + '..';
                        td.setAttribute('data-note', status);
                        td.style.color = '#10b981'; // Green for custom
                        td.classList.add('stat-custom');
                    } else {
                        td.textContent = status;
                        if (status === '연' || status === '연장') {
                            td.style.color = '#d97706';
                            td.style.fontWeight = 'bold';
                        } else if (status === '△' || status === '지각') {
                            td.textContent = '△';
                            td.style.color = '#9333ea';
                            td.style.fontWeight = 'bold';
                        } else if (status === '조퇴' || status === '조') {
                            td.textContent = '조퇴';
                            td.style.color = '#2563eb';
                            td.style.fontWeight = 'bold';
                        }
                    }`;

const replacement = `                    if (status === 'late') status = '△';
                    if (status === 'early') status = '조퇴';
                    
                    // Custom Memo - Preview Bubble
                    if (status.length > 2 && !status.includes('조퇴') && !status.includes('지각')) {
                        td.textContent = status.substring(0, 1) + '..';
                        td.setAttribute('data-note', status);
                        td.style.color = '#10b981'; // Green for custom
                        td.classList.add('stat-custom');
                    } else {
                        td.textContent = status;
                        if (status === '연' || status === '연장' || status.includes('연장')) {
                            td.style.color = '#d97706';
                            td.style.fontWeight = 'bold';
                        } else if (status === '△' || status.includes('지각')) {
                            td.textContent = '△';
                            td.style.color = '#9333ea';
                            td.style.fontWeight = 'bold';
                        } else if (status.includes('조퇴') || status === '조') {
                            td.textContent = '조퇴';
                            td.style.color = '#2563eb';
                            td.style.fontWeight = 'bold';
                        }
                    }`;

content = content.replace(target, replacement);
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
