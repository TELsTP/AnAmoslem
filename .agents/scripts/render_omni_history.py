"""Render selected pages from the private Omni history PDF for inspection.

This script intentionally writes only derived page images under .agents/outputs.
The source PDF remains in attached_assets and is not copied into any durable
handoff or memory file.
"""

from pathlib import Path
import sys

import fitz


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: render_omni_history.py PDF [page ...]")

    source = Path(sys.argv[1])
    pages = [int(value) for value in sys.argv[2:]] or [1, 2, 3, 580]
    output_dir = Path(".agents/outputs/omni-history-sample")
    output_dir.mkdir(parents=True, exist_ok=True)

    document = fitz.open(source)
    for page_number in pages:
        if page_number < 1 or page_number > document.page_count:
            raise SystemExit(f"page out of range: {page_number}")
        page = document.load_page(page_number - 1)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        output = output_dir / f"page-{page_number:04d}.png"
        pixmap.save(output)
        print(f"rendered page {page_number} -> {output}")


if __name__ == "__main__":
    main()