"""Make the CEYLUXE hero edit from the user's selected portrait footage.

Usage: python3 video/edit-hero.py /path/to/input.mp4 --ffmpeg /path/to/ffmpeg
No Python packages are required. FFmpeg is a development-only tool.
"""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('input', type=Path)
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
assets = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
output = assets / 'ceyluxe-hero-infusion.mp4'
# Focus on the cup. Keep its original background and retain the opening action.
# End the long hold early and blend the last 0.3 seconds into the opening.
filters = (
    '[0:v]trim=start=0:end=7,setpts=PTS-STARTPTS,fps=30,'
    'crop=478:600:0:210,setsar=1,'
    'eq=brightness=0.035:contrast=1.03:saturation=0.94,'
    'colorbalance=rs=0.012:gs=0.006:bs=-0.015,split=2[bodyin][headin];'
    '[bodyin]trim=start=0.3:end=7,setpts=PTS-STARTPTS[body];'
    '[headin]trim=start=0:end=0.3,setpts=PTS-STARTPTS[head];'
    '[body][head]xfade=transition=fade:duration=0.3:offset=6.4,'
    'format=yuv420p[out]'
)
subprocess.run([
    args.ffmpeg, '-hide_banner', '-loglevel', 'warning', '-y', '-i', str(args.input),
    '-filter_complex', filters, '-map', '[out]', '-an', '-c:v', 'libx264',
    '-preset', 'slow', '-crf', '22', '-profile:v', 'high', '-level', '3.1',
    '-movflags', '+faststart', '-map_metadata', '-1', str(output)
], check=True)
subprocess.run([
    args.ffmpeg, '-hide_banner', '-loglevel', 'warning', '-y', '-ss', '0.1',
    '-i', str(output), '-frames:v', '1', '-q:v', '2', '-update', '1',
    str(assets / 'ceyluxe-hero-poster.jpg')
], check=True)
print(f'Created {output.name} and its matching poster frame.')
