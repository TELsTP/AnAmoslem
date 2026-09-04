from pathlib import Path
import fitz

source_names = [
    "noura-Hayat-main-Core_1788557139462.pdf",
    "noura_frame_1788557139579.pdf",
    "Noura-Hayat-Conversation-deploypad.__1788557139618.pdf",
    "Noura&Hayat_1788557139653.pdf",
    "نورا_تبني_نفسها_وترسم_خارطة_الطريق_1788557139690.pdf",
    "AI_companion_in_TELSTP__1788557139731.pdf",
]

out_dir = Path(".agents/outputs/noura-docs")
out_dir.mkdir(parents=True, exist_ok=True)

for source_name in source_names:
    source = Path("attached_assets") / source_name
    document = fitz.open(source)
    print(f"{source_name}: {document.page_count} pages")
    for page_number in sorted({0, document.page_count - 1}):
        page = document.load_page(page_number)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        output_name = f"{source.stem[:40]}-page-{page_number + 1}.png"
        pixmap.save(out_dir / output_name)