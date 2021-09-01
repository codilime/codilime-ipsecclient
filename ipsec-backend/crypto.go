package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
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
	keySha := sha256.Sum256([]byte(key))
	masterPass := randString(32)
	encryptedMasterPass, err := encrypt(keySha[:], []byte(masterPass))
	if err != nil {
		return err
	}
	encryptedBasedMasterPass := make([]byte, base64.RawStdEncoding.EncodedLen(len(encryptedMasterPass)))
	base64.RawStdEncoding.Encode(encryptedBasedMasterPass, encryptedMasterPass)
	return ioutil.WriteFile(masterPassPath, encryptedBasedMasterPass, 0644)
}

func decryptMasterPass(key string) ([]byte, error) {
	if err := ensureMasterPassFile(key); err != nil {
		return nil, err
	}
	keySha := sha256.Sum256([]byte(key))
	encryptedBasedMasterPass, err := ioutil.ReadFile(masterPassPath)
	if err != nil {
		return nil, err
	}
	encryptedMasterPass, err := base64.RawStdEncoding.DecodeString(string(encryptedBasedMasterPass))
	if err != nil {
		return nil, err
	}
	return decrypt(keySha[:], encryptedMasterPass)
}

func encryptPSK(key string, v *Vrf) error {
	masterPass, err := decryptMasterPass(key)
	if err != nil {
		return err
	}
	endpoints := []Endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return err
	}
	for i, e := range endpoints {
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

func decryptPSK(key string, v *Vrf) error {
	masterPass, err := decryptMasterPass(key)
	if err != nil {
		return err
	}
	endpoints := []Endpoint{}
	if err := json.Unmarshal(v.Endpoints, &endpoints); err != nil {
		return err
	}
	for i, e := range endpoints {
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