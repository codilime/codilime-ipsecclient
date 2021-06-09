package main

func getHardwareEncryptionAlgorithms() []string {
	return []string {
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

func getHardwareIntegrityAlgorithms() []string {
	return []string {
		"",
		"md5",
        "sha1",
        "sha256",
        "sha384",
        "sha512",
	}
}

func getHardwareKeyExchangeAlgorithms() []string {
	return []string {
		"",
		"modp_768",
		"modp_2048",
		"modp_3072",
		"modp_4096",
		"ecp_256",
		"modp_1024",
		"ecp_384",
		"ecp_521",
		"modp_2048",
		"modp_1536",
	}
}
