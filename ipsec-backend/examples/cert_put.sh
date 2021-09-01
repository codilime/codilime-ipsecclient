curl -v -XPUT http://localhost/api/vrfs/1 -u "admin:cisco123" -d @- << EOF
{
   "id":1,
   "client_name":"test",
   "vlan":123,
   "crypto_ph1":[
      "aes128",
      "sha256",
      "modp2048"
   ],
   "crypto_ph2":[
      "aes128",
      "sha256",
      "modp2048"
   ],
   "physical_interface":"eth0",
   "active":true,
   "local_as":123,
   "lan_ip":"10.100.0.1/24",
   "endpoints":[
        {
        "remote_ip_sec":"10.5.0.101",
        "local_ip":"10.0.1.1",
        "peer_ip":"10.0.1.2",
        "authentication": {
                "type": "certs",
                "local_cert": "-----BEGIN CERTIFICATE-----\nMIIDFjCCAf6gAwIBAgIIGAF4idq1jLUwDQYJKoZIhvcNAQELBQAwOjELMAkGA1UE\nBhMCQ0gxEzARBgNVBAoTCnN0cm9uZ1N3YW4xFjAUBgNVBAMTDXN0cm9uZ1N3YW4g\nQ0EwHhcNMjEwODI1MTI0NjMxWhcNMzEwODIzMTI0NjMxWjA3MQswCQYDVQQGEwJD\nSDETMBEGA1UEChMKc3Ryb25nU3dhbjETMBEGA1UEAxMKcGVlci0xLXJlbTCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAO4YHIqS4ud2LGQl+uV8pdrPuIkA\nst6lA9NcApgWz0CPDD7XTsvsNldrLh6vH+X8TUHmnTyQ4Xa4cSsjeEFfaEDQrFFO\nnEZh4nEZbd+bh5KjfzIN4661o\/VLdsmuQA9UUfsAmY678q\/hNEaae0kkXVcyjpTr\nPyT0K2qH7mF1dfvj55o6B71rT5ncHF6bZlAxt0rBBxn\/oAwuZZBhZkJm5b7yHpv8\nhJv7RdbkAQPrC\/dOGMxye4MpZpd+RR0iCBIUVWPs9XmgRwvx4ZQZgc5n34hOdZ4R\ni8G9AoHO0rNGGJjz0NtWSSDtFfnqCvO70luhXKwqyGWLPRtlIQ0tFYZTWi0CAwEA\nAaMjMCEwHwYDVR0jBBgwFoAUfsr+ZvfNY8G04Qg+QT5gk3VvnxowDQYJKoZIhvcN\nAQELBQADggEBAE2Ofjpd74qAvU+IGpCMC9xkHX8roS++TsAt3m1ZAnHcuxAYdbQx\nqx79DqC3kSuxiDmN8tmPeEgvoZ1bP4ovsCnGHY0kMR8YTD8VfXgPRP\/80hBGIH\/+\nlhLEAm8hdFvRZl05\/0LMuve8yxPGYPvnw\/ujAVNM20WaSgxQV5sK3lDz\/DWOEUJ+\n4Jvi\/8GMZ1jHBVCN47pmnXWu6s0MdBMmLBVQXSPoEodaR3UJX0zp083G5DFRUg4m\n8MCbtqwFlNDjRzl55MqvH2q\/ISLr4o+Oce7ZoQnhT+9wtC0jnnU6YhsW9S6\/GVMY\n4D1Bn7sTKVqwBm\/xdbdUU1V25R29ySsdJMk=\n-----END CERTIFICATE-----",
                "remote_cert": "-----BEGIN CERTIFICATE-----\nMIIDFjCCAf6gAwIBAgIIM9x1eN7bYs4wDQYJKoZIhvcNAQELBQAwOjELMAkGA1UE\nBhMCQ0gxEzARBgNVBAoTCnN0cm9uZ1N3YW4xFjAUBgNVBAMTDXN0cm9uZ1N3YW4g\nQ0EwHhcNMjEwODI1MTI0NjMxWhcNMzEwODIzMTI0NjMxWjA3MQswCQYDVQQGEwJD\nSDETMBEGA1UEChMKc3Ryb25nU3dhbjETMBEGA1UEAxMKcGVlci0xLWxvYzCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL\/7+p18dHCfncxXsSmOOWGML9AX\nuFISb+3C5sqMfzK9No2nuFSRkW88BxFngSTFFeU0xyD6ekzSQRnUPKryCY1NCGuc\nHaNEZGX9Y\/wBZa38NtS2TwA9NOtAImMBXPfSb5j3wBybUFsx4KElDSY2q+Q213pD\nmb8onxn6GSMcfAml2kQi+GqLhWLLktO4lMNjdUF0dM\/L1Te5VCciF+KkBdNd7cuB\nSIi6N6JYa7YMPSboGjqAbGSqMzGBFkSAsKMQ5p2P9oKh6O7menGhKuFo8WVxJ3ov\nh6XhvqdY+uMCRlzOy\/qwg4u4LdERvE51weruO2rBb\/84XUZlSoClVLekJdcCAwEA\nAaMjMCEwHwYDVR0jBBgwFoAUfsr+ZvfNY8G04Qg+QT5gk3VvnxowDQYJKoZIhvcN\nAQELBQADggEBABUGF0hdi0DsqQlkG3htajtbwNlG0plaZdCqUTKS2MT9JEeTd5JW\nKYXU7hzuURMBCvzTN9J7UDYwqtCvwXSNiA119j6jeyquglQSvboiAGwc53w5zDmG\nWh+ZMpQG3mZDKvgbEHcrNZL+XXdbvY65BMwbpHxnYfVwtKnsSg9dPhsb+lrVG7Gv\nwDvH5H9WM6J03I3U56kw0mgcbcIxU2O3wMgFKWWEQ1dNcB7ShVGxpmw6YbJgUNen\nDco8zLE+7AlRqqrTNpKyKPeQew5+a9ZEsK6eqgTrU+yu0mysLLpW3BF2X3WqKIrr\n\/hMvXJSpmBbFYLOlvGmlGbt9nPyAvzNXfgU=\n-----END CERTIFICATE-----",
                "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAv\/v6nXx0cJ+dzFexKY45YYwv0Be4UhJv7cLmyox\/Mr02jae4\nVJGRbzwHEWeBJMUV5TTHIPp6TNJBGdQ8qvIJjU0Ia5wdo0RkZf1j\/AFlrfw21LZP\nAD0060AiYwFc99JvmPfAHJtQWzHgoSUNJjar5DbXekOZvyifGfoZIxx8CaXaRCL4\naouFYsuS07iUw2N1QXR0z8vVN7lUJyIX4qQF013ty4FIiLo3olhrtgw9JugaOoBs\nZKozMYEWRICwoxDmnY\/2gqHo7uZ6caEq4WjxZXEnei+HpeG+p1j64wJGXM7L+rCD\ni7gt0RG8TnXB6u47asFv\/zhdRmVKgKVUt6Ql1wIDAQABAoIBADcO4bnGlnIyJIQU\n5hb\/1c728ENiehb3eKgcTCnsjxITF5Ead4+xS581\/OTt5SiRaQ0ZzL3Vd7uOVOM+\nbcOstDaU0ARkek93br+dIs6D7BAwk9z\/B7sO0p1hADuaiXn9HMomyy6pECuHK1+r\ni5DY\/wTtAXDr8CzVToOZqRnbsmrlaGro7RC38eIG04AIVaQ1mYkME0XLy6de46rh\nVIJZxeHuXFqbnKobBA7wsxmjJIH15neyndEGFRZ1Ngx+IGZVa9PTttSKGfCH0KUf\nmqvAvJ8odkli32g4QkBEyVHmZiQAO9UuOkWuInfBjPYgzOHTz7jeaFY51mTCVSB2\neU6SwqECgYEA\/Krz2XktbNnStv8nx5P5WK\/50t+ErvtlqwCUsf3C3HBZP6HmI7IR\n8TuA6Rq9bl5pwG9UQnyYUQeQgp9\/23ZNOiTSSbZFonCunbHYrQ2wXaCc+7QUIBT+\ndq91v\/CvaDgkDW1rgPHaV9N9rd4rF9M60F02ibIO8L7dTo9Jpga3Q6cCgYEAwoQm\nLCVl9dt2co7s75xc3Lgxt4dwW\/r+qts3cksOyaM\/+xCqxtUp1RQdBAn\/38fEH5ya\nNiSMAS8t\/D3TEZ30T5NSL3+fZ62NpImfxMIsDEWqUoNWI7vhDfbkjpvdGmVAPy33\nERFCcxewWa72pvOHUhcypg7N24eP6bUiEfiqElECgYAJMet34ZoOmQq7ECQRdkgf\nux+7VdkNSSbVB0tiAtshjJEi6LBoYiWXAtRZJ1j3eEYe8648US513HGc31MW2IJM\n+GQSvKhiFfm00XESMypU7fBolJAa7sin5xDA8HBhuZFOT8oWwjZw9chgGHK3Bj\/g\nr1O5xRoYFsoU\/s\/uU9Y9hwKBgQCFUv63E4snUR2Gt+A++\/XKc5XgLb0dzpPvmAIR\nHNEt8+9OrsXfMwxROFALDK+NOud6o2Qv6CzuQuBKHDYnxRRH1rpmRBuGfLaxKIOR\n4WU\/pCByHgNUytofMDLIbJzIEs5Of7rwv9vD92Cwl\/QHyrPd2HimyU7gQbKqhbSs\njLxFgQKBgBN54uwLulFCszrTReALqmf\/8RZ+IouXS5Yh3FLfT3MScLDhOpwLc6lh\nM435+9Y4BZpEKNnEcD4jbNWViFiLhPmWFxuPqlVBKpaBo2\/XlVpikL2S3sCVEkqZ\nfc1XWFiHlo00dsLA3RXMAX\/gUSGsc5bfPprSMKcEKq0A5popn4am\n-----END RSA PRIVATE KEY-----"
        },
        "nat":true,
        "bgp":true,
        "remote_as":321,
        "source_interface":""
        }
   ]
}
EOF
