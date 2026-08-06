# Third-party animation assets

## Rive example avatar

- Local file: `public/animations/rive-avatars.riv`
- Upstream: <https://github.com/rive-app/rive-react/blob/ebb3aafc8af5b9018e708fdf263c93976a019751/examples/public/avatars.riv>
- Upstream repository license: MIT, copyright Rive (2021)
- SHA-256: `8f55101d3d8e0545216959d22eb59bed569ee4b8f45f212934bf30ce25cbdb99`
- Usage: homepage avatar accent, artboard `Avatar 3`, with a local static fallback.

The upstream MIT license text is available at
<https://github.com/rive-app/rive-react/blob/ebb3aafc8af5b9018e708fdf263c93976a019751/LICENSE>.

## Rive WebGL2 runtime

- Local file: `public/animations/rive.wasm`
- Source package: `@rive-app/webgl2@2.39.1`, installed transitively by
  `@rive-app/react-webgl2@4.30.0`
- Package license: MIT
- SHA-256: `b5efee7df4ca89763c3eec2f8f5fc0ecae7624b0cf87aedc8627fd2ecb694b40`
- Usage: self-hosted runtime so the animation works with the application
  `connect-src 'self'` content security policy and without a runtime CDN.
