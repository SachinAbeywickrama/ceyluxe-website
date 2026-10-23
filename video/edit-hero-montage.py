"""Create the CEYLUXE hero montage from the four user-provided clips.
Usage: python3 video/edit-hero-montage.py /path/to/source-folder --ffmpeg /path/to/ffmpeg
FFmpeg is used only when editing; the website plays a normal local MP4.
"""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('folder', type=Path)
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
assets = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
output = assets / 'ceyluxe-hero-ritual.mp4'
# Natural product close-ups -> actual drop -> infusion. Original uploads stay untouched.
shots = [
    ('10.38.44', 0.8, 2.6, '478:600:0:250', '0.065', '0.84', '1.08'),
    ('10.38.45', 3.7, 5.5, '478:600:0:210', '0.05', '0.90', '1.08'),
    ('8.31.00', 6.7, 10.2, '576:720:170:0', '0.06', '0.86', '1.08'),
    ('8.32.10', 0, 4.2, '478:600:0:210', '0.035', '0.94', '1.0'),
]
command = [args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y']
filters = []
for index, (time, start, end, crop, brightness, saturation, gamma) in enumerate(shots):
    source = args.folder / f'WhatsApp Video 2026-10-22 at {time}\u202fPM.mp4'
    command += ['-i', str(source)]
    filters.append(
        f'[{index}:v]trim=start={start}:end={end},setpts=PTS-STARTPTS,'
        f'fps=30,crop={crop},scale=576:720:flags=lanczos,setsar=1,'
        f'hqdn3d=1:1:2:2,eq=brightness={brightness}:contrast=1.03:'
        f'saturation={saturation}:gamma={gamma},'
        f'colorbalance=rs=0.012:gs=0.006:bs=-0.012,format=yuv420p[v{index}]'
    )
filters += [
    '[v0][v1]xfade=transition=fade:duration=0.3:offset=1.5[join1]',
    '[join1][v2]xfade=transition=fade:duration=0.3:offset=3.0[join2]',
    '[join2][v3]xfade=transition=fade:duration=0.3:offset=6.2[sequence]',
    '[sequence]split=2[bodyin][headin]',
    '[bodyin]trim=start=0.35:end=10.4,setpts=PTS-STARTPTS[body]',
    '[headin]trim=start=0:end=0.35,setpts=PTS-STARTPTS[head]',
    '[body][head]xfade=transition=fade:duration=0.35:offset=9.7,format=yuv420p[out]',
]
command += [
    '-filter_complex', ';'.join(filters), '-map', '[out]', '-an',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
    '-profile:v', 'high', '-level', '3.1', '-movflags', '+faststart',
    '-map_metadata', '-1', str(output),
]
subprocess.run(command, check=True)
subprocess.run([
    args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', '0.25',
    '-i', str(output), '-frames:v', '1', '-q:v', '2', '-update', '1',
    str(assets / 'ceyluxe-hero-ritual-poster.jpg'),
], check=True)
print(f'Created {output.name} and matching poster.')
