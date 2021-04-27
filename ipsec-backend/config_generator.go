package main

import (
	"strings"
	"text/template"
)

const strongswanTemplateFile = "templates/strongswan.conf.template"

func generateStrongswanTemplate(vars *Vrf) (string, error) {
	t, err := template.ParseFiles(strongswanTemplateFile)
	if err != nil {
		return "", err
	}
	builder := strings.Builder{}
	err = t.Execute(&builder, vars)
	if err != nil {
		return "", err
	}
	return builder.String(), nil
}
