import time

for i in range(10):
    print(f"process-update:file-success:INV2025072100{i+1}.pdf")
    time.sleep(1)

print("process-update:process-success:file saved")
