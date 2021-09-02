package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"math/rand"
	"strings"
)

func encrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, err
	}

	ciphertext := gcm.Seal(nonce, nonce, data, nil)

	return ciphertext, nil
}

func decrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, err
	}

	nonce, ciphertext := data[:gcm.NonceSize()], data[gcm.NonceSize():]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func randString(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func (a *App) ensureMasterPass(key string) error {
	m := Masterpass{ID: 1}
	err := m.getMasterpass(a.DB)

	if err == nil {
		return nil // the masterpass is in db
	}
	if !strings.Contains(err.Error(), "record not found") {
		return err // this is a different error than not found
	}
	// not found, encrypt the masterpass to db
	keySha := sha256.Sum256([]byte(key))
	masterPass := randString(32)
	encryptedMasterPass, err := encrypt(keySha[:], []byte(masterPass))
	if err != nil {
		return err
	}
	encryptedBasedMasterPass := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedMasterPass)))
	base64.RawStdEncoding.Encode(encryptedBasedMasterPass, encryptedMasterPass)
	m.Masterpass = string(encryptedBasedMasterPass)
	return m.createMasterpass(a.DB)
}

func (a *App) decryptMasterPass(key string) ([]byte, error) {
	if err := a.ensureMasterPass(key); err != nil {
		return nil, err
	}
	m := Masterpass{ID: 1}
	err := m.getMasterpass(a.DB)
	if err != nil {
		return nil, err
	}
	encryptedBasedMasterPass := m.Masterpass
	encryptedMasterPass, err := base64.RawStdEncoding.DecodeString(string(encryptedBasedMasterPass))
	if err != nil {
		return nil, err
	}
	keySha := sha256.Sum256([]byte(key))
	return decrypt(keySha[:], encryptedMasterPass)
}

func (a *App) encryptPSK(key string, v *Vrf) error {
	masterPass, err := a.decryptMasterPass(key)
	if err != nil {
		return err
	}
	endpoints := []Endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return err
	}
	for i, e := range endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}
		encPSK, err := encrypt(masterPass, []byte(e.Authentication.PSK))
		if err != nil {
			return err
		}
		encBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(encPSK)))
		base64.RawStdEncoding.Encode(encBytes, encPSK)
		endpoints[i].Authentication.PSK = string(encBytes)
	}
	endpointsJSON, err := json.Marshal(&endpoints)
	if err != nil {
		return err
	}
	v.Endpoints = endpointsJSON
	return nil
}

func (a *App) decryptPSK(key string, v *Vrf) error {
	masterPass, err := a.decryptMasterPass(key)
	if err != nil {
		return err
	}
	endpoints := []Endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return err
	}
	for i, e := range endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}
		decBytes, err := base64.RawStdEncoding.DecodeString(e.Authentication.PSK)
		if err != nil {
			return err
		}
		decPSK, err := decrypt(masterPass, decBytes)
		if err != nil {
			return err
		}
		endpoints[i].Authentication.PSK = string(decPSK)
	}
	endpointsJSON, err := json.Marshal(&endpoints)
	if err != nil {
		return err
	}
	v.Endpoints = endpointsJSON
	return nil
}
