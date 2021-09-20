package main

import (
	"errors"
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/sirupsen/logrus"
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
		return parentpath + "/" + folders[len(folders)-1]
	case "func":
		fullpath := value.(string)
		folders := strings.Split(fullpath, "/")
		parentpath := strings.Join(folders[:len(folders)-1], "/")
		return parentpath + fmt.Sprintf("/%s\n", folders[len(folders)-1])
	}
	return "LOGGER ERROR LOL"
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
	ret = append(ret, []byte(entry.Message+"\n")...)
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
	logrus.WithFields(logrus.Fields{
		"err":  strings.Join(errStrs, ", "),
		"line": line,
		"func": f.Name(),
		"file": file,
	}).Error()
}

//ReturnError logs error, but returns it, allowing returning of errors to be chained in a "stack trace"
func ReturnError(errs ...error) error {
	return returnErrorEx(2, errs...)
}

func returnErrorEx(caller int, errs ...error) error {
	newErrs := make([]error, 0)
	for _, v := range errs {
		if v != nil {
			newErrs = append(newErrs, v)
		}
	}
	errs = newErrs
	if len(errs) == 0 {
		return nil
	}
	pc, file, line, _ := runtime.Caller(caller)
	f := runtime.FuncForPC(pc)
	errStrs := make([]string, 0)
	for _, err := range errs {
		errStrs = append(errStrs, err.Error())
	}
	errStr := strings.Join(errStrs, ", ")
	logrus.WithFields(logrus.Fields{
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
