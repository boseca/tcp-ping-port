# tcp-ping-port
A simple TCP ping utility to ping a port of an IP or domain. 

[![NPM version](https://img.shields.io/npm/v/tcp-ping-port.svg)](https://www.npmjs.com/package/tcp-ping-port)
[![Release Status](https://github.com/boseca/tcp-ping-port/workflows/npm%20release/badge.svg)](https://github.com/boseca/tcp-ping-port/releases)
[![Build Status](https://github.com/boseca/tcp-ping-port/workflows/build/badge.svg)](https://github.com/boseca/tcp-ping-port/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/boseca/tcp-ping-port/badge.svg?branch=main)](https://coveralls.io/github/boseca/tcp-ping-port?branch=main)


## Table of contents
---
- [Benefits](#Benefits)
- [Installation](#installation)
- [How to use](#how-to-use)
- [Dependencies](#dependencies)
- [API](#api)
- [Testing](#testing)


## Benefits
---
Following are the pros and cons of this package compared to the regular `ping`

### Pros
- Can be used with Amazon Lambda functions and Aazure functions.  
    Regular `ping` uses ICMP protocol which is not permitted by AWS/Azure functions
- TCP packets have higher priorty than ICMP packets
- It can ping a particular port
- It can work even if ICMP is disabled

### Cons
- Higher data usage

    | Protocol | Send (B)) | Receive (B) | Total (B) | Data saving |
    | -------- | --------- | ------------ | ---------- | ----------- |
    | TCP | 228 | 126 | 354 | 0% |
    | ICMP | 98 | 98 | 196 | 45% |


    The numbers are based on data reported by Wireshark
    <details>
    <p>

    #### TCP Ping

    | No. | Time | Source | Destination | Protocol | Length | Info |
    | --- | ---- | ------ | ----------- | -------- | ------ | ---- |    
    | 1 | 0.000000 | x.x.x.x         | y.y.y.y           | DNS | 70 | Standard query 0xfe55 A google.com |
    | 2 | 0.000393 | y.y.y.y         | x.x.x.x           | DNS | 86 | Standard query response 0xfe55 A google.com A 172.217.165.14 |
    | | | | | | | |    
    | 3 | 0.001364 | x.x.x.x         | 172.217.165.14    | TCP | 66 | 49985 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256 SACK_PERM=1 |
    | 4 | 0.012339 | 172.217.165.14  | x.x.x.x           | TCP | 66 | 80 → 49985 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1430 SACK_PERM=1 WS=256 |
    | 5 | 0.012412 | x.x.x.x         | 172.217.165.14    | TCP | 54 | 49985 → 80 [ACK] Seq=1 Ack=1 Win=262912 Len=0 |
    | 6 | 0.013110 | x.x.x.x         | 172.217.165.14    | TCP | 54 | 49985 → 80 [FIN, ACK] Seq=1 Ack=1 Win=262912 Len=0 |
    | 7 | 0.024927 | 172.217.165.14  | x.x.x.x           | TCP | 60 | 80 → 49985 [FIN, ACK] Seq=1 Ack=2 Win=65536 Len=0 |
    | 8 | 0.024987 | x.x.x.x         | 172.217.165.14    | TCP | 54 | 49985 → 80 [ACK] Seq=2 Ack=2 Win=262912 Len=0 |



    #### ICMP ping
    | No. | Time | Source | Destination | Protocol | Length | Info |
    | --- | ---- | ------ | ----------- | -------- | ------ | ---- |    
    | 1 | 0.000000 | x.x.x.x        | y.y.y.y       | DNS   | 70 | Standard query 0xff9e A google.com|
    | 2 | 0.003286 | y.y.y.y        | x.x.x.x       | DNS   | 86 | Standard query response 0xff9e A google.com A 172.217.165.14|
    | 3 | 0.040291 | x.x.x.x        | 172.217.165.14| ICMP  | 98 | Echo (ping) request  id=0x0279, seq=1/256, ttl=128 (reply in 6)|
    | 4 | 0.064258 | 172.217.165.14 | x.x.x.x       | ICMP  | 98 | Echo (ping) reply    id=0x0279, seq=1/256, ttl=112 (request in 5)|

    > NOTE: The first 2 DNS resolution calls are same in both cases for IPv4 and are not included in the total data usagage. 

    </p>
    </details> 


[back to top](#table-of-contents)


## Installation
---
```
$ npm install tcp-ping-port --save
```
[back to top](#table-of-contents)


## How to use
---

Simple examples
```js
const { tcpPingPort } = require("tcp-ping-port")

tcpPingPort("google.com").then(online => {
    // ....
})
```

With additional options
```js
const { tcpPingPort } = require("tcp-ping-port")
const dns = require('dns')
const options = { 
    socketTimeout: 11000, 
    dnsTimeout: 10000,
    dnsServers: '8.8.8.8',  // google DNS
}
tcpPingPort("google.com", 80, options).then(online => {
    // ....
})
```


[back to top](#table-of-contents)

## Dependencies 
* `dns-fast-resolver` - to resolve multiple domains at the same time and to handle any errors while resolving the domain name. Also, to skip the whole dns resolution if host name is an IP address.  
* `lodash`  
* `maketype`

[back to top](#table-of-contents)

## API
### tcpPingPort(hostname[, port, options, resolver])   
Attemps to open and close TCP connection

* hostname `<string>` Host name or an IP address to try to connect to
* port `<number>` Port number
* options `<Object>` Socket and Resolver options
    - socketTimeout `<integer>` Number of miliseconds to wait before the resolving request is canceled. Default value 4000 (4s).
    - dnsTimeout `<integer>` Number of miliseconds to wait before the resolving request is canceled. Default value 4000 (4s).  
      Usefull for rare cases when hostnames may need more than default 4 seconds to be resolved.
    - [dnsServers](https://nodejs.org/api/dns.html#dns_dns_setservers_servers) `<string[]>` Array of RFC 5952 formatted addresses. (Example: `['4.4.4.4', '[2001:4860:4860::8888]', '4.4.4.4:1053', '[2001:4860:4860::8888]:1053']`)
 
* returns `<Promise>` Promise that will return online status of `host`
    - `True`    - when host is online and TCP connection is successfully opened and closed
    - `False`   - when host name is not resolved or it failed to open a TCP connection


[back to top](#table-of-contents)


## Testing
Run all tests
```
$ npm test
```

Run `ping "google.com:80"` test
```
$ npm run unit-test -- --grep "google.com:80"
```

[back to top](#table-of-contents)
