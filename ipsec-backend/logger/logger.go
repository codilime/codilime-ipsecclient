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

	log "github.com/sirupsen/logrus"
)

type ErrorFormatter struct{}

const (
	logPath = "opt/logs/"
	devLogFileName = "dev.log"
_)

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

func NewDevLogger(lvl log.Level) (*log.Logger, error) {

	path := logPath + devLogFileName

	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		return &log.Logger{}, fmt.Errorf("create dev og file: %w", err)
	}

	log := log.New()
	log.Out = file
	log.Formatter = &ErrorFormatter{}
	log.Level = lvl

	return log, nil
}

func ApiAndDevLog(devlog *log.Logger, msg string, lvl log.Level){
	switch lvl{
		case log.DebugLevel:
			devlog.Debug(msg)
			log.Debug(msg)
		case log.InfoLevel:
			devlog.Info(msg)
			log.Info(msg)
	}
}

func (f *ErrorFormatter) Format(entry *log.Entry) ([]byte, error) {
	if entry.Level == log.InfoLevel {
		if len(entry.Data) != 0 {
			fmt.Println("ENTRY HAS DATA")
		}
		return []byte(fmt.Sprintf("%s\n", ("INFO: " + entry.Message))), nil
	}

	if entry.Level == log.DebugLevel {
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

// Fatal logs error and fails
func Fatal(devlog *log.Logger, err error) {
	ReturnErrorEx(devlog, 2, err) // ignore the return value
	fmt.Println("FATAL EXIT")
	os.Exit(1)
}

// Error logs errors in a unified way using logrus
func Error(errs ...error) {
	pc, file, line, _ := runtime.Caller(1)
	f := runtime.FuncForPC(pc)
	errStrs := make([]string, 0)
	for _, err := range errs {
		errStrs = append(errStrs, err.Error())
	}

	log.WithFields(log.Fields{
		"err":  strings.Join(errStrs, ", "),
		"line": line,
		"func": f.Name(),
		"file": file,
	}).Error()
}

func InfoDebug(info, debug string) {
	if log.GetLevel() >= log.DebugLevel {
		log.Debugf(debug)
	} else {
		log.Infof(info)
	}
}

// LogErrorReturnFirst logs error, but returns it, allowing returning of errors to be chained in a "stack trace"
func LogErrorReturnFirst(devlog *log.Logger, err error) error {
	return ReturnErrorEx(devlog, 2, err)
}

func ReturnErrorEx(devlog *log.Logger, caller int, err error) error {
	if err == nil {
		return err
	}

	pc, file, line, _ := runtime.Caller(caller)
	f := runtime.FuncForPC(pc)

	devlog.WithFields(log.Fields{
		"err":  err.Error(),
		"line": line,
		"func": f.Name(),
		"file": file,
	}).Error("")

	err = getFirstError(err)
	log.Error(err)

	return err
}

func ReturnNewError(devlog *log.Logger, err string) error {
	return ReturnErrorEx(devlog, 2, errors.New(err))
}

func getFirstError(err error) error {
	errInside := errors.Unwrap(err)
	if errInside == nil {
		return err
	} else {
		return getFirstError(errInside)
	}
}
