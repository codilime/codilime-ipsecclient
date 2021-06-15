package main

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	birdsocket "github.com/michalzurawski/bird_socket"
)

const (
	birdSocketPath = "/opt/bird/bird.ctl"
	birdTimeout    = time.Second
)

func ReloadBird() error {
	s := birdsocket.NewSocket(birdSocketPath, birdsocket.WithReadDeadline(birdTimeout))
	if _, err := s.Connect(); err != nil {
		return err
	}
	ret, err := s.Query("configure")
	if err != nil {
		return err
	}
	if strings.Contains(string(ret), "failed") || strings.Contains(string(ret), "error") {
		return errors.New("reloading bird failed\n" + string(ret))
	}
	return nil
}

func GetBirdState() (map[string]string, error) {
	s := birdsocket.NewSocket(birdSocketPath, birdsocket.WithReadDeadline(birdTimeout))
	if _, err := s.Connect(); err != nil {
		return nil, err
	}
	ret, err := s.Query("show protocols")
	if err != nil {
		return nil, err
	}

	res := parseResponse(string(ret))
	return res, nil
}

func GetBirdSingleState(name string) (map[string]string, error) {
	s := birdsocket.NewSocket(birdSocketPath, birdsocket.WithReadDeadline(birdTimeout))
	if _, err := s.Connect(); err != nil {
		return nil, err
	}
	vrf := strings.Split(name, "-")[0]
	ret, err := s.Query(fmt.Sprintf(`show protocols "d_cisco_vrf_%s*"`, vrf))
	if err != nil {
		return nil, err
	}

	res := parseResponse(string(ret))
	return res, nil
}

func GetBirdRoutes(name string) (map[string][]string, error) {
	vrf := strings.Split(name, "-")[0]
	s := birdsocket.NewSocket(birdSocketPath, birdsocket.WithReadDeadline(birdTimeout))
	if _, err := s.Connect(); err != nil {
		return nil, err
	}
	ret, err := s.Query(fmt.Sprintf("show route table cisco_vrf_%s", vrf))
	if err != nil {
		return nil, err
	}

	return parseRoutes(string(ret)), nil
}

func parseResponse(ret string) map[string]string {
	data := strings.Split(ret, "\n")
	space := regexp.MustCompile(`\s+`)
	res := map[string]string{}
	for _, d := range data {
		if !strings.Contains(d, "BGP") {
			continue
		}
		trimmed := strings.Trim(d, " ")
		name := strings.Split(trimmed, " ")[0]
		s := space.ReplaceAllString(trimmed, " ")
		info := strings.Split(s, " ")[5:] // format is d_cisco_vrf_10001 BGP --- up 2021-05-15 Established
		res[name] = strings.Join(info, " ")
	}
	return res
}

func parseRoutes(r string) map[string][]string {
	res := map[string][]string{}
	data := strings.Split(r, "\n")
	space := regexp.MustCompile(`\s+`)
	for i, d := range data {
		if !strings.Contains(d, "/") {
			continue
		}
		trimmed := strings.TrimSpace(d)
		s := space.ReplaceAllString(trimmed, " ")
		name := strings.Split(s, " ")[0]
		val := []string{s[len(name)+1:] + " " + strings.TrimSpace(data[i+1])}
		j := i + 2
		for j < len(data)-1 {
			t := strings.TrimSpace(data[j])
			if strings.HasPrefix(t, "unicast") {
				val = append(val, t+" "+strings.TrimSpace(data[j+1]))
			} else {
				break
			}
			j += 2
		}

		res[name] = val
	}
	return res
}
