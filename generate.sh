#!/bin/bash

generator \
        -output_file=ipsec-backend/sico_yang/sico_yang.go \
        -package_name=sico_yang \
        sico-ipsec.yang
