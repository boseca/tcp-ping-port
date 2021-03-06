const net = require('net')
const dns = require('dns')
const assert = require('assert')
const { assert: assertChai } = require('chai')
const { tcpPingPort } = require('../index')

const SHOW_COMMENTS = false
const INVALID_DNS_SERVER = '4.4.4.4'
// eslint-disable-next-line no-unused-vars
const _VALID_DNS_SERVER = '8.8.8.8'

describe('Unit: PingPort', function () {
    describe('tcpPingPort', function () {
        this.timeout(5000) // 5sec

        it('should fail to ping invalid port "google.com:88888"', function () {
            const hosts = [{ hostname: 'google.com', port: 88888 }]
            return assert.rejects(runTcpPingPort(hosts, { dnsServers: [INVALID_DNS_SERVER] }), { code: 'ERR_SOCKET_BAD_PORT' })
        })

        it('should return offline for unopened port "google.com:1111"', function () {
            const hosts = [{ hostname: 'google.com', port: 1111 }]
            return runTcpPingPort(hosts)
                .catch(err => {
                    assertChai.isNotOk(err, `${hosts[0].hostname} :: Unexpected error: ${err}`)
                })
                .then(results => {
                    assertChai.isNotOk(results[0].actual.online, `Expected google.com:1111 to be offline but found ${results}`)
                })
        })

        it('should succeed to ping "google.com:80"', function () {
            const hosts = [{ hostname: 'google.com' }]
            return runTcpPingPort(hosts)
                .then(results => {
                    const online = results[0].actual.online
                    assertChai.isOk(online)
                })
        })

        it('should succeed to ping `google.com` using `dns.lookup` resolver', function () {
            const hosts = [{ hostname: 'google.com', port: 80 }]
            const options = {
                socketTimeout: 1100
            }

            dns.resolve = dns.lookup.bind(dns)  // tcpPingPort is expecting `resolve` function
            return runTcpPingPort(hosts, options, dns)
                .then(results => {
                    const online = results[0].actual.online
                    assertChai.isOk(online)
                })
        })

        it('should succeed to ping `google.com` using `dns.lookup` resolver', function () {
            const hosts = [{ hostname: 'google.com', port: 80 }]
            const options = {
                socketTimeout: 1100
            }
            dns.resolve = dns.lookup.bind(dns)  // tcpPingPort is expecting `resolve` function
            return runTcpPingPort(hosts, options, dns)
                .then(results => {
                    const online = results[0].actual.online
                    assertChai.isOk(online)
                })
        })

        it('should ping hosts in "_test_websites.js"', function () {
            const hosts = JSON.parse(JSON.stringify(require('./_test_websites')))
            return runTcpPingPort(hosts)
                .then(results => {
                    const invalid = results.filter(v => (!v.skip && (!!v.online !== v.actual.online))) || []
                    assertChai.isNotOk(invalid.length, `Invalid online status: ${JSON.stringify(invalid)}`)
                })
        })
    })

    describe('ping 1000 website', function () {
        xit('should find 90% of the hosts to be online "_top_1000_sites.json"', function () {
            this.timeout(20000) // 20sec
            const hosts = JSON.parse(JSON.stringify(require('./_top_1000_websites.json')))
            return runTcpPingPort(hosts, { socketTimeout: 11000, dnsTimeout: 10000 })
                .then(results => {
                    const invalid = results.filter(v => (!!v.online !== v.actual.online)) || []
                    const per = results.length ? Math.round(invalid.length / results.length * 100 * 100) / 100 : 0
                    const perStr = per.toFixed(1).padStart(4, ' ')
                    const MAX_INVALID_PERCENT = 10

                    assertChai.isBelow(per, MAX_INVALID_PERCENT, `Too many offline sites ${perStr}%: ${JSON.stringify(invalid)}`)
                })
        })
    })

    // #region helper functions
    function runTcpPingPort(hosts, options = {}, resolver = null) {
        // create promises
        const pms = hosts.map(item => {
            return new Promise((resolve, reject) => {
                tcpPingPort(item.hostname, item.port, options, resolver)
                    .then(result => {
                        item.actual = result
                        resolve(item)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        })

        var start = process.hrtime()

        // run all promises
        return Promise.all(pms)
            .then(results => {
                if (SHOW_COMMENTS) {
                    const end = process.hrtime(start)
                    const elapsedTime = (Math.round((end[0] * 1e9 + end[1]) / 1e9 * 100) / 100).toFixed(1).padStart(4, ' ')
                    const unresolved = results.filter(v => !v.address).length.toString().padStart(3, ' ')
                    const resolved = results.filter(v => net.isIP(v.address)).length.toString().padStart(3, ' ')
                    const per = results.length ? 100 - Math.round(unresolved / results.length * 100 * 100) / 100 : 0
                    const perStr = per.toFixed(1).padStart(4, ' ')
                    const summary = 'tcp-ping-port:'

                    console.log(`@ ${summary} invalid ${unresolved}, valid ${resolved}, resolved ${perStr}%, duration ${elapsedTime}s`)
                }
                return results
            })
    }
    // #endregion
})
