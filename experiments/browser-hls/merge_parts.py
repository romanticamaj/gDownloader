"""Merge ordered MPEG-TS parts without resetting timestamps at each part boundary."""
import argparse
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', nargs='?', default='.')
    args = parser.parse_args()
    folder = Path(args.directory).resolve()
    state = json.loads((folder / 'progress.json').read_text())
    count = (state['segmentCount'] + state['groupSize'] - 1) // state['groupSize']
    names = [f'part-{i + 1:05d}.ts' for i in range(count)]
    for i, name in enumerate(names):
        record = state['completed'].get(str(i))
        file = folder / name
        if not record or not file.exists() or file.stat().st_size != record['bytes']:
            raise SystemExit(f'Incomplete or changed part: {name}')
    # concat protocol reads these parts as one continuous TS stream. The concat
    # demuxer (-f concat) can introduce small gaps at every grouped-part boundary.
    source = 'concat:' + '|'.join(names)
    with (folder / 'ffmpeg.log').open('w') as log:
        subprocess.run(['ffmpeg', '-nostdin', '-n', '-v', 'warning', '-i', source,
                        '-c', 'copy', 'video.mp4'], cwd=folder, stdout=log, stderr=log, check=True)
    probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'stream=codec_type,codec_name,width,height,duration:format=duration,size',
        '-of', 'json', 'video.mp4'], cwd=folder, capture_output=True, text=True, check=True)
    (folder / 'verification.json').write_text(probe.stdout)
    print(probe.stdout)
    print(folder / 'video.mp4')


if __name__ == '__main__':
    main()
