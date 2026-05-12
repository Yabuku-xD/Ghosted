#!/usr/bin/env python3
"""Generate sophisticated abstract images for Ghosted redesign.
Warm cognac/amber palette matching #100d09 background and #c4813a accent."""

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import math
import random

def noise_field(width, height, scale=0.01, octaves=4):
    """Generate smooth Perlin-like noise."""
    img = np.zeros((height, width), dtype=np.float32)
    for octave in range(octaves):
        freq = scale * (2 ** octave)
        amp = 1 / (2 ** octave)
        grid_h = int(height * freq) + 2
        grid_w = int(width * freq) + 2
        grid = np.random.rand(grid_h, grid_w).astype(np.float32)
        y_coords = np.linspace(0, grid_h - 1, height)
        x_coords = np.linspace(0, grid_w - 1, width)
        y_idx = np.floor(y_coords).astype(int)
        x_idx = np.floor(x_coords).astype(int)
        y_frac = y_coords - y_idx
        x_frac = x_coords - x_idx
        y_idx = np.clip(y_idx, 0, grid_h - 2)
        x_idx = np.clip(x_idx, 0, grid_w - 2)
        top = grid[y_idx[:, None], x_idx[None, :]] * (1 - x_frac[None, :]) + grid[y_idx[:, None], x_idx[None, :] + 1] * x_frac[None, :]
        bottom = grid[y_idx[:, None] + 1, x_idx[None, :]] * (1 - x_frac[None, :]) + grid[y_idx[:, None] + 1, x_idx[None, :] + 1] * x_frac[None, :]
        img += (top * (1 - y_frac[:, None]) + bottom * y_frac[:, None]) * amp
    return img / img.max()

def save_image(arr, path):
    """Save numpy array as PNG."""
    arr = np.clip(arr * 255, 0, 255).astype(np.uint8)
    Image.fromarray(arr).save(path, quality=95)

W, H = 1600, 1000
random.seed(42)
np.random.seed(42)
out_dir = "/Users/yabuku/Downloads/Ghosted/frontend/src/assets/sections/new"

# ============================================
# 1. HERO ATLAS - Flowing pathways
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
# Deep warm background
img[:, :, 0] = 0.063  # 16/255
img[:, :, 1] = 0.051  # 13/255
img[:, :, 2] = 0.035  # 9/255

noise = noise_field(W, H, scale=0.003, octaves=5)
for y in range(H):
    for x in range(W):
        img[y, x, 0] += noise[y, x] * 0.04
        img[y, x, 1] += noise[y, x] * 0.03

# Flowing lines
for i in range(60):
    t = np.linspace(0, 1, 800)
    y0 = random.uniform(0, H)
    freq = random.uniform(0.003, 0.008)
    amp = random.uniform(50, 250)
    phase = random.uniform(0, math.pi * 2)
    thickness = random.uniform(1, 4)
    opacity = random.uniform(0.08, 0.35)
    hue_shift = random.uniform(-0.02, 0.06)

    ys = y0 + np.sin(t * W * freq + phase) * amp
    xs = t * W
    for j in range(len(xs) - 1):
        x1, y1 = int(xs[j]), int(ys[j])
        x2, y2 = int(xs[j + 1]), int(ys[j + 1])
        if 0 <= x1 < W and 0 <= y1 < H and 0 <= x2 < W and 0 <= y2 < H:
            # Draw soft line
            for dy in range(-int(thickness * 3), int(thickness * 3) + 1):
                for dx in range(-int(thickness * 3), int(thickness * 3) + 1):
                    px, py = x1 + dx, y1 + dy
                    if 0 <= px < W and 0 <= py < H:
                        dist = math.sqrt(dx * dx + dy * dy)
                        if dist <= thickness * 3:
                            falloff = math.exp(-dist / thickness)
                            img[py, px, 0] += (0.769 + hue_shift) * opacity * falloff
                            img[py, px, 1] += (0.506 + hue_shift * 0.5) * opacity * falloff
                            img[py, px, 2] += (0.227 + hue_shift * 0.3) * opacity * falloff

# Soft glow spots
for _ in range(8):
    cx, cy = random.randint(0, W), random.randint(0, H)
    radius = random.uniform(100, 400)
    intensity = random.uniform(0.03, 0.12)
    for y in range(max(0, cy - int(radius)), min(H, cy + int(radius))):
        for x in range(max(0, cx - int(radius)), min(W, cx + int(radius))):
            d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            if d < radius:
                falloff = math.exp(-(d / radius) ** 2)
                img[y, x, 0] += 0.769 * intensity * falloff
                img[y, x, 1] += 0.506 * intensity * falloff
                img[y, x, 2] += 0.227 * intensity * falloff

