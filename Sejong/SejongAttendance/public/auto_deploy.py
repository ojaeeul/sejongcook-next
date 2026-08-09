import json
import time
import os
import subprocess

DATA_FILE = 'questions_data.json'
DEPLOY_CMD = './시스템_시작.command'

def get_progress():
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            d = json.load(f)
        total = sum(1 for v in d.values() for q in v if q.get('a') is not None and isinstance(q.get('a'), int))
        done = sum(1 for v in d.values() for q in v if q.get('a') is not None and isinstance(q.get('a'), int) and q.get('e'))
        if total == 0: return 0
        return (done / total) * 100
    except Exception as e:
        print(f"Error reading progress: {e}")
        return 0

def main():
    thresholds = [50.0, 75.0, 99.9]
    completed_thresholds = set()
    
    current_progress = get_progress()
    for t in thresholds:
        if current_progress >= t:
            completed_thresholds.add(t)

    print(f"Starting auto_deploy monitor. Current progress: {current_progress:.2f}%. Monitoring thresholds: {thresholds}")

    while len(completed_thresholds) < len(thresholds):
        time.sleep(3600) # check every hour
        current_progress = get_progress()
        print(f"Current progress: {current_progress:.2f}%")
        
        for t in thresholds:
            if t not in completed_thresholds and current_progress >= t:
                print(f"Threshold {t}% reached! Running deployment script...")
                completed_thresholds.add(t)
                try:
                    parent_dir = os.path.dirname(os.path.abspath(os.getcwd()))
                    subprocess.run(DEPLOY_CMD, shell=True, cwd=parent_dir)
                    print("Deployment completed.")
                except Exception as e:
                    print(f"Deployment failed: {e}")

if __name__ == "__main__":
    main()
