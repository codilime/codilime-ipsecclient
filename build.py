#!/usr/bin/python3

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

import subprocess, sys, argparse, atexit, time, shutil, io, os.path
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload


parser = argparse.ArgumentParser()
parser.add_argument(
    "--csr-vm",
    nargs=2,
    metavar=("<csr-vm path>", "<csr_config.iso path>"),
    help="start csr-vm - pass path to csr-vm and csr_config.iso",
)
parser.add_argument(
    "--clean", action="store_true", help="clean docker images and containters"
)
parser.add_argument(
    "--pack",
    nargs=1,
    metavar=("<documentation download creds path>"),
    help="create package in the out directory",
)
parser.add_argument(
    "--ut",
    action="store_true",
    help="build api unit tests",
)
args = parser.parse_args()

build_processes = []


def download_documentation(out_file_path, creds_path):
    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=["https://www.googleapis.com/auth/drive"]
    )
    drive_service = build("drive", "v3", credentials=creds)
    file_request = drive_service.files().export(
        fileId="16O-JMl2KWCWqJRBrQFFWVW7KaMAnbZtgVaxE7GLyVtE",
        mimeType="application/pdf",
    )
    fh = io.BytesIO()
    file_downloader = MediaIoBaseDownload(fd=fh, request=file_request)

    done = False
    while not done:
        _, done = file_downloader.next_chunk()

    fh.seek(0)
    with open(os.path.join(out_file_path), "wb") as f:
        f.write(fh.read())
        f.close()


@atexit.register
def my_except_hook():
    for process in build_processes:
        process.terminate()


if args.clean:
    subprocess.run("docker stop ipsecclient", shell=True)
    subprocess.run("docker stop ipsecclient_test", shell=True)

    subprocess.run("docker rm ipsecclient", shell=True)
    subprocess.run("docker rm ipsecclient_test", shell=True)

    subprocess.run("docker rmi ipsecclient", shell=True)
    subprocess.run("docker rmi ipsecclient_test", shell=True)

    subprocess.run("docker system prune -f", shell=True)
    subprocess.run("docker volume prune -f", shell=True)


subprocess.run("helpers/docker_network_create.sh", shell=True)


if args.csr_vm:
    run_vm = ["./helpers/run_vm.py", args.csr_vm[0], args.csr_vm[1]]

    csr_vm = subprocess.run(run_vm)
    if csr_vm.returncode:
        csr_vm = subprocess.run(
            "virsh -c qemu:///system destroy csr_vm; virsh -c qemu:///system undefine csr_vm",
            shell=True,
        )
        csr_vm = subprocess.run(run_vm)
        if csr_vm.returncode:
            sys.exit("Unable to run CSR-VM")

version = subprocess.run(
    r"git describe --tag --long --abbrev=40",
    shell=True,
    check=True,
    stdout=subprocess.PIPE,
    universal_newlines=True,
).stdout.split("\n")[0]

content_path = "out/content/"
Path(content_path).mkdir(parents=True, exist_ok=True)

if args.pack:
    download_documentation(content_path + "documentation.pdf", creds_path=args.pack[0])
else:
    shutil.copyfile("helpers/dummy.pdf", content_path + "documentation.pdf")


build_processes.append(
    subprocess.Popen(
        "exec docker build -t ipsecclient --build-arg VERSION="
        + version
        + " -f ipsecclient.dockerfile .",
        shell=True,
    )
)

if args.ut:
    build_processes.append(
        subprocess.Popen(
            "exec docker build -t ipsecclient_ut -f ipsecclient_ut.dockerfile .",
            shell=True,
        )
    )

while build_processes:
    time.sleep(1)
    for process in build_processes:
        returncode = process.poll()
        if returncode is None:
            continue
        elif returncode:
            sys.exit(returncode)
        else:
            build_processes.remove(process)
            break

if args.pack:
    package_version = subprocess.run(
        r'exec git describe --tags --long | sed "s/\(.*\)-.*/\1/"',
        shell=True,
        check=True,
        stdout=subprocess.PIPE,
        universal_newlines=True,
    ).stdout.split("\n")[0]
    package_name = "ipsecclient-" + package_version
    package = "out/" + package_name + ".tar.gz"
    image = package_name + "/ipsecclient-" + package_version + ".tar"
    documentation = package_name + "/documentation.pdf"
    Path(content_path + package_name).mkdir(parents=True, exist_ok=True)

    download_documentation(content_path + documentation, creds_path=args.pack[0])

    subprocess.run(
        "exec docker save --output " + content_path + image + " ipsecclient",
        shell=True,
        check=True,
    )

    subprocess.run(
        "tar -czvf "
        + package
        + " --directory="
        + content_path
        + " "
        + image
        + " "
        + documentation,
        shell=True,
        check=True,
    )
    print("created package: " + package)

shutil.rmtree(content_path)
