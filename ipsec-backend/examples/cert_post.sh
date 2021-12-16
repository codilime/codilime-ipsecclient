curl -v -XPOST\
   http://localhost/restconf/data/sico-ipsec:api/vrf\
   -u "admin:cisco123" -d @- << EOF
{
   "id":1,
   "client_name":"test",
   "vlan":123,
   "crypto_ph1":[
      "aes-cbc-128",
      "sha256",
      "modp_2048"
   ],
   "crypto_ph2":[
      "esp-gcm",
      "fourteen"
   ],
   "physical_interface":"eth0",
   "active":false,
   "local_as":123,
   "lan_ip":"10.0.0.1",
   "endpoints":[
        {
        "remote_ip_sec":"10.1.0.1",
        "local_ip":"10.2.0.1",
        "peer_ip":"10.3.0.1",
        "authentication": {
                "type": "certs",
                "remote_cert": "-----BEGIN CERTIFICATE-----\nMIIDFjCCAf6gAwIBAgIIGAF4idq1jLUwDQYJKoZIhvcNAQELBQAwOjELMAkGA1UE\nBhMCQ0gxEzARBgNVBAoTCnN0cm9uZ1N3YW4xFjAUBgNVBAMTDXN0cm9uZ1N3YW4g\nQ0EwHhcNMjEwODI1MTI0NjMxWhcNMzEwODIzMTI0NjMxWjA3MQswCQYDVQQGEwJD\nSDETMBEGA1UEChMKc3Ryb25nU3dhbjETMBEGA1UEAxMKcGVlci0xLXJlbTCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAO4YHIqS4ud2LGQl+uV8pdrPuIkA\nst6lA9NcApgWz0CPDD7XTsvsNldrLh6vH+X8TUHmnTyQ4Xa4cSsjeEFfaEDQrFFO\nnEZh4nEZbd+bh5KjfzIN4661o\/VLdsmuQA9UUfsAmY678q\/hNEaae0kkXVcyjpTr\nPyT0K2qH7mF1dfvj55o6B71rT5ncHF6bZlAxt0rBBxn\/oAwuZZBhZkJm5b7yHpv8\nhJv7RdbkAQPrC\/dOGMxye4MpZpd+RR0iCBIUVWPs9XmgRwvx4ZQZgc5n34hOdZ4R\ni8G9AoHO0rNGGJjz0NtWSSDtFfnqCvO70luhXKwqyGWLPRtlIQ0tFYZTWi0CAwEA\nAaMjMCEwHwYDVR0jBBgwFoAUfsr+ZvfNY8G04Qg+QT5gk3VvnxowDQYJKoZIhvcN\nAQELBQADggEBAE2Ofjpd74qAvU+IGpCMC9xkHX8roS++TsAt3m1ZAnHcuxAYdbQx\nqx79DqC3kSuxiDmN8tmPeEgvoZ1bP4ovsCnGHY0kMR8YTD8VfXgPRP\/80hBGIH\/+\nlhLEAm8hdFvRZl05\/0LMuve8yxPGYPvnw\/ujAVNM20WaSgxQV5sK3lDz\/DWOEUJ+\n4Jvi\/8GMZ1jHBVCN47pmnXWu6s0MdBMmLBVQXSPoEodaR3UJX0zp083G5DFRUg4m\n8MCbtqwFlNDjRzl55MqvH2q\/ISLr4o+Oce7ZoQnhT+9wtC0jnnU6YhsW9S6\/GVMY\n4D1Bn7sTKVqwBm\/xdbdUU1V25R29ySsdJMk=\n-----END CERTIFICATE-----",
                "local_cert": "-----BEGIN CERTIFICATE-----\nMIIDFjCCAf6gAwIBAgIIM9x1eN7bYs4wDQYJKoZIhvcNAQELBQAwOjELMAkGA1UE\nBhMCQ0gxEzARBgNVBAoTCnN0cm9uZ1N3YW4xFjAUBgNVBAMTDXN0cm9uZ1N3YW4g\nQ0EwHhcNMjEwODI1MTI0NjMxWhcNMzEwODIzMTI0NjMxWjA3MQswCQYDVQQGEwJD\nSDETMBEGA1UEChMKc3Ryb25nU3dhbjETMBEGA1UEAxMKcGVlci0xLWxvYzCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL\/7+p18dHCfncxXsSmOOWGML9AX\nuFISb+3C5sqMfzK9No2nuFSRkW88BxFngSTFFeU0xyD6ekzSQRnUPKryCY1NCGuc\nHaNEZGX9Y\/wBZa38NtS2TwA9NOtAImMBXPfSb5j3wBybUFsx4KElDSY2q+Q213pD\nmb8onxn6GSMcfAml2kQi+GqLhWLLktO4lMNjdUF0dM\/L1Te5VCciF+KkBdNd7cuB\nSIi6N6JYa7YMPSboGjqAbGSqMzGBFkSAsKMQ5p2P9oKh6O7menGhKuFo8WVxJ3ov\nh6XhvqdY+uMCRlzOy\/qwg4u4LdERvE51weruO2rBb\/84XUZlSoClVLekJdcCAwEA\nAaMjMCEwHwYDVR0jBBgwFoAUfsr+ZvfNY8G04Qg+QT5gk3VvnxowDQYJKoZIhvcN\nAQELBQADggEBABUGF0hdi0DsqQlkG3htajtbwNlG0plaZdCqUTKS2MT9JEeTd5JW\nKYXU7hzuURMBCvzTN9J7UDYwqtCvwXSNiA119j6jeyquglQSvboiAGwc53w5zDmG\nWh+ZMpQG3mZDKvgbEHcrNZL+XXdbvY65BMwbpHxnYfVwtKnsSg9dPhsb+lrVG7Gv\nwDvH5H9WM6J03I3U56kw0mgcbcIxU2O3wMgFKWWEQ1dNcB7ShVGxpmw6YbJgUNen\nDco8zLE+7AlRqqrTNpKyKPeQew5+a9ZEsK6eqgTrU+yu0mysLLpW3BF2X3WqKIrr\n\/hMvXJSpmBbFYLOlvGmlGbt9nPyAvzNXfgU=\n-----END CERTIFICATE-----",
                "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEA7hgcipLi53YsZCX65Xyl2s+4iQCy3qUD01wCmBbPQI8MPtdO\ny+w2V2suHq8f5fxNQeadPJDhdrhxKyN4QV9oQNCsUU6cRmHicRlt35uHkqN\/Mg3j\nrrWj9Ut2ya5AD1RR+wCZjrvyr+E0Rpp7SSRdVzKOlOs\/JPQraofuYXV1++PnmjoH\nvWtPmdwcXptmUDG3SsEHGf+gDC5lkGFmQmblvvIem\/yEm\/tF1uQBA+sL904YzHJ7\ngylml35FHSIIEhRVY+z1eaBHC\/HhlBmBzmffiE51nhGLwb0Cgc7Ss0YYmPPQ21ZJ\nIO0V+eoK87vSW6FcrCrIZYs9G2UhDS0VhlNaLQIDAQABAoIBAQDBEEAkhdMESSjZ\n1IpMB\/UdJw7F2RExxLEDdDqORQCtotEVK9WzOckevcRaETtWbG3hIDUj5X9Nm2X4\nyvw6VjjdRdhU3d+OmtTZTPtxNFaMq5L6bZTQGG3o+9ZI18kOJRuM4wGhYfn6cCzJ\ni36o4pnlmRNQ4ikDuBJ0geDkmjCfnK+SWJ6uluUc47mZ\/u7ZyYWpkEbupUpxkB0n\nRNw4K97j3TaFP+ON7Ng1IQLqGVlUKa1N4VWBFEeSANhPZBHwadWq5rrOZ1miffL1\nehRYz\/GNUHWMldlPBKH191K7jkJiQ8tmP+yQAQlkTCbRbMwsT2kQrgvrAFfQoj9N\nFuw2OkCpAoGBAP+IRTerNqKe0fy3hzPtPYGdb9dDgx6mfTXWBmg0B6DnNfPOPUPm\n6hoJ8iNuE99mSW7qw3E+phxOvEmU9vUwKex8ipwSHyHRhGtF6vDkk42OXo38G50Y\nfBW\/Aw+WlL2U2tSS0iegiP1GDWlCMoqvrkCvDzTAx1vL2H4UhKKIvpWLAoGBAO6H\nq6SYGW47U7NQNgn5x\/\/S\/4qK9b3XIu278fCIrEDsN7WY1QNsN9zkw+Oj3f+Egfkq\nojNARlHMPRdsPtZk9NpvGre4ouoVGHzoaDD1XsRj7UopCkfuS5D6q5RQEbOTC3XN\nxmmqLZPQ9d5pnbeBHcsgGFilaM9vFT7SvrLhpfYnAoGAM3qtjyiECkD6xvHmYBS0\nZm9kP7bPLJaX9QeYJNgOjWDnIqXy+8ICeZp1WKPthv0hYCIVm7PmXR+TmTNUiVLZ\nr1XrysNv2C1QgxgD2+IAw+zhqbMXkQ+EuBDSOgq5DnR1nYuyoN8bmgLJ4uG+Muhv\nr4JVCuingRvREp1plyD7XD8CgYEA1I3RRjrDbpcvXvp7LSiIME+1p59snF65oV95\nmP4xgSj9+7TVHNeycATrCk9b4\/YQXBjBsSn1f66gQd8Tn7kW+A9Jn63Ifw+NYsE3\nF2mPqTHiodMwdijC7c5yVxeCrqK586AKzt32\/2GVtzwmbv9\/rSJMj7HWVAKIzBLA\nHGc3nMECgYEAgdPiXquJwZr47iW9OinsBQUoFM\/QUKDwhiGYzoWDNH7EJWQ2zCkU\nL2zIzil5sd74HURmxAiSgsFpBXlIHNHwyiwhdqcjq4juXpyaTrOju\/K1dBP\/r13Y\nTagzqeHMr1eMtApQkCenxw+zIHLuWzgpybXblUm59aMQnpwYhbOT6B0=\n-----END RSA PRIVATE KEY-----"
        },
        "nat":true,
        "bgp":true,
        "remote_as":321,
        "source_interface":""
        }
   ]
}
EOF
