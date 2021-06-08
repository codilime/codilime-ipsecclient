package main

func getSoftwareEncryptionAlgorithms() []string {
	return []string {
		"",
		"des",
		"3des",
		"aes",
		"aes128",
		"aes192",
		"aes256",
		"aes128ctr",
		"aes192ctr",
		"aes256ctr",
		"aes128ccm8",
		"aes128ccm64",
		"aes128ccm12",
		"aes128ccm96",
		"aes128ccm16",
		"aes128ccm128",
		"aes128ccm",
		"aes192ccm8",
		"aes192ccm64",
		"aes192ccm12",
		"aes192ccm96",
		"aes192ccm16",
		"aes192ccm128",
		"aes192ccm",
		"aes256ccm8",
		"aes256ccm64",
		"aes256ccm12",
		"aes256ccm96",
		"aes256ccm16",
		"aes256ccm128",
		"aes256ccm",
		"aes128gcm8",
		"aes128gcm64",
		"aes128gcm12",
		"aes128gcm96",
		"aes128gcm16",
		"aes128gcm128",
		"aes128gcm",
		"aes192gcm8",
		"aes192gcm64",
		"aes192gcm12",
		"aes192gcm96",
		"aes192gcm16",
		"aes192gcm128",
		"aes192gcm",
		"aes256gcm8",
		"aes256gcm64",
		"aes256gcm12",
		"aes256gcm96",
		"aes256gcm16",
		"aes256gcm128",
		"aes256gcm",
		"aes128gmac",
		"aes192gmac",
		"aes256gmac",
		"chacha20poly1305",
		"chacha20poly1305compat",
		"blowfish",
		"blowfish128",
		"blowfish192",
		"blowfish256",
		"camellia",
		"camellia128",
		"camellia192",
		"camellia256",
		"camellia128ctr",
		"camellia192ctr",
		"camellia256ctr",
		"camellia128ccm8",
		"camellia128ccm64",
		"camellia128ccm12",
		"camellia128ccm96",
		"camellia128ccm16",
		"camellia128ccm128",
		"camellia192ccm8",
		"camellia192ccm64",
		"camellia192ccm12",
		"camellia192ccm96",
		"camellia192ccm16",
		"camellia192ccm128",
		"camellia256ccm8",
		"camellia256ccm64",
		"camellia256ccm12",
		"camellia256ccm96",
		"camellia256ccm16",
		"camellia256ccm128",
		"cast128",
		"serpent",
		"serpent128",
		"serpent192",
		"serpent256",
		"twofish",
		"twofish128",
		"twofish192",
		"twofish256",
	}
}

func getSoftwareIntegrityAlgorithms() []string {
	return []string {
		"",
		"sha",
		"sha1",
		"sha1_160",
		"sha256",
		"sha2_256",
		"sha256_96",
		"sha2_256_96",
		"sha384",
		"sha2_384",
		"sha512",
		"sha2_512",
		"md5",
		"md5_128",
		"aesxcbc",
		"camelliaxcbc",
		"aescmac",
	}
}

func getSoftwareKeyExchangeAlgorithms() []string {
	return []string {
		"",
		"modpnone",
		"modpnull",
		"modp768",
		"modp1024",
		"modp1536",
		"modp2048",
		"modp3072",
		"modp4096",
		"modp6144",
		"modp8192",
		"ecp192",
		"ecp224",
		"ecp256",
		"ecp384",
		"ecp521",
		"modp1024s160",
		"modp2048s224",
		"modp2048s256",
		"ecp224bp",
		"ecp256bp",
		"ecp384bp",
		"ecp512bp",
		"curve25519",
		"x25519",
		"curve448",
		"x448",
		"kyber1",
		"kyber3",
		"kyber5",
		"ntrup1",
		"ntrup3",
		"ntrup5",
		"ntrur3",
		"saber1",
		"saber3",
		"saber5",
		"bike1",
		"bike3",
		"bike5",
		"frodoa1",
		"frodoa3",
		"frodoa5",
		"frodos1",
		"frodos3",
		"frodos5",
		"hqc1",
		"hqc3",
		"hqc5",
		"sike1",
		"sike2",
		"sike3",
		"sike5",
	}
}
