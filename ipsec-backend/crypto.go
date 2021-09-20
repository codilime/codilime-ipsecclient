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
		return nil, ReturnError(err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, ReturnError(err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = rand.Read(nonce); err != nil {
		return nil, ReturnError(err)
	}

	ciphertext := gcm.Seal(nonce, nonce, data, nil)

	return ciphertext, nil
}

func decrypt(key, data []byte) ([]byte, error) {
	blockCipher, err := aes.NewCipher(key)
	if err != nil {
		return nil, ReturnError(err)
	}

	gcm, err := cipher.NewGCM(blockCipher)
	if err != nil {
		return nil, ReturnError(err)
	}

	nonce, ciphertext := data[:gcm.NonceSize()], data[gcm.NonceSize():]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, ReturnError(err)
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
	_, err := a.getSetting(key, "masterpass")
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			masterPass := randString(32)
			return ReturnError(a.setSetting(key, "masterpass", masterPass))
		}
	}
	return nil
}

func (a *App) setSetting(pass, name, value string) error {
	s := Setting{}
	s.Name = name
	keySha := sha256.Sum256([]byte(pass))
	encryptedValue, err := encrypt(keySha[:], []byte(value))
	if err != nil {
		return ReturnError(err)
	}
	encryptedBasedValue := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedValue)))
	base64.RawStdEncoding.Encode(encryptedBasedValue, encryptedValue)
	s.Value = string(encryptedBasedValue)
	if err := s.getSetting(a.DB); err != nil {
		if !strings.Contains(err.Error(), "record not found") {
			return ReturnError(err)
		}
		return ReturnError(s.createSetting(a.DB))
	}
	return ReturnError(a.DB.Where("name = ?", name).Update("value", s.Value).Error)
}

func (a *App) getSetting(pass, name string) (string, error) {
	s := Setting{}
	if err := a.DB.Where("name = ?", name).First(&s).Error; err != nil {
		return "", ReturnError(err)
	}
	encryptedValue, err := base64.RawStdEncoding.DecodeString(string(s.Value))
	if err != nil {
		return "", ReturnError(err)
	}
	keySha := sha256.Sum256([]byte(pass))
	b, err := decrypt(keySha[:], encryptedValue)
	return string(b), ReturnError(err)
}

func (a *App) encryptPSK(key string, v *Vrf) error {
	if err := a.ensureMasterPass(key); err != nil {
		return ReturnError(err)
	}
	masterPass, err := a.getSetting(key, "masterpass")
	if err != nil {
		return ReturnError(err)
	}
	endpoints := []Endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return ReturnError(err)
	}
	for i, e := range endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}
		encPSK, err := encrypt([]byte(masterPass), []byte(e.Authentication.PSK))
		if err != nil {
			return ReturnError(err)
		}
		encBytes := make([]byte, base64.RawStdEncoding.EncodedLen(len(encPSK)))
		base64.RawStdEncoding.Encode(encBytes, encPSK)
		endpoints[i].Authentication.PSK = string(encBytes)
	}
	endpointsJSON, err := json.Marshal(&endpoints)
	if err != nil {
		return ReturnError(err)
	}
	v.Endpoints = endpointsJSON
	return nil
}

func (a *App) decryptPSK(key string, v *Vrf) error {
	if err := a.ensureMasterPass(key); err != nil {
		return ReturnError(err)
	}
	masterPass, err := a.getSetting(key, "masterpass")
	if err != nil {
		return ReturnError(err)
	}
	endpoints := []Endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return ReturnError(err)
	}
	for i, e := range endpoints {
		if e.Authentication.Type != "psk" {
			continue
		}
		decBytes, err := base64.RawStdEncoding.DecodeString(e.Authentication.PSK)
		if err != nil {
			return ReturnError(err)
		}
		decPSK, err := decrypt([]byte(masterPass), decBytes)
		if err != nil {
			return ReturnError(err)
		}
		endpoints[i].Authentication.PSK = string(decPSK)
	}
	endpointsJSON, err := json.Marshal(&endpoints)
	if err != nil {
		return ReturnError(err)
	}
	v.Endpoints = endpointsJSON
	return nil
}
