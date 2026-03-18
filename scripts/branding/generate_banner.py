from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FONT = ROOT / "assets" / "fonts" / "PressStart2P-Regular.ttf"
DEFAULT_OUTPUT = ROOT / "assets" / "banner.png"

BACKGROUND = (13, 17, 23, 255)
TOP_COLOR = (212, 163, 115)
BOTTOM_COLOR = (199, 62, 29)
OUTLINE = (26, 26, 26, 255)
INNER_HIGHLIGHT = (250, 249, 247, 255)
SHADOW_COLORS = [
    (102, 50, 17, 255),
    (132, 67, 26, 255),
    (160, 84, 32, 255),
    (184, 98, 38, 255),
]


def build_vertical_gradient(width: int, height: int) -> Image.Image:
    gradient = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = gradient.load()

    for y in range(height):
        ratio = y / max(height - 1, 1)
        r = int(TOP_COLOR[0] + (BOTTOM_COLOR[0] - TOP_COLOR[0]) * ratio)
        g = int(TOP_COLOR[1] + (BOTTOM_COLOR[1] - TOP_COLOR[1]) * ratio)
        b = int(TOP_COLOR[2] + (BOTTOM_COLOR[2] - TOP_COLOR[2]) * ratio)
        for x in range(width):
            pixels[x, y] = (r, g, b, 255)

    return gradient


def color_layer(
    text: str,
    font: ImageFont.FreeTypeFont,
    size: tuple[int, int],
    position: tuple[int, int],
    color: tuple[int, int, int, int],
) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.text(position, text, font=font, fill=color)
    return layer


def gradient_layer(
    text: str,
    font: ImageFont.FreeTypeFont,
    size: tuple[int, int],
    position: tuple[int, int],
) -> Image.Image:
    gradient = build_vertical_gradient(*size)
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.text(position, text, font=font, fill=255)
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    layer.paste(gradient, (0, 0), mask)
    return layer


def find_font_size(
    text: str,
    font_path: Path,
    image_size: tuple[int, int],
    padding_x: int,
    padding_y: int,
) -> ImageFont.FreeTypeFont:
    width, height = image_size
    probe = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(probe)

    for size in range(112, 39, -4):
        font = ImageFont.truetype(str(font_path), size=size)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        if text_width <= width - padding_x * 2 and text_height <= height - padding_y * 2:
            return font

    raise RuntimeError("Could not fit banner text inside the requested canvas.")


def draw_outline(
    draw: ImageDraw.ImageDraw,
    text: str,
    position: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    color: tuple[int, int, int, int],
    offsets: list[tuple[int, int]],
) -> None:
    x, y = position
    for dx, dy in offsets:
        draw.text((x + dx, y + dy), text, font=font, fill=color)


def generate_banner(
    text: str,
    output: Path,
    font_path: Path = DEFAULT_FONT,
    size: tuple[int, int] = (1145, 196),
) -> None:
    if not font_path.exists():
        raise FileNotFoundError(
            f"Missing font at {font_path}. Download Press Start 2P before generating the banner."
        )

    width, height = size
    padding_x = 36
    padding_y = 30

    font = find_font_size(text, font_path, size, padding_x, padding_y)

    canvas = Image.new("RGBA", size, BACKGROUND)
    draw = ImageDraw.Draw(canvas)

    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (width - text_width) // 2 - bbox[0]
    text_y = (height - text_height) // 2 - bbox[1] - 2

    # Layered side shadows to create arcade-style depth.
    for step, shadow_color in enumerate(SHADOW_COLORS, start=1):
        shadow = color_layer(
            text,
            font,
            size,
            (text_x + step * 7, text_y + step * 5),
            shadow_color,
        )
        canvas.alpha_composite(shadow)

    # Thin dark outline behind the main face.
    for offset in [(-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
        outline = color_layer(
            text,
            font,
            size,
            (text_x + offset[0], text_y + offset[1]),
            OUTLINE,
        )
        canvas.alpha_composite(outline)

    face = gradient_layer(text, font, size, (text_x, text_y))
    canvas.alpha_composite(face)

    # Bright top highlight to sell the metallic face.
    highlight = color_layer(text, font, size, (text_x, text_y - 2), INNER_HIGHLIGHT)
    canvas.alpha_composite(highlight)
    canvas.alpha_composite(face)

    # Final subtle dark edge.
    for offset in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        edge = color_layer(
            text,
            font,
            size,
            (text_x + offset[0], text_y + offset[1]),
            OUTLINE,
        )
        canvas.alpha_composite(edge)
    canvas.alpha_composite(face)

    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate the Ghosted README banner.")
    parser.add_argument("--text", default="GHOSTED", help="Banner text")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output PNG path")
    parser.add_argument("--font", type=Path, default=DEFAULT_FONT, help="Path to Press Start 2P TTF")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    generate_banner(text=args.text, output=args.output, font_path=args.font)
