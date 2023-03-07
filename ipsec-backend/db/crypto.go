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
	"fmt"
	"math/rand"
)

func encrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("creating new cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, fmt.Errorf("creating new GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, fmt.Errorf("generating random bytes: %w", err)
	}
	ciphertext := gcm.Seal(nonce, nonce, data, nil)

	ciphertextBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(ciphertext)))

	base64.RawStdEncoding.Encode(ciphertextBytes, ciphertext)

	return ciphertext, nil
}

func decrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("creating new cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, fmt.Errorf("creating new GCM: %w", err)
	}

	nonce, ciphertext := data[:gcm.NonceSize()], data[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("opening gcm: %w", err)
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
		return fmt.Errorf("checking masterpass: %w", err)
	}

	if !contains {
		m := Masterpass{}
		keySha := sha256.Sum256([]byte(key))
		encryptedMasterpass, err := encrypt(keySha[:], []byte(masterpass))
		if err != nil {
			return fmt.Errorf("encrypting masterpass: %w", err)
		}
		encryptedBasedMasterpass := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedMasterpass)))
		base64.RawStdEncoding.Encode(encryptedBasedMasterpass, encryptedMasterpass)
		m.Masterpass = string(encryptedBasedMasterpass)
		err = db.Create(&m)
		if err != nil {
			return fmt.Errorf("creating masterpass: %w", err)
		}
	}

	return nil
}

func (db *DB) GetMasterpass(key string) (string, error) {
	m, err := db.getMasterpass()
	if err != nil {
		return "", fmt.Errorf("getting masterpass: %w", err)
	}

	encryptedMasterpass, err := base64.RawStdEncoding.DecodeString(string(m.Masterpass))
	if err != nil {
		return "", fmt.Errorf("decoding masterpass: %w", err)
	}

	keySha := sha256.Sum256([]byte(key))
	b, err := decrypt(keySha[:], encryptedMasterpass)

	return string(b), err
}

func (db *DB) SetSetting(pass, name, value string) error {
	s := Setting{}
	s.Name = name
	if err := db.EnsureMasterPass(pass, RandString(32)); err != nil {
		return fmt.Errorf("ensuring masterpass: %w", err)
	}

	masterpass, err := db.GetMasterpass(pass)
	if err != nil {
		return fmt.Errorf("getting masterpass: %w", err)
	}

	encryptedValue, err := encrypt([]byte(masterpass), []byte(value))
	if err != nil {
		return fmt.Errorf("encrypting masterpass: %w", err)
	}

	encryptedBasedValue := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedValue)))
	base64.RawStdEncoding.Encode(encryptedBasedValue, encryptedValue)
	contains, err := db.containsSetting(&s)
	s.Value = string(encryptedBasedValue)
	if err != nil {
		return fmt.Errorf("checking setting %s: %w", s.Name, err)
	}

	if !contains {
		err = db.Create(&s)
		if err != nil {
			return fmt.Errorf("creating setting %s: %w", s.Name, err)
		}
	}

	err = db.UpdateSetting(&s)
	if err != nil {
		return fmt.Errorf("updating setting %s: %w", s.Name, err)
	}
	return nil
}

func (db *DB) GetSetting(pass, name string) (string, error) {
	s := Setting{}
	s.Name = name
	masterpass, err := db.GetMasterpass(pass)
	if err != nil {
		return "", err
	}

	if err := db.getSetting(&s); err != nil {
		return "", fmt.Errorf("getting setting %s: %w", s.Name, err)
	}

	encryptedValue, err := base64.RawStdEncoding.DecodeString(string(s.Value))
	if err != nil {
		return "", fmt.Errorf("decoding string %s: %w", s.Name, err)
	}

	b, err := decrypt([]byte(masterpass), encryptedValue)

	return string(b), err
}

func (db *DB) EncryptPSK(key string, v *Vrf) error {
	masterpass, err := db.GetMasterpass(key)
	if err != nil {
		return fmt.Errorf("getting masterpass: %w", err)
	}

	for i, e := range v.Endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}

		encPSK, err := encrypt([]byte(masterpass), []byte(e.Authentication.PSK))
		if err != nil {
			return fmt.Errorf("encrypting masterpass: %w", err)
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
		return fmt.Errorf("getting masterpass: %w", err)
	}

	for i, e := range v.Endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}

		decBytes, err := base64.RawStdEncoding.DecodeString(e.Authentication.PSK)
		if err != nil {
			return fmt.Errorf("decoding string: %w", err)
		}

		decPSK, err := decrypt([]byte(masterpass), decBytes)
		if err != nil {
			return fmt.Errorf("decrypting masterpass: %w", err)
		}

		v.Endpoints[i].Authentication.PSK = string(decPSK)
	}

	return nil
}

func (db *DB) ChangePassword(oldPass, newPass string) error {
	masterpass, err := db.GetMasterpass(oldPass)
	if err != nil {
		return fmt.Errorf("getting masterpass: %w", err)
	}

	err = db.DeleteMasterpass()
	if err != nil {
		return fmt.Errorf("deleting masterpass: %w", err)
	}

	err = db.EnsureMasterPass(newPass, masterpass)
	if err != nil {
		return fmt.Errorf("ensuring masterpass: %w", err)
	}

	return nil
}
