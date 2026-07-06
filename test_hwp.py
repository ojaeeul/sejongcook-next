import sys
import re

with open('/Users/ojaeeul/Downloads/시험/조리기능사필기기출문제_140126.hwp', 'rb') as f:
    content = f.read()
    # just look for numbers like "31 32 33 34" or something in ascii/utf-16
    print("File size:", len(content))
    print("Contains '정답' in euc-kr:", content.find('정답'.encode('euc-kr')) != -1)
    print("Contains '정답' in utf-16le:", content.find('정답'.encode('utf-16le')) != -1)
