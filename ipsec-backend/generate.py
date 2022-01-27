#!/usr/bin/python3

# 	Copyright (c) 2021 Cisco and/or its affiliates
#
# 	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# 	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

import subprocess, sys, argparse, atexit, time, shutil
from pathlib import Path


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
