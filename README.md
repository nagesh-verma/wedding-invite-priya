# Roopa & Anoop — Video Opening Wedding Invitation

## Add your media

Put:
- `wedding-opening.mp4`
- `background.mp3`

inside `assets/`.

The opening flow is:

1. Guest lands on the page.
2. Full-screen wedding video is shown.
3. Guest taps **TAP HERE**.
4. Video starts from the beginning.
5. Background music starts from the same user interaction.
6. When the video fires `ended`, the video screen fades away.
7. The main invitation opens at the top as though the guest has opened the invitation.
8. Guest can then scroll through the invitation.

The video is not skipped. It is played to completion before the invitation opens.

### If you want a different filename
Edit the `<source>` in `index.html`.

### Important browser behavior
Modern mobile browsers restrict autoplay with sound. Because the guest taps `TAP HERE`, the tap provides the required user gesture. The code attempts unmuted playback first and falls back to muted playback if the browser still blocks audio.

The background music also starts only after the tap, so it is much more reliable on mobile.

All invitation content remains ordinary HTML/CSS and can be edited directly.
