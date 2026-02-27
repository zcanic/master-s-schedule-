import pathlib
import struct
import zlib


def chunk(tag: bytes, payload: bytes) -> bytes:
    crc = zlib.crc32(tag + payload) & 0xFFFFFFFF
    return struct.pack("!I", len(payload)) + tag + payload + struct.pack("!I", crc)


def make_png(path: pathlib.Path, width: int, height: int) -> None:
    rows: list[bytes] = []
    bg = (15, 23, 42)
    accent = (56, 189, 248)
    dot = (244, 63, 94)

    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            r, g, b = bg

            if int(height * 0.28) <= y < int(height * 0.34) and int(width * 0.18) <= x < int(width * 0.82):
                r, g, b = accent
            if int(height * 0.44) <= y < int(height * 0.50) and int(width * 0.18) <= x < int(width * 0.82):
                r, g, b = accent
            if int(height * 0.60) <= y < int(height * 0.66) and int(width * 0.18) <= x < int(width * 0.62):
                r, g, b = accent

            cx, cy, rr = int(width * 0.72), int(height * 0.72), int(min(width, height) * 0.11)
            if (x - cx) ** 2 + (y - cy) ** 2 <= rr**2:
                r, g, b = dot

            row.extend((r, g, b, 255))
        rows.append(bytes(row))

    raw = b"".join(rows)
    ihdr = struct.pack("!IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def main() -> None:
    public_dir = pathlib.Path("public")
    public_dir.mkdir(exist_ok=True)

    make_png(public_dir / "pwa-192x192.png", 192, 192)
    make_png(public_dir / "pwa-512x512.png", 512, 512)
    make_png(public_dir / "apple-touch-icon.png", 180, 180)


if __name__ == "__main__":
    main()
