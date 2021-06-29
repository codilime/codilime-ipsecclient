package main

import (
	"crypto/tls"
	"net/http"
)

var testRoutes string = `{
	"Cisco-IOS-XE-bgp-oper:bgp-route-neighbors": {
	  "bgp-route-neighbor": [
	    {
	      "nbr-id": "192.168.1.1",
	      "bgp-neighbor-route-filters": {
		"bgp-neighbor-route-filter": [
		  {
		    "nbr-fltr": "bgp-nrf-post-received",
		    "bgp-neighbor-route-entries": {
		      "bgp-neighbor-route-entry": [
			{
			  "prefix": "172.19.1.0/24",
			  "version": 2,
			  "available-paths": 1,
			  "advertised-to": "",
			  "bgp-neighbor-path-entries": {
			    "bgp-neighbor-path-entry": [
			      {
				"nexthop": "192.168.1.1",
				"metric": 0,
				"local-pref": 100,
				"weight": 0,
				"as-path": "65001",
				"origin": "origin-igp",
				"path-status": {
				  "valid": [null],
				  "bestpath": [null]
				},
				"rpki-status": "rpki-not-enabled",
				"community": "",
				"mpls-in": "",
				"mpls-out": "",
				"sr-profile-name": "",
				"sr-binding-sid": 0,
				"sr-label-indx": 0,
				"as4-path": "",
				"atomic-aggregate": false,
				"aggr-as-number": 0,
				"aggr-as4-number": 0,
				"aggr-address": "",
				"originator-id": "",
				"cluster-list": "",
				"extended-community": "",
				"ext-aigp-metric": "0",
				"path-id": 0,
				"path-origin": "external-path"
			      }
			    ]
			  }
			},
			{
			  "prefix": "192.168.1.2/32",
			  "version": 3,
			  "available-paths": 1,
			  "advertised-to": "",
			  "bgp-neighbor-path-entries": {
			    "bgp-neighbor-path-entry": [
			      {
				"nexthop": "192.168.1.1",
				"metric": 0,
				"local-pref": 100,
				"weight": 0,
				"as-path": "65001",
				"origin": "origin-igp",
				"path-status": {
				  "valid": [null],
				  "bestpath": [null],
				  "rib-fail": [null]
				},
				"rpki-status": "rpki-not-enabled",
				"community": "",
				"mpls-in": "",
				"mpls-out": "",
				"sr-profile-name": "",
				"sr-binding-sid": 0,
				"sr-label-indx": 0,
				"as4-path": "",
				"atomic-aggregate": false,
				"aggr-as-number": 0,
				"aggr-as4-number": 0,
				"aggr-address": "",
				"originator-id": "",
				"cluster-list": "",
				"extended-community": "",
				"ext-aigp-metric": "0",
				"path-id": 0,
				"path-origin": "external-path"
			      }
			    ]
			  }
			}
		      ]
		    }
		  }
		]
	      }
	    }
	  ]
	}
      }`

func hwMetrics() {

}

func hwMetricsName(w http.ResponseWriter, r *http.Request) {

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
