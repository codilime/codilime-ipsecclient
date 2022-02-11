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
)

func encrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, logger.ReturnError(err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, logger.ReturnError(err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, logger.ReturnError(err)
	}
	ciphertext := gcm.Seal(nonce, nonce, data, nil)

	ciphertextBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(ciphertext)))

	base64.RawStdEncoding.Encode(ciphertextBytes, ciphertext)

	return ciphertext, nil
}

func decrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, logger.ReturnError(err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, logger.ReturnError(err)
	}

	nonce, ciphertext := data[:gcm.NonceSize()], data[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, logger.ReturnError(err)
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
	contains, err := db.containsMasterpass()
	if err != nil {
		return logger.ReturnError(err)
	}
	if !contains {
		m := Masterpass{}
		keySha := sha256.Sum256([]byte(key))
		encryptedMasterpass, err := encrypt(keySha[:], []byte(masterpass))
		if err != nil {
			return logger.ReturnError(err)
		}
		encryptedBasedMasterpass := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedMasterpass)))
		base64.RawStdEncoding.Encode(encryptedBasedMasterpass, encryptedMasterpass)
		m.Masterpass = string(encryptedBasedMasterpass)
		return db.Create(&m)
	}
	return nil
}

func (db *DB) GetMasterpass(key string) (string, error) {
	m, err := db.getMasterpass()
	if err != nil {
		return "", logger.ReturnError(err)
	}
	encryptedMasterpass, err := base64.RawStdEncoding.DecodeString(string(m.Masterpass))
	if err != nil {
		return "", logger.ReturnError(err)
	}
	keySha := sha256.Sum256([]byte(key))
	b, err := decrypt(keySha[:], encryptedMasterpass)
	return string(b), err
}

func (db *DB) SetSetting(pass, name, value string) error {
	s := Setting{}
	s.Name = name
	if err := db.EnsureMasterPass(pass, RandString(32)); err != nil {
		return logger.ReturnError(err)
	}
	masterpass, err := db.GetMasterpass(pass)
	if err != nil {
		return logger.ReturnError(err)
	}
	encryptedValue, err := encrypt([]byte(masterpass), []byte(value))
	if err != nil {
		return logger.ReturnError(err)
	}
	encryptedBasedValue := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedValue)))
	base64.RawStdEncoding.Encode(encryptedBasedValue, encryptedValue)
	contains, err := db.containsSetting(&s)
	s.Value = string(encryptedBasedValue)
	if err != nil {
		return logger.ReturnError(err)
	}
	if !contains {
		return logger.ReturnError(db.Create(&s))
	}
	return logger.ReturnError(db.UpdateSetting(&s))
}

func (db *DB) GetSetting(pass, name string) (string, error) {
	s := Setting{}
	s.Name = name
	masterpass, err := db.GetMasterpass(pass)
	if err != nil {
		return "", err
	}
	if err := db.getSetting(&s); err != nil {
		return "", logger.ReturnError(err)
	}
	encryptedValue, err := base64.RawStdEncoding.DecodeString(string(s.Value))
	if err != nil {
		return "", logger.ReturnError(err)
	}
	b, err := decrypt([]byte(masterpass), encryptedValue)
	return string(b), err
}

func (db *DB) EncryptPSK(key string, v *Vrf) error {
	masterpass, err := db.GetMasterpass(key)
	if err != nil {
		return logger.ReturnError(err)
	}
	for i, e := range v.Endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}
		encPSK, err := encrypt([]byte(masterpass), []byte(e.Authentication.PSK))
		if err != nil {
			return logger.ReturnError(err)
		}
		encBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(encPSK)))
		base64.RawStdEncoding.Encode(encBytes, encPSK)
		v.Endpoints[i].Authentication.PSK = string(encBytes)
	}
	return nil
}

func (db *DB) DecryptPSK(key string, v *Vrf) error {
	masterpass, err := db.GetMasterpass(key)
	if err != nil {
		return logger.ReturnError(err)
	}
	for i, e := range v.Endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}
		decBytes, err := base64.RawStdEncoding.DecodeString(e.Authentication.PSK)
		if err != nil {
			return logger.ReturnError(err)
		}
		decPSK, err := decrypt([]byte(masterpass), decBytes)
		if err != nil {
			return logger.ReturnError(err)
		}
		v.Endpoints[i].Authentication.PSK = string(decPSK)
	}
	return nil
}

func (db *DB) ChangePassword(oldPass, newPass string) error {
	masterpass, err := db.GetMasterpass(oldPass)
	if err != nil {
		return logger.ReturnError(err)
	}
	return logger.ReturnError(
		db.DeleteMasterpass(),
		db.EnsureMasterPass(newPass, masterpass),
	)
}
