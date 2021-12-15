#!/usr/bin/python3
import subprocess, sys, argparse, atexit, time, shutil
from pathlib import Path


parser = argparse.ArgumentParser()
parser.add_argument(
    "--csr-vm",
    nargs=2,
    metavar=("<csr-vm path>", "<csr_config.iso path>"),
    help="start csr-vm - pass csr-vm and csr_config.iso paths",
)
parser.add_argument(
    "--clean", action="store_true", help="clean docker images and containters"
)
parser.add_argument(
    "--pack",
    action="store_true",
    help="create package in the out directory",
)
parser.add_argument(
    "--ut",
    action="store_true",
    help="build api unit tests",
)
args = parser.parse_args()

build_processes = []


@atexit.register
def my_except_hook():
    for process in build_processes:
        process.terminate()


if args.clean:
    subprocess.run("docker stop sico_api", shell=True)
    subprocess.run("docker stop sico_net", shell=True)
    subprocess.run("docker stop sico_test", shell=True)

    subprocess.run("docker rm sico_api", shell=True)
    subprocess.run("docker rm sico_net", shell=True)
    subprocess.run("docker rm sico_test", shell=True)

    subprocess.run("docker rmi sico_api", shell=True)
    subprocess.run("docker rmi sico_net", shell=True)
    subprocess.run("docker rmi sico_test", shell=True)

    subprocess.run("docker system prune -f", shell=True)
    subprocess.run("docker volume prune -f", shell=True)

if args.csr_vm:
    subprocess.run("helper-scripts/docker_network_create.sh", shell=True)

    run_vm = ["./helper-scripts/run_vm.py", args.csr_vm[0], args.csr_vm[1]]

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

build_processes.append(
    subprocess.Popen(
        "exec docker build -t sico_api --build-arg VERSION="
        + version
        + " -f sico_api.dockerfile .",
        shell=True,
    )
)
build_processes.append(
    subprocess.Popen(
        "exec docker build -t sico_net --build-arg VERSION="
        + version
        + " -f sico_net.dockerfile .",
        shell=True,
    )
)
if args.ut:
    build_processes.append(
        subprocess.Popen(
            "exec docker build -t sico_api_ut -f sico_api_ut.dockerfile .", shell=True
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
    package_name = "sico_ipsec-" + package_version
    package = "out/" + package_name + ".tar.gz"
    images_path = "out/images/"
    image_api = package_name + "/sico_api-" + package_version + ".tar"
    image_net = package_name + "/sico_net-" + package_version + ".tar"
    Path("out/images/" + package_name).mkdir(parents=True, exist_ok=True)

    subprocess.run(
        "exec docker save --output " + images_path + image_api + " sico_api",
        shell=True,
        check=True,
    )
    subprocess.run(
        "exec docker save --output " + images_path + image_net + " sico_net",
        shell=True,
        check=True,
    )

    subprocess.run(
        "tar -czvf "
        + package
        + " --directory="
        + images_path
        + " "
        + image_api
        + " "
        + image_net,
        shell=True,
        check=True,
    )
    shutil.rmtree(images_path)
    print("created package: " + package)