save_image(img, f"{out_dir}/hero-atlas.png")
print("Generated hero-atlas.png")

# ============================================
# 2. RESUME ORBIT - Concentric rings
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

cx, cy = W // 2, H // 2
for r in range(1, max(W, H) // 2):
    angle = r * 0.02
    intensity = 0.15 * math.exp(-r / 300)
    for t in np.linspace(0, math.pi * 2, min(r * 3, 2000)):
        x = int(cx + math.cos(t + angle) * r)
        y = int(cy + math.sin(t + angle) * r)
        if 0 <= x < W and 0 <= y < H:
            img[y, x, 0] += 0.769 * intensity
            img[y, x, 1] += 0.506 * intensity
            img[y, x, 2] += 0.227 * intensity

# Radial gradient overlay
for y in range(H):
    for x in range(W):
        d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        falloff = math.exp(-d / 500)
        img[y, x, 0] += 0.04 * falloff
        img[y, x, 1] += 0.025 * falloff

save_image(img, f"{out_dir}/resume-orbit.png")
print("Generated resume-orbit.png")

# ============================================
# 3. ATLAS GRID - Subtle mesh
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

# Diagonal mesh
for i in range(-H, W + H, 40):
    for t in np.linspace(0, 1, 1000):
        x = int(i + t * H)
        y = int(t * H)
        if 0 <= x < W and 0 <= y < H:
            intensity = 0.06 + 0.04 * math.sin(i * 0.01)
            img[y, x, 0] += 0.769 * intensity
            img[y, x, 1] += 0.506 * intensity
            img[y, x, 2] += 0.227 * intensity

for i in range(-W, W + H, 40):
    for t in np.linspace(0, 1, 1000):
        x = int(i + t * W)
        y = int(H - t * H)
        if 0 <= x < W and 0 <= y < H:
            intensity = 0.06 + 0.04 * math.sin(i * 0.01)
            img[y, x, 0] += 0.769 * intensity
            img[y, x, 1] += 0.506 * intensity
            img[y, x, 2] += 0.227 * intensity

# Nodes at intersections
for i in range(0, W, 120):
    for j in range(0, H, 120):
        for dy in range(-8, 9):
            for dx in range(-8, 9):
                x, y = i + dx, j + dy
                if 0 <= x < W and 0 <= y < H:
                    d = math.sqrt(dx * dx + dy * dy)
                    if d < 8:
                        falloff = math.exp(-d / 3)
                        img[y, x, 0] += 0.769 * 0.25 * falloff
                        img[y, x, 1] += 0.506 * 0.25 * falloff
                        img[y, x, 2] += 0.227 * 0.25 * falloff

save_image(img, f"{out_dir}/atlas-grid.png")
print("Generated atlas-grid.png")

# ============================================
# 4. PORTAL RIBBON - Flowing ribbons
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

for i in range(30):
    t = np.linspace(0, 1, 1000)
    base_y = random.uniform(0, H)
    freq1 = random.uniform(2, 5)
    freq2 = random.uniform(5, 12)
    amp1 = random.uniform(30, 120)
    amp2 = random.uniform(10, 40)
    thickness = random.uniform(8, 25)
    opacity = random.uniform(0.05, 0.25)

    ys = base_y + np.sin(t * math.pi * freq1) * amp1 + np.sin(t * math.pi * freq2) * amp2
    xs = t * W

    for j in range(len(xs)):
        x = int(xs[j])
        y_base = ys[j]
        for dy in range(-int(thickness * 2), int(thickness * 2) + 1):
            y = int(y_base + dy)
            if 0 <= x < W and 0 <= y < H:
                dist = abs(dy)
                if dist <= thickness:
                    falloff = math.exp(-(dist / thickness) ** 2)
                    img[y, x, 0] += 0.769 * opacity * falloff
                    img[y, x, 1] += 0.506 * opacity * falloff
                    img[y, x, 2] += 0.227 * opacity * falloff

save_image(img, f"{out_dir}/portal-ribbon.png")
print("Generated portal-ribbon.png")

# ============================================
# 5. FLOW STACK - Layered waves
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

for layer in range(15):
    y_offset = layer * (H / 12)
    freq = 0.003 + layer * 0.0005
    amp = 40 + layer * 8
    opacity = 0.15 - layer * 0.008
    for x in range(W):
        y_wave = y_offset + math.sin(x * freq + layer) * amp
        for dy in range(-20, 21):
            y = int(y_wave + dy)
            if 0 <= y < H:
                dist = abs(dy)
                falloff = math.exp(-dist / 8)
                img[y, x, 0] += 0.769 * opacity * falloff
                img[y, x, 1] += 0.506 * opacity * falloff
                img[y, x, 2] += 0.227 * opacity * falloff

save_image(img, f"{out_dir}/flow-stack.png")
print("Generated flow-stack.png")

# ============================================
# 6. RECRUITER WAVE - Organic wave
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

# Background gradient
for y in range(H):
    for x in range(W):
        t = y / H
        img[y, x, 0] += 0.03 * t
        img[y, x, 1] += 0.02 * t

# Large flowing wave
for x in range(W):
    y_wave = H * 0.5 + math.sin(x * 0.004) * 150 + math.sin(x * 0.012) * 50
    for dy in range(-80, 81):
        y = int(y_wave + dy)
        if 0 <= y < H:
            dist = abs(dy)
            falloff = math.exp(-(dist / 60) ** 2)
            img[y, x, 0] += 0.769 * 0.18 * falloff
            img[y, x, 1] += 0.506 * 0.18 * falloff
            img[y, x, 2] += 0.227 * 0.18 * falloff

# Secondary wave
for x in range(W):
    y_wave = H * 0.3 + math.sin(x * 0.006 + 1) * 100
    for dy in range(-40, 41):
        y = int(y_wave + dy)
        if 0 <= y < H:
            dist = abs(dy)
            falloff = math.exp(-(dist / 30) ** 2)
            img[y, x, 0] += 0.769 * 0.08 * falloff
            img[y, x, 1] += 0.506 * 0.08 * falloff
            img[y, x, 2] += 0.227 * 0.08 * falloff

save_image(img, f"{out_dir}/recruiter-wave.png")
print("Generated recruiter-wave.png")

# ============================================
# 7. SIGNAL BEACON - Radiating light
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

cx, cy = W // 2, H // 2

# Radial rays
for angle in np.linspace(0, math.pi * 2, 360):
    for r in range(0, max(W, H) // 2):
        x = int(cx + math.cos(angle) * r)
        y = int(cy + math.sin(angle) * r)
        if 0 <= x < W and 0 <= y < H:
            intensity = 0.12 * math.exp(-r / 300) * (0.7 + 0.3 * math.sin(angle * 8))
            img[y, x, 0] += 0.769 * intensity
            img[y, x, 1] += 0.506 * intensity
            img[y, x, 2] += 0.227 * intensity

# Central glow
for y in range(H):
    for x in range(W):
        d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        falloff = math.exp(-d / 200)
        img[y, x, 0] += 0.769 * 0.3 * falloff
        img[y, x, 1] += 0.506 * 0.3 * falloff
        img[y, x, 2] += 0.227 * 0.3 * falloff

save_image(img, f"{out_dir}/signal-beacon.png")
print("Generated signal-beacon.png")

# ============================================
# 8. FINAL HORIZON - Horizon glow
# ============================================
img = np.zeros((H, W, 3), dtype=np.float32)
img[:, :, 0] = 0.063
img[:, :, 1] = 0.051
img[:, :, 2] = 0.035

# Sky gradient
for y in range(H):
    t = y / H
    for x in range(W):
        img[y, x, 0] += 0.02 * t * t
        img[y, x, 1] += 0.015 * t * t

# Horizon line glow
horizon_y = int(H * 0.55)
for y in range(H):
    for x in range(W):
        d = abs(y - horizon_y)
        falloff = math.exp(-(d / 80) ** 2)
        img[y, x, 0] += 0.769 * 0.25 * falloff
        img[y, x, 1] += 0.506 * 0.25 * falloff
        img[y, x, 2] += 0.227 * 0.25 * falloff

# Scattered light points
for _ in range(200):
    px = random.randint(0, W - 1)
    py = random.randint(0, H - 1)
    brightness = random.uniform(0.05, 0.25)
    size = random.randint(1, 3)
    for dy in range(-size, size + 1):
        for dx in range(-size, size + 1):
            x, y = px + dx, py + dy
            if 0 <= x < W and 0 <= y < H:
                d = math.sqrt(dx * dx + dy * dy)
                if d <= size:
                    falloff = math.exp(-d)
                    img[y, x, 0] += 0.9 * brightness * falloff
                    img[y, x, 1] += 0.85 * brightness * falloff
                    img[y, x, 2] += 0.75 * brightness * falloff

save_image(img, f"{out_dir}/final-horizon.png")
print("Generated final-horizon.png")

print("\nAll images generated successfully!")
