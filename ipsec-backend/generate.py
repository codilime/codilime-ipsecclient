#!/usr/bin/python3
import subprocess, sys, argparse, atexit, time, shutil
from pathlib import Path


mock = "mock"
yang = "yang"

parser = argparse.ArgumentParser()
parser.add_argument(
    "--mock",
    action="store_true",
    help="generate mocks",
)
parser.add_argument(
    "--yang",
    nargs=1,
    metavar=("<ygot generator binary path>"),
    help="generate yang Go structures - pass ygot generator binary path",
)
args = parser.parse_args()

if args.mock:
    subprocess.run("go generate ./...", shell=True)

if args.yang:
    subprocess.run(
        args.yang[0]
        + " -output_file=sico_yang/sico_yang.go -package_name=sico_yang sico-ipsec.yang",
        shell=True,
    )
