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
	m := Masterpass{}
	if err := a.DB.First(&m).Error; err != nil {
		if strings.Contains(err.Error(), "record not found") {
			masterpass := randString(32)
			keySha := sha256.Sum256([]byte(key))
			encryptedMasterpass, err := encrypt(keySha[:], []byte(masterpass))
			if err != nil {
				return err
			}
			encryptedBasedMasterpass := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedMasterpass)))
			base64.RawStdEncoding.Encode(encryptedBasedMasterpass, encryptedMasterpass)
			m.Masterpass = string(encryptedBasedMasterpass)
			return a.DB.Create(&m).Error
		}
		return err
	}
	return nil
}

func (a *App) getMasterpass(key string) (string, error) {
	m := Masterpass{}
	if err := a.DB.First(&m).Error; err != nil {
		return "", err
	}
	encryptedMasterpass, err := base64.RawStdEncoding.DecodeString(string(m.Masterpass))
	if err != nil {
		return "", err
	}
	keySha := sha256.Sum256([]byte(key))
	b, err := decrypt(keySha[:], encryptedMasterpass)
	return string(b), err
}

func (a *App) setSetting(pass, name, value string) error {
	s := Setting{}
	s.Name = name
	masterpass, err := a.getMasterpass(pass)
	if err != nil {
		return err
	}
	encryptedValue, err := encrypt([]byte(masterpass), []byte(value))
	if err != nil {
		return err
	}
	encryptedBasedValue := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedValue)))
	base64.RawStdEncoding.Encode(encryptedBasedValue, encryptedValue)
	s.Value = string(encryptedBasedValue)
	if err := s.getSetting(a.DB); err != nil {
		if !strings.Contains(err.Error(), "record not found") {
			return err
		}
		return s.createSetting(a.DB)
	}
	return a.DB.Where("name = ?", name).Update("value", s.Value).Error
}

func (a *App) getSetting(pass, name string) (string, error) {
	s := Setting{}
	masterpass, err := a.getMasterpass(pass)
	if err != nil {
		return "", err
	}
	if err := a.DB.Where("name = ?", name).First(&s).Error; err != nil {
		return "", err
	}
	encryptedValue, err := base64.RawStdEncoding.DecodeString(string(s.Value))
	if err != nil {
		return "", err
	}
	b, err := decrypt([]byte(masterpass), encryptedValue)
	return string(b), err
}

func (a *App) encryptPSK(key string, v *Vrf) error {
	masterPass, err := a.getSetting(key, "masterpass")
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
		encPSK, err := encrypt([]byte(masterPass), []byte(e.Authentication.PSK))
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
	masterPass, err := a.getSetting(key, "masterpass")
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
		decPSK, err := decrypt([]byte(masterPass), decBytes)
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
