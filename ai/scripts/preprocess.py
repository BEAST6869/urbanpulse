"""
Data preprocessing utilities for the UrbanPulse AI system.

Provides helpers to split datasets, balance classes, and visualize samples.
"""

import os
import shutil
import random
from typing import List, Tuple

from PIL import Image


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def split_dataset(source_dir: str, train_dir: str, val_dir: str, split: float = 0.8, seed: int = 42):
    random.seed(seed)
    classes = [d for d in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, d))]

    for cls in classes:
        src = os.path.join(source_dir, cls)
        images = [f for f in os.listdir(src) if os.path.isfile(os.path.join(src, f))]
        random.shuffle(images)

        split_idx = int(len(images) * split)
        train_imgs = images[:split_idx]
        val_imgs = images[split_idx:]

        # Create dirs
        ensure_dir(os.path.join(train_dir, cls))
        ensure_dir(os.path.join(val_dir, cls))

        # Copy files
        for f in train_imgs:
            shutil.copy2(os.path.join(src, f), os.path.join(train_dir, cls, f))
        for f in val_imgs:
            shutil.copy2(os.path.join(src, f), os.path.join(val_dir, cls, f))

        print(f"Class {cls}: {len(train_imgs)} train, {len(val_imgs)} val")


def verify_images(root_dir: str, exts: Tuple[str, ...] = ('.jpg', '.jpeg', '.png', '.webp')):
    bad = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if f.lower().endswith(exts):
                p = os.path.join(dirpath, f)
                try:
                    with Image.open(p) as img:
                        img.verify()
                except Exception:
                    bad.append(p)
    if bad:
        print("Invalid/corrupt images:")
        for p in bad:
            print(" -", p)
    else:
        print("All images verified OK.")

