/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package db

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"ipsec_backend/logger"
	"math/rand"

	"github.com/sirupsen/logrus"
)

func encrypt(key, data []byte, log *logrus.Logger) ([]byte, error) {
	log.Info("encrypt invoked")

	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, logger.ReturnError(log, err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, logger.ReturnError(log, err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, logger.ReturnError(log, err)
	}
	ciphertext := gcm.Seal(nonce, nonce, data, nil)

	ciphertextBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(ciphertext)))

	base64.RawStdEncoding.Encode(ciphertextBytes, ciphertext)

	return ciphertext, nil
}

func decrypt(key, data []byte, log *logrus.Logger) ([]byte, error) {
	log.Info("decrypt invoked")

	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, logger.ReturnError(log, err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, logger.ReturnError(log, err)
	}

	nonce, ciphertext := data[:gcm.NonceSize()], data[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, logger.ReturnError(log, err)
	}

	return plaintext, nil
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func RandString(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func (db *DB) EnsureMasterPass(key, masterpass string) error {
	db.log.Info("EnsureMasterPass invoked")

	contains, err := db.containsMasterpass()
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	if !contains {
		m := Masterpass{}
		keySha := sha256.Sum256([]byte(key))
		encryptedMasterpass, err := encrypt(keySha[:], []byte(masterpass), db.log)
		if err != nil {
			return logger.ReturnError(db.log, err)
		}
		encryptedBasedMasterpass := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedMasterpass)))
		base64.RawStdEncoding.Encode(encryptedBasedMasterpass, encryptedMasterpass)
		m.Masterpass = string(encryptedBasedMasterpass)
		return db.Create(&m)
	}

	return nil
}

func (db *DB) GetMasterpass(key string) (string, error) {
	db.log.Info("GetMasterpass invoked")

	m, err := db.getMasterpass()
	if err != nil {
		return "", logger.ReturnError(db.log, err)
	}

	encryptedMasterpass, err := base64.RawStdEncoding.DecodeString(string(m.Masterpass))
	if err != nil {
		return "", logger.ReturnError(db.log, err)
	}

	keySha := sha256.Sum256([]byte(key))
	b, err := decrypt(keySha[:], encryptedMasterpass, db.log)

	return string(b), err
}

func (db *DB) SetSetting(pass, name, value string) error {
	db.log.Info("SetSetting invoked")
	db.log.Debug(pass, name, value)

	s := Setting{}
	s.Name = name
	if err := db.EnsureMasterPass(pass, RandString(32)); err != nil {
		return logger.ReturnError(db.log, err)
	}

	masterpass, err := db.GetMasterpass(pass)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	encryptedValue, err := encrypt([]byte(masterpass), []byte(value), db.log)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	encryptedBasedValue := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedValue)))
	base64.RawStdEncoding.Encode(encryptedBasedValue, encryptedValue)
	contains, err := db.containsSetting(&s)
	s.Value = string(encryptedBasedValue)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}
	
	if !contains {
		return logger.ReturnError(db.log, db.Create(&s))
	}

	return logger.ReturnError(db.log, db.UpdateSetting(&s))
}

func (db *DB) GetSetting(pass, name string) (string, error) {
	db.log.Info("GetSetting invoked")
	db.log.Debug(pass, name)

	s := Setting{}
	s.Name = name
	masterpass, err := db.GetMasterpass(pass)
	if err != nil {
		return "", err
	}

	if err := db.getSetting(&s); err != nil {
		return "", logger.ReturnError(db.log, err)
	}

	encryptedValue, err := base64.RawStdEncoding.DecodeString(string(s.Value))
	if err != nil {
		return "", logger.ReturnError(db.log, err)
	}

	b, err := decrypt([]byte(masterpass), encryptedValue, db.log)

	return string(b), err
}

func (db *DB) EncryptPSK(key string, v *Vrf) error {
	db.log.Info("EncryptPSK invoked")
	db.log.Debug(key, v)

	masterpass, err := db.GetMasterpass(key)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	for i, e := range v.Endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}

		encPSK, err := encrypt([]byte(masterpass), []byte(e.Authentication.PSK), db.log)
		if err != nil {
			return logger.ReturnError(db.log, err)
		}

		encBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(encPSK)))
		base64.RawStdEncoding.Encode(encBytes, encPSK)
		v.Endpoints[i].Authentication.PSK = string(encBytes)
	}

	return nil
}

func (db *DB) DecryptPSK(key string, v *Vrf) error {
	db.log.Info("DecryptPSK invoked")
	db.log.Debug(key, v)

	masterpass, err := db.GetMasterpass(key)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	for i, e := range v.Endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}

		decBytes, err := base64.RawStdEncoding.DecodeString(e.Authentication.PSK)
		if err != nil {
			return logger.ReturnError(db.log, err)
		}

		decPSK, err := decrypt([]byte(masterpass), decBytes, db.log)
		if err != nil {
			return logger.ReturnError(db.log, err)
		}

		v.Endpoints[i].Authentication.PSK = string(decPSK)
	}

	return nil
}

func (db *DB) ChangePassword(oldPass, newPass string) error {
	db.log.Info("ChangePassword invoked")

	masterpass, err := db.GetMasterpass(oldPass)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	err = db.DeleteMasterpass()
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	err = db.EnsureMasterPass(newPass, masterpass)
	if err != nil {
		return logger.ReturnError(db.log, err)
	}

	return nil
}
