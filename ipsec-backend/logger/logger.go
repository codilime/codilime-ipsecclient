/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package logger

import (
	"errors"
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/sirupsen/logrus"
)

const (
	defaultLogLevel = logrus.InfoLevel
)

type ErrorFormatter struct{}

func NewLogger(name ...string) (*logrus.Logger, error) {
	filename := "ipsecclinet.log"
	if len(name) > 0 {
		filename = name[0]
	}

	file, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		return &logrus.Logger{}, fmt.Errorf("create log file: %w", err)
	}

	log := logrus.New()
	log.Out = file
	log.Formatter = new(logrus.JSONFormatter)
	log.Level = defaultLogLevel

	return log, nil
}

func FieldToString(key string, value interface{}) string {
	switch key {
	case "err":
		return fmt.Sprintf("%s\n", value)
	case "line":
		return fmt.Sprintf(":%d\n", value)
	case "file":
		fullpath := value.(string)
		folders := strings.Split(fullpath, "/")
		parentpath := strings.Join(folders[:len(folders)-1], "/")
		return " " + parentpath + "/" + folders[len(folders)-1]
	case "func":
		return fmt.Sprintf(" %s\n", value)
	}
	return "LOGGER ERROR"
}

func (f *ErrorFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	if entry.Level == logrus.InfoLevel {
		if len(entry.Data) != 0 {
			fmt.Println("ENTRY HAS DATA")
		}
		return []byte(fmt.Sprintf("%s\n", ("INFO: " + entry.Message))), nil
	}

	if entry.Level == logrus.DebugLevel {
		return []byte("DEBUG: " + entry.Message + "\n"), nil
	}
	ret := make([]byte, 0)
	if entry.Data["err"] == nil {
		return ret, nil
	}
	entryErr := entry.Data["err"]
	if entryErr == nil {
		entryErr = ""
	}
	entryFile := entry.Data["file"]
	if entryFile == nil {
		entryFile = "<no file>"
	}
	entryLine := entry.Data["line"]
	if entryLine == nil {
		entryLine = -1
	}
	entryFunc := entry.Data["func"]
	if entryFunc == nil {
		entryFunc = "<no func>"
	}
	ret = append(ret, []byte("ERROR: "+entry.Message)...)
	ret = append(ret, []byte(FieldToString("err", entryErr))...)
	ret = append(ret, []byte(FieldToString("file", entryFile)+FieldToString("line", entryLine))...)
	ret = append(ret, []byte(FieldToString("func", entryFunc))...)
	return ret, nil
}

//Fatal logs error and fails
func Fatal(log *logrus.Logger, errs ...error) {
	ReturnErrorEx(2, log, errs...) // ignore the return value
	fmt.Println("FATAL EXIT")
	os.Exit(1)
}

//Error logs errors in a unified way using logrus
func Error(log *logrus.Logger, errs ...error) {
	pc, file, line, _ := runtime.Caller(1)
	f := runtime.FuncForPC(pc)
	errStrs := make([]string, 0)
	for _, err := range errs {
		errStrs = append(errStrs, err.Error())
	}

	log.WithFields(logrus.Fields{
		"err":  strings.Join(errStrs, ", "),
		"line": line,
		"func": f.Name(),
		"file": file,
	}).Error()
}

func InfoDebug(info, debug string, log *logrus.Logger) {
	if log.GetLevel() >= logrus.DebugLevel {
		log.Debugf(debug)
	} else {
		log.Infof(info)
	}
}

//ReturnError logs error, but returns it, allowing returning of errors to be chained in a "stack trace"
func ReturnError(log *logrus.Logger, errs ...error) error {
	return ReturnErrorEx(2, log, errs...)
}

func ReturnErrorEx(caller int, log *logrus.Logger, errs ...error) error {
	empty := true
	for _, v := range errs {
		if v != nil {
			empty = false
		}
	}

	if empty {
		return nil
	}

	pc, file, line, _ := runtime.Caller(caller)
	f := runtime.FuncForPC(pc)
	errStr := ""
	if len(errs) == 1 {
		errStr = errs[0].Error()
	} else {
		for i, err := range errs {
			currentErr := "<nil>"
			if err != nil {
				currentErr = err.Error()
			}
			errStr = errStr + fmt.Sprintf("%d: %s\n", i, currentErr)
		}
	}
	logrus.WithFields(logrus.Fields{
		"err":  errStr,
		"line": line,
		"func": f.Name(),
		"file": file,
	}).Debug("")

	log.WithFields(logrus.Fields{
		"err":  errStr,
		"line": line,
		"func": f.Name(),
		"file": file,
	}).Error("")
	if len(errs) == 1 {
		return errs[0]
	}
	return errors.New(errStr)
}

func ReturnNewError(err string, log *logrus.Logger) error {
	return ReturnErrorEx(2, log, errors.New(err))
}
