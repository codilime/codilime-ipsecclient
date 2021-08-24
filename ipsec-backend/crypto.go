package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"math/rand"
	"os"
)

const masterPassPath = "/iox_data/sico_pass"

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

func ensureMasterPassFile(key string) error {
	if _, err := os.Stat(masterPassPath); err == nil {
		return nil // file exists
	}
	masterPass := randString(64)
	encryptedMasterPass, err := encrypt([]byte(key), []byte(masterPass))
	if err != nil {
		return err
	}
	encryptedBasedMasterPass := []byte{}
	base64.RawStdEncoding.Encode(encryptedBasedMasterPass, encryptedMasterPass)
	return ioutil.WriteFile(masterPassPath, encryptedBasedMasterPass, 0644)
}

func decryptMasterPass(key string) ([]byte, error) {
	if err := ensureMasterPassFile(key); err != nil {
		return nil, err
	}
	encryptedBasedMasterPass, err := ioutil.ReadFile(masterPassPath)
	if err != nil {
		return nil, err
	}
	encryptedMasterPass, err := base64.RawStdEncoding.DecodeString(string(encryptedBasedMasterPass))
	if err != nil {
		return nil, err
	}
	return decrypt([]byte(key), encryptedMasterPass)
}

func encryptPSK(key string, v *Vrf) error {
	masterPass, err := decryptMasterPass(key)
	if err != nil {
		return err
	}
	endpoints := []endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return err
	}
	for _, e := range endpoints {
		encPSK, err := encrypt(masterPass, []byte(e.PSK))
		if err != nil {
			return err
		}
		e.PSK = string(encPSK)
	}
	endpointsJSON, err := json.Marshal(&endpoints)
	if err != nil {
		return err
	}
	v.Endpoints = endpointsJSON
	return nil
}

func decryptPSK(key string, v *Vrf) error {
	masterPass, err := decryptMasterPass(key)
	if err != nil {
		return err
	}
	endpoints := []endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return err
	}
	for _, e := range endpoints {
		decPSK, err := decrypt(masterPass, []byte(e.PSK))
		if err != nil {
			return err
		}
		e.PSK = string(decPSK)
	}
	endpointsJSON, err := json.Marshal(&endpoints)
	if err != nil {
		return err
	}
	v.Endpoints = endpointsJSON
	return nil
}
