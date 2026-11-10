"""Package only explicit source paths and the freshly built static directory."""
import hashlib
import io
import json
from pathlib import Path
import sys
import tarfile
import zipfile

manifest=json.loads(Path(sys.argv[1]).read_text())
root=Path(manifest['root']).resolve()
out=root/'artifacts'
out.mkdir(exist_ok=True)
revision=manifest['metadata']['sourceFingerprint'][:12]
static=out/f'deep-drop-fn-static-{revision}.zip'
source=out/f'deep-drop-fn-source-{revision}.tar.gz'
with zipfile.ZipFile(static,'w',zipfile.ZIP_DEFLATED) as archive:
    for path in sorted((root/'dist').rglob('*')):
        if path.is_file():
            archive.write(path,path.relative_to(root/'dist'))
with tarfile.open(source,'w:gz') as archive:
    for relative in sorted(manifest['files']):
        path=root/relative
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            raise RuntimeError(f'Unsafe source path: {relative}')
        archive.add(path,arcname=relative,recursive=False)
    data=(json.dumps(manifest['metadata'],indent=2)+'\n').encode()
    info=tarfile.TarInfo('SOURCE_MANIFEST.json')
    info.size=len(data)
    archive.addfile(info,io.BytesIO(data))
checksums=[]
for path in [static,source]:
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    checksums.append(f'{digest}  {path.name}')
    print(path)
(out/'SHA256SUMS').write_text('\n'.join(checksums)+'\n')
