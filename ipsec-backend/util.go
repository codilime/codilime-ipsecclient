package main

import (
	"errors"
	"fmt"
	"os"
	"runtime"
	"strings"

	log "github.com/sirupsen/logrus"
)

type ErrorFormatter struct{}

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

//Fatal logs error and fails
func Fatal(errs ...error) {
	returnErrorEx(2, errs...) // ignore the return value
	fmt.Println("FATAL EXIT")
	os.Exit(1)
}

//Error logs errors in a unified way using logrus
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

//ReturnError logs error, but returns it, allowing returning of errors to be chained in a "stack trace"
func ReturnError(errs ...error) error {
	return returnErrorEx(2, errs...)
}

func returnErrorEx(caller int, errs ...error) error {
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
	log.WithFields(log.Fields{
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

func ReturnNewError(err string) error {
	return returnErrorEx(2, errors.New(err))
}
