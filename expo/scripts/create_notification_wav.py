"""Creates a minimal silent WAV file for the notification sound asset."""
import struct
import os

os.makedirs('assets/sounds', exist_ok=True)

header = b'RIFF' + struct.pack('<I', 36) + b'WAVE'
fmt = b'fmt ' + struct.pack('<IHHIIHH', 16, 1, 1, 44100, 88200, 2, 16)
data = b'data' + struct.pack('<I', 0)

with open('assets/sounds/notification.wav', 'wb') as f:
    f.write(header + fmt + data)

print('notification.wav created successfully')
