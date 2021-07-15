package main

import (
	"crypto/tls"
	"net/http"
)

func GetHWRoutes() (map[string][]string, error) {
	ret := map[string][]string{}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	routeNeighbors, err := restconfGetData("Cisco-IOS-XE-bgp-oper:bgp-state-data/bgp-route-vrfs/bgp-route-vrf=default/bgp-route-afs/bgp-route-af=ipv4-unicast/bgp-route-neighbors", client)
	if err != nil {
		return ret, err
	}
	innerRouteNeighbors := routeNeighbors["Cisco-IOS-XE-bgp-oper:bgp-route-neighbors"].(map[string]interface{})["bgp-route-neighbor"].([]interface{})
	for _, n := range innerRouteNeighbors {
		neighbor := n.(map[string]interface{})
		routeFilters := neighbor["bgp-neighbor-route-filters"].(map[string]interface{})["bgp-neighbor-route-filter"].([]interface{})
		for _, f := range routeFilters {
			routeFilter := f.(map[string]interface{})
			routeEntries, ok := routeFilter["bgp-neighbor-route-entries"].(map[string]interface{})
			if !ok {
				continue
			}
			routeEntries2 := routeEntries["bgp-neighbor-route-entry"].([]interface{})
			for _, e := range routeEntries2 {
				routeEntry := e.(map[string]interface{})
				prefix := routeEntry["prefix"].(string)
				pathEntries := routeEntry["bgp-neighbor-path-entries"].(map[string]interface{})["bgp-neighbor-path-entry"].([]interface{})
				paths := []string{}
				for _, p := range pathEntries {
					pathEntry := p.(map[string]interface{})
					paths = append(paths, pathEntry["nexthop"].(string))
				}
				ret[prefix] = paths
			}
		}
	}

	return ret, nil
}

func GetHWBGP() (map[string]string, error) {
	ret := map[string]string{}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	neighbors, err := restconfGetData("Cisco-IOS-XE-bgp-oper:bgp-state-data/neighbors", client)
	if err != nil {
		return ret, err
	}
	neighborList := neighbors["Cisco-IOS-XE-bgp-oper:neighbors"].(map[string]interface{})["neighbor"].([]interface{})
	for _, n := range neighborList {
		neighbor := n.(map[string]interface{})
		ret[neighbor["neighbor-id"].(string)] = neighbor["session-state"].(string)
	}
	return ret, nil
}
