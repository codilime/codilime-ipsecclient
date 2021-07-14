package main

func getHardwareEncryptionAlgorithmsPh1() []string {
	return []string{
		"",
		"en-3des",
		"aes-cbc-128",
		"aes-cbc-192",
		"aes-cbc-256",
		"aes-gcm-128",
		"aes-gcm-256",
		"des",
	}

}

func getHardwareEncryptionAlgorithmsPh2() []string {
	return []string{
		"",
		"esp-192-aes",
		"esp-256-aes",
		"esp-3des",
		"esp-aes",
		"esp-des",
		"esp-128-gcm",
		"esp-192-gcm",
		"esp-256-gcm",
		"esp-gmac",
		"esp-null",
		"esp-seal",
	}
}

func getHardwareIntegrityAlgorithmsPh1() []string {
	return []string{
		"md5",
		"sha1",
		"sha256",
		"sha384",
		"sha512",
	}
}

func getHardwareIntegrityAlgorithmsPh2() []string {
	return []string{
		"esp-null",
		"esp-sha-hmac",
		"esp-sha256-hmac",
		"esp-sha384-hmac",
		"esp-sha512-hmac",
	}
}

func getHardwareKeyExchangeAlgorithmsPh1() []string {
	return []string{
		"one",
		"fourteen",
		"fifteen",
		"sixteen",
		"nineteen",
		"two",
		"twenty",
		"twenty-one",
		"twenty-four",
		"five",
	}
}

func getHardwareKeyExchangeAlgorithmsPh2() []string {
	return []string{
		"group1",
		"group14",
		"group15",
		"group16",
		"group19",
		"group2",
		"group20",
		"group21",
		"group24",
		"group5",
	}
}
