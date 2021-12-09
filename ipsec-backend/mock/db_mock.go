// Code generated by MockGen. DO NOT EDIT.
// Source: db.go

// Package mock is a generated GoMock package.
package mock

import (
	db "ipsec_backend/db"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockDBinterface is a mock of DBinterface interface.
type MockDBinterface struct {
	ctrl     *gomock.Controller
	recorder *MockDBinterfaceMockRecorder
}

// MockDBinterfaceMockRecorder is the mock recorder for MockDBinterface.
type MockDBinterfaceMockRecorder struct {
	mock *MockDBinterface
}

// NewMockDBinterface creates a new mock instance.
func NewMockDBinterface(ctrl *gomock.Controller) *MockDBinterface {
	mock := &MockDBinterface{ctrl: ctrl}
	mock.recorder = &MockDBinterfaceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockDBinterface) EXPECT() *MockDBinterfaceMockRecorder {
	return m.recorder
}

// ChangePassword mocks base method.
func (m *MockDBinterface) ChangePassword(oldPass, newPass string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ChangePassword", oldPass, newPass)
	ret0, _ := ret[0].(error)
	return ret0
}

// ChangePassword indicates an expected call of ChangePassword.
func (mr *MockDBinterfaceMockRecorder) ChangePassword(oldPass, newPass interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ChangePassword", reflect.TypeOf((*MockDBinterface)(nil).ChangePassword), oldPass, newPass)
}

// Create mocks base method.
func (m *MockDBinterface) Create(value interface{}) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", value)
	ret0, _ := ret[0].(error)
	return ret0
}

// Create indicates an expected call of Create.
func (mr *MockDBinterfaceMockRecorder) Create(value interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockDBinterface)(nil).Create), value)
}

// DecryptPSK mocks base method.
func (m *MockDBinterface) DecryptPSK(key string, v *db.Vrf) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DecryptPSK", key, v)
	ret0, _ := ret[0].(error)
	return ret0
}

// DecryptPSK indicates an expected call of DecryptPSK.
func (mr *MockDBinterfaceMockRecorder) DecryptPSK(key, v interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DecryptPSK", reflect.TypeOf((*MockDBinterface)(nil).DecryptPSK), key, v)
}

// DeleteCAs mocks base method.
func (m *MockDBinterface) DeleteCAs() error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DeleteCAs")
	ret0, _ := ret[0].(error)
	return ret0
}

// DeleteCAs indicates an expected call of DeleteCAs.
func (mr *MockDBinterfaceMockRecorder) DeleteCAs() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DeleteCAs", reflect.TypeOf((*MockDBinterface)(nil).DeleteCAs))
}

// DeleteVrf mocks base method.
func (m *MockDBinterface) DeleteVrf(v *db.Vrf) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DeleteVrf", v)
	ret0, _ := ret[0].(error)
	return ret0
}

// DeleteVrf indicates an expected call of DeleteVrf.
func (mr *MockDBinterfaceMockRecorder) DeleteVrf(v interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DeleteVrf", reflect.TypeOf((*MockDBinterface)(nil).DeleteVrf), v)
}

// EncryptPSK mocks base method.
func (m *MockDBinterface) EncryptPSK(key string, v *db.Vrf) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "EncryptPSK", key, v)
	ret0, _ := ret[0].(error)
	return ret0
}

// EncryptPSK indicates an expected call of EncryptPSK.
func (mr *MockDBinterfaceMockRecorder) EncryptPSK(key, v interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "EncryptPSK", reflect.TypeOf((*MockDBinterface)(nil).EncryptPSK), key, v)
}

// GetCAs mocks base method.
func (m *MockDBinterface) GetCAs() ([]db.CertificateAuthority, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetCAs")
	ret0, _ := ret[0].([]db.CertificateAuthority)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetCAs indicates an expected call of GetCAs.
func (mr *MockDBinterfaceMockRecorder) GetCAs() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetCAs", reflect.TypeOf((*MockDBinterface)(nil).GetCAs))
}

// GetSetting mocks base method.
func (m *MockDBinterface) GetSetting(pass, name string) (string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetSetting", pass, name)
	ret0, _ := ret[0].(string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetSetting indicates an expected call of GetSetting.
func (mr *MockDBinterfaceMockRecorder) GetSetting(pass, name interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetSetting", reflect.TypeOf((*MockDBinterface)(nil).GetSetting), pass, name)
}

// GetStoredErrors mocks base method.
func (m *MockDBinterface) GetStoredErrors() ([]db.StoredError, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetStoredErrors")
	ret0, _ := ret[0].([]db.StoredError)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetStoredErrors indicates an expected call of GetStoredErrors.
func (mr *MockDBinterfaceMockRecorder) GetStoredErrors() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetStoredErrors", reflect.TypeOf((*MockDBinterface)(nil).GetStoredErrors))
}

// GetVrf mocks base method.
func (m *MockDBinterface) GetVrf(v *db.Vrf) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetVrf", v)
	ret0, _ := ret[0].(error)
	return ret0
}

// GetVrf indicates an expected call of GetVrf.
func (mr *MockDBinterfaceMockRecorder) GetVrf(v interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetVrf", reflect.TypeOf((*MockDBinterface)(nil).GetVrf), v)
}

// GetVrfs mocks base method.
func (m *MockDBinterface) GetVrfs() ([]db.Vrf, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetVrfs")
	ret0, _ := ret[0].([]db.Vrf)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetVrfs indicates an expected call of GetVrfs.
func (mr *MockDBinterfaceMockRecorder) GetVrfs() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetVrfs", reflect.TypeOf((*MockDBinterface)(nil).GetVrfs))
}

// RotateErrorsBySizeOrDate mocks base method.
func (m *MockDBinterface) RotateErrorsBySizeOrDate() {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "RotateErrorsBySizeOrDate")
}

// RotateErrorsBySizeOrDate indicates an expected call of RotateErrorsBySizeOrDate.
func (mr *MockDBinterfaceMockRecorder) RotateErrorsBySizeOrDate() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RotateErrorsBySizeOrDate", reflect.TypeOf((*MockDBinterface)(nil).RotateErrorsBySizeOrDate))
}

// SetSetting mocks base method.
func (m *MockDBinterface) SetSetting(pass, name, value string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "SetSetting", pass, name, value)
	ret0, _ := ret[0].(error)
	return ret0
}

// SetSetting indicates an expected call of SetSetting.
func (mr *MockDBinterfaceMockRecorder) SetSetting(pass, name, value interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "SetSetting", reflect.TypeOf((*MockDBinterface)(nil).SetSetting), pass, name, value)
}

// UpdateVrf mocks base method.
func (m *MockDBinterface) UpdateVrf(v *db.Vrf) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "UpdateVrf", v)
	ret0, _ := ret[0].(error)
	return ret0
}

// UpdateVrf indicates an expected call of UpdateVrf.
func (mr *MockDBinterfaceMockRecorder) UpdateVrf(v interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdateVrf", reflect.TypeOf((*MockDBinterface)(nil).UpdateVrf), v)
}
