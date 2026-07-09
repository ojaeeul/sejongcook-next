import time
import subprocess
import os

print("Waiting for batch_parse_exams.py to finish...")
while True:
    res = subprocess.run(["pgrep", "-f", "batch_parse_exams.py"], capture_output=True)
    if res.stdout.strip() == b'':
        break
    time.sleep(10)

print("batch_parse_exams.py finished. Starting batch_parse_baking.py...")
subprocess.run(["python3", "batch_parse_baking.py"])
