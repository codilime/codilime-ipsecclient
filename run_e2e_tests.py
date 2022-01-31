#!/usr/bin/python3

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

import argparse, subprocess, sys, urllib3, atexit


parser = argparse.ArgumentParser()
parser.add_argument("--csr-vm", action="store_true", help="run tests with csr vm")
parser.add_argument(
    "-k",
    nargs=1,
    type=str,
    metavar="EXPRESSION",
    help="pytest flag: only run tests which match the given substring expression. \
        Example: -k 'test_method or test_other' matches all test functions and classes whose name contains'test_method'",
)
parser.add_argument(
    "--logs",
    action="store_true",
    help="print logs from the app at the end of the test suite run",
)
args = parser.parse_args()

processes = []


@atexit.register
def my_except_hook():
    for process in processes:
        print("terminate app process")
        process.terminate()


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def main():
    subprocess.run(
        "exec docker build -f ./test/Dockerfile -t sico_test .", shell=True, check=True
    )
    remove_containers()
    run_app()
    run_dev_env()
    run_test_cases()
    terminate_app_processes()


def run_app():
    processes.append(
        subprocess.Popen(
            "exec ./run_ipsec_client.sh",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
    )


def remove_containers():
    subprocess.run(
        "docker stop $(docker ps | grep sico | awk '{print $1}')", shell=True
    )
    subprocess.run(
        "docker stop $(docker ps | grep site | awk '{print $1}')", shell=True
    )
    subprocess.run("docker container prune -f", shell=True)
    subprocess.run("docker volume prune -f", shell=True)


def run_dev_env():
    subprocess.run("docker-compose -f ./dev-env/docker-compose.yml build", shell=True)
    processes.append(
        subprocess.Popen(
            "exec docker-compose -f ./dev-env/docker-compose.yml up",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
    )


def check_if_processes_running():
    for process in processes:
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print(
                "process failed: ",
                "" if stdout is None else stdout.splitlines(),
                "" if stderr is None else stderr.splitlines(),
            )
            processes.remove(process)
            return False
    return True


def run_test_cases():
    if not check_if_processes_running():
        return
    run_command = ""
    if args.k:
        run_command = "exec ./test/run_test.sh -k " + args.k[0]
    else:
        if args.csr_vm:
            run_command = "exec ./test/run_test.sh"
        else:
            run_command = "exec ./test/run_test.sh -k 'not csr_vm'"

    returncode = subprocess.run(run_command, shell=True).returncode
    if args.logs:
        subprocess.run(
            "docker exec -it sico /bin/sh -c 'cat /opt/logs/api.log'", shell=True
        )

    if returncode:
        sys.exit(returncode)


def terminate_app_processes():
    print("terminate app processes")
    for process in processes:
        process.terminate()
        print("waiting for {}...".format(process.args))
        process.communicate()
    processes.clear()
    print("done")


if __name__ == "__main__":
    main()
