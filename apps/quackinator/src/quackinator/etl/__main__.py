import argparse
import logging

from quackinator.config import settings
from quackinator.etl.build import build_and_save


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild the quackinator story index")
    parser.add_argument("--index-dir", default=None, help="override output directory")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)-5s %(message)s",
        datefmt="%H:%M:%S",
    )
    cfg = settings
    if args.index_dir:
        cfg = settings.model_copy(update={"index_dir": args.index_dir})
    build_and_save(cfg)


if __name__ == "__main__":
    main()
