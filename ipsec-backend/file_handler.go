package main

import (
	"io/ioutil"
	"os"
)

//go:generate mockgen -source=file_handler.go -destination=mock/file_handler_mock.go -package mock
type FileHandlerInterface interface {
	WriteFile(name string, data []byte, perm os.FileMode) error
	RemoveAll(path string) error
	Remove(name string) error
}

type FileHandler struct {
}

func (f *FileHandler) WriteFile(name string, data []byte, perm os.FileMode) error {
	return ioutil.WriteFile(name, data, perm)
}

func (f *FileHandler) RemoveAll(path string) error {
	return os.RemoveAll(path)
}

func (f *FileHandler) Remove(name string) error {
	return os.Remove(name)
}
