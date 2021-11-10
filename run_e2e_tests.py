#!/usr/bin/python3
import argparse, subprocess, sys, urllib3, atexit, time


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
args = parser.parse_args()

processes = []


@atexit.register
def my_except_hook():
    for process in processes:
        process.terminate()


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def main():
    subprocess.run(
        "exec docker build -f ./test/Dockerfile -t sico_test .", shell=True, check=True
    )
    run_app()
    run_dev_env()
    run_test_cases()
    terminate_app_processes()


def run_app():
    processes.append(
        subprocess.Popen(
            "exec ./run_api.sh",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
    )
    processes.append(
        subprocess.Popen(
            "exec ./run_net.sh",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
    )


def run_dev_env():
    processes.append(
        subprocess.Popen(
            "exec docker-compose -f ./dev-env/docker-compose.yml up",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
    )


def run_test_cases():
    run_command = ""
    if args.csr_vm:
        if args.k:
            run_command = "exec ./test/run_test.sh -k " + args.k[0]
        else:
            run_command = "exec ./test/run_test.sh"
    else:
        if args.k:
            run_command = (
                "exec ./test/run_test.sh -k 'not hardware and " + args.k[0] + "'"
            )
        else:
            run_command = "exec ./test/run_test.sh -k 'not hardware'"

    returncode = subprocess.run(run_command, shell=True).returncode
    if returncode:
        sys.exit(returncode)


def terminate_app_processes():
    print("terminate app process")
    for process in processes:
        process.terminate()
        print("waiting...")
        process.communicate()
    processes.clear()
    print("done")


if __name__ == "__main__":
    main()
