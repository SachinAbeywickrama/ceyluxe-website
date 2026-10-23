# CEYLUXE hero film

## Current edit

`dist/assets/ceyluxe-hero-ritual.mp4` is a silent, approximately 10-second montage of the four user-provided clips. It replaces the previous single close-up in the same arched hero frame.

## Sequence

1. Butterfly-pea and ginger botanical ball: the 10:38:44 PM clip, 0.8–2.6 seconds.
2. Rose botanical ball: the 10:38:45 PM clip, 3.7–5.5 seconds.
3. The ball lowered into the hot-water cup: the 8:31 PM clip, 6.7–10.2 seconds.
4. Tea ball opening and golden infusion: the 8:32:10 PM clip, 0–4.2 seconds.

These are editorial shots of different blends, connected with 0.3-second crossfades. A 0.35-second crossfade joins the loop. There is no manufacturing footage or baked-in text.

## Treatment

- Consistent 576 × 720 portrait frame, crop-safe for the existing responsive arch.
- Original natural backgrounds retained, with distracting outer edges cropped away.
- Gentle noise reduction and per-shot exposure matching, reduced oversaturation and a restrained warm colour balance.
- Audio removed. H.264, 30 fps, MP4 fast-start for web playback.
- Matching opening poster: `dist/assets/ceyluxe-hero-ritual-poster.jpg`.
- Existing pause/play control, reduced-motion behavior and image fallback retained.

## Recreate

Run `python3 video/edit-hero-montage.py /path/to/source-folder --ffmpeg /path/to/ffmpeg`. The editor expects the original WhatsApp filenames listed in the script. Source uploads are not included in the published website. The website plays only the exported MP4 and needs no editing tools.

Previous single-shot and 3D versions are retained in the project as earlier treatments and are no longer displayed.
