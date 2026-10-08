#!/usr/bin/env python3
"""Add aarch64/arm64 support to PaddleX's HPI backend selection so it prefers
ONNX Runtime, working around the PaddlePaddle arm64 SIGSEGV. Adapted from
https://github.com/PaddlePaddle/PaddleOCR/pull/17824 to locate the target file
by content (its path varies across paddlex versions)."""

import pathlib
import sys

SITE_PACKAGES = (
    pathlib.Path(sys.prefix)
    / "lib"
    / f"python{sys.version_info.major}.{sys.version_info.minor}"
    / "site-packages"
)

OLD = '''\
        if arch == "x86_64":
            key = "cpu_x64"
        else:
            return None, f"{repr(arch)} is not a supported architecture."'''

NEW = '''\
        if arch == "x86_64":
            key = "cpu_x64"
        elif arch in ("aarch64", "arm64"):
            aarch64_backends = [
                b for b in ("onnxruntime", "paddle") if b in available_backends
            ]
            if not aarch64_backends:
                return None, "No suitable inference backend for aarch64."
            if hpi_config.backend is not None:
                if hpi_config.backend in aarch64_backends:
                    return hpi_config.backend, {}
                return (
                    None,
                    f"Inference backend {repr(hpi_config.backend)}"
                    " is not available on aarch64.",
                )
            return aarch64_backends[0], {}
        else:
            return None, f"{repr(arch)} is not a supported architecture."'''


def main():
    paddlex_dir = SITE_PACKAGES / "paddlex"
    if not paddlex_dir.exists():
        print(f"ERROR: {paddlex_dir} not found", file=sys.stderr)
        sys.exit(1)

    for path in paddlex_dir.rglob("*.py"):
        src = path.read_text(encoding="utf-8")
        if OLD in src:
            path.write_text(src.replace(OLD, NEW), encoding="utf-8")
            print(f"Patched {path} for aarch64 support")
            return
        if "aarch64" in src and "cpu_x64" in src:
            print(f"{path} already patched for aarch64, skipping")
            return

    print("ERROR: cannot find HPI backend-selection target in paddlex", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
