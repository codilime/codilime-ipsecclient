package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/sirupsen/logrus"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type JSON = map[string]interface{}

type ErrorFormatter struct{}

func FieldToString(key string, value interface{}) string {
	switch key {
	case "err":
		return fmt.Sprintf("\x1b[31m%s\x1b[0m\n", value)
	case "line":
		return fmt.Sprintf("\x1b[33;1m:%d\x1b[0m\n", value)
	case "file":
		fullpath := value.(string)
		folders := strings.Split(fullpath, "/")
		parentpath := strings.Join(folders[:len(folders)-1], "/")
		return parentpath + fmt.Sprintf("\x1b[32;1m/%s\x1b[0m", folders[len(folders)-1])
	case "func":
		fullpath := value.(string)
		folders := strings.Split(fullpath, "/")
		parentpath := strings.Join(folders[:len(folders)-1], "/")
		return parentpath + fmt.Sprintf("\x1b[36;1m/%s\x1b[0m\n", folders[len(folders)-1])
	}
	return "unknown field"
}

func (f *ErrorFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	if entry.Level == logrus.InfoLevel {
		if len(entry.Data) != 0 {
			fmt.Println("ENTRY HAS DATA")
		}
		return []byte(fmt.Sprintf("\x1b[0;94m%s\x1b[0m\n", ("INFO: " + entry.Message))), nil
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

type HTTPWrapper struct {
	Handler func(req *http.Request) (interface{}, http.Header, int)
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
	}).Error()
	if len(errs) == 1 {
		return errs[0]
	}
	return errors.New(errStr)
}

func ReturnNewError(err string) error {
	return returnErrorEx(2, errors.New(err))
}

//PrintfColored prints str with color col
func PrintfColored(col color.Attribute, str string) {
	_, err := color.New(col).Printf(str)
	if err != nil {
		Error(err)
	}
}

func (wrapper HTTPWrapper) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	obj, header, code := wrapper.Handler(r)
	elapsed := time.Since(start)

	err, ok := obj.(error)
	if ok {
		http.Error(w, "{\"status\":\"error\", \"error\":\""+err.Error()+"\"}", code)
		PrintfColored(color.BgMagenta, "HANDLER ERROR")
		PrintfColored(color.FgMagenta, " "+r.RequestURI+" ("+elapsed.String()+")\n")
		return
	}
	marshalled, err := json.Marshal(obj)
	if err != nil {
		http.Error(w, "{\"status\":\"error\", \"error\":\""+err.Error()+"\"}", code)
		PrintfColored(color.BgMagenta, "MARSHALL ERROR")
		PrintfColored(color.FgMagenta, " "+r.RequestURI+" ("+elapsed.String()+")\n")
		return
	}
	if code >= 400 {
		http.Error(w, "{\"status\":\"error\", \"data\":"+string(marshalled)+"}", code)
		PrintfColored(color.BgRed, "CODE ERROR "+strconv.Itoa(code))
		PrintfColored(color.FgRed, " "+r.RequestURI+" ("+elapsed.String()+")\n")
		return
	}
	if code == 307 {
		PrintfColored(color.BgYellow, "REDIRECT")
		PrintfColored(color.FgYellow, " "+r.RequestURI+" ("+elapsed.String()+")\n")
		http.Redirect(w, r, string(marshalled), http.StatusTemporaryRedirect)
		return
	}
	PrintfColored(color.BgGreen, "OK")
	PrintfColored(color.FgGreen, " "+r.RequestURI+" ("+elapsed.String()+")\n")
	w.WriteHeader(code)
	for key, value := range header {
		w.Header().Set(key, value[0])
	}
	_, err = w.Write(marshalled)
	if err != nil {
		Error(err)
		http.Error(w, "{\"status\":\"error\", \"error\":\""+err.Error()+"\"}", 500)
	}
}

func TestHandler(req *http.Request) (interface{}, http.Header, int) {
	return JSON{"status": "ok"}, http.Header{}, 200
}

func testFun2() error {
	return ReturnNewError("test error")
}

func testFun() error {
	return ReturnError(testFun2())
}

func Test2Handler(req *http.Request) (interface{}, http.Header, int) {
	return ReturnError(testFun()), http.Header{}, 500
}

func main() {

	logrus.SetFormatter(&ErrorFormatter{})
	r := mux.NewRouter()
	// r.NotFoundHandler = nil

	r.Handle("/api/test", HTTPWrapper{Handler: TestHandler})
	r.Handle("/api/test2", HTTPWrapper{Handler: Test2Handler})

	handler := cors.Default().Handler(r)

	s := http.Server{
		Addr:           "localhost:8000",
		Handler:        handler,
		ReadTimeout:    30 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	err := s.ListenAndServe()
	if err != nil {
		Error(err)
	}
}
