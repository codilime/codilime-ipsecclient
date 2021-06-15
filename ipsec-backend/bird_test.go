package main

import (
	"reflect"
	"testing"
)

func TestParseRoutes(t *testing.T) {
	arg := `1007-Table cisco_vrf_100:
 192.168.100.0/24     unicast [c_cisco_vrf_100 10:35:18.159] * (240)
 	dev eth0.0100
 10.0.0.6/32          unicast [c_cisco_vrf_100 10:35:18.182] * (240)
 	dev ipsec-010002
 100.65.0.0/24        unicast [d_cisco_vrf_10001 10:35:22.300] * (100) [AS65002i]
 	via 10.0.0.2 on ipsec-010001
                      unicast [d_cisco_vrf_10002 10:35:25.945] (100) [AS65003i]
 	via 10.0.0.6 on ipsec-010002
 10.0.0.2/32          unicast [c_cisco_vrf_100 10:35:18.174] * (240)
  	dev ipsec-010001
 0000 
`
	got := parseRoutes(arg)

	expected := map[string][]string{
		"192.168.100.0/24": {"unicast [c_cisco_vrf_100 10:35:18.159] * (240) dev eth0.0100"},
		"10.0.0.6/32":      {"unicast [c_cisco_vrf_100 10:35:18.182] * (240) dev ipsec-010002"},
		"100.65.0.0/24":    {"unicast [d_cisco_vrf_10001 10:35:22.300] * (100) [AS65002i] via 10.0.0.2 on ipsec-010001", "unicast [d_cisco_vrf_10002 10:35:25.945] (100) [AS65003i] via 10.0.0.6 on ipsec-010002"},
		"10.0.0.2/32":      {"unicast [c_cisco_vrf_100 10:35:18.174] * (240) dev ipsec-010001"},
	}
	if !reflect.DeepEqual(got, expected) {
		t.Fatalf("got %+v", got)
	}
}
