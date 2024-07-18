// utils
const net = require('net')
const fastResolver = require('dns-fast-resolver')
const { performance } = require('perf_hooks')

const {
    isNumber,
    isString
} = require('maketype')

const DEFAULT_TIME_OUT = 3000 // 3sec

// #region  errors definitions

// List of some of the error.code values (ref: https://nodejs.org/docs/latest-v12.x/api/errors.html)
// 'ENOTFOUND'      - DNS Error. No device found at this address!
// 'ECONNREFUSED'   - No connection could be made because the target machine actively refused it.
// 'ECONNRESET'     - A connection was forcibly closed by a peer. This normally results from a loss of the connection on the remote socket due to a timeout or reboot. Commonly encountered via the http and net modules.
// 'ETIMEDOUT'      - A connect or send request failed because the connected party did not properly respond after a period of time.
// 'EHOSTUNREACH'   - Indicates that the host is unreachable.

exports.TcpPingError = class TcpPingError extends Error {
    constructor(message) {
        super(message)
        this.code = 'TCPPINGERR'
        this.name = this.constructor.name
    }
}
exports.TcpPingValidationError = class TcpPingValidationError extends this.TcpPingError {
    constructor(message) {
        super(message)
        this.code = 'TCPPINGINVALIDPARAM'
        this.name = this.constructor.name
    }
}
exports.TcpPingTimeOutError = class TcpPingTimeOutError extends this.TcpPingError {
    constructor(message) {
        super(message)
        this.code = 'TCPPINGTIMEOUT'
        this.name = this.constructor.name
    }
}
exports.TcpPingResolverError = class TcpPingResolverError extends this.TcpPingError {
    constructor(message) {
        super(message)
        this.code = 'TCPPINGRESOLVEFAIL'
        this.name = this.constructor.name
    }
}
// #endregion

/**
 * @typedef Options
 * @property {number} dnsTimeout Number of milliseconds to wait before resolver times out
 * @property {Array<string>} dnsServers Array of DNS servers to be used to resolve the hostname
 */

/**
 * @typedef {Object} Result
 * @property {string} host - Hostname or IP
 * @property {number} port - Port number
 * @property {string} ip - IP address
 * @property {boolean} online - Hostname online status. If false is returned check the error property for details.
 * @property {number} ping - Duration (latency) of the ping
 * @property {Error} error - Reason why hostname is not online
 */

/**
 * Pings a host or IP on given port.
 * @description Attemps to open TCP connection and on success it closes it right the way
 * @param host {string}  Hostname or IP
 * @param port {number}  Port number
 * @param options {Options}  Socket and Resolver options
 * @param resolver {object}  Resolver to be used for resolving the host
 * @returns {Promise<Result>}  Promise that will return online status of `host` <---- bj: TODO Update Docs
 *  True    when a TCP connection is successfully opened and closed
 *  False   when host name is not resolved or it failed to open a TCP connection
 * @example
 * // returns true when host is online
 * const online = await tcpPingPort('google.com');
 * @example
 * // returns true when host is online and it is resoled in less than 200ms
 * const online = await tcpPingPort('google.com', 80, {dnsTimeout: 200});
 */
exports.tcpPingPort = (host, port = 80, options = null, resolver = null) => {
    const destroyTime = (options && options.socketTimeout) || DEFAULT_TIME_OUT
    const resolverOptions = options &&
    {
        timeout: options.dnsTimeout,
        servers: options.dnsServers
    }
    port = port || 80
    const result = {
        host,
        port,
        ip: null,
        online: false,
        ping: -1,
        error: null
    }

    // #region  check parameters
    if (!isString(host)) { result.error = new this.TcpPingValidationError('Invalid host') }
    if (!isNumber(port)) { result.error = new this.TcpPingValidationError('Invalid port') }
    if (result.error) {
        return Promise.resolve(result)
    }
    // #endregion

    resolver = resolver || (new fastResolver.FastResolver(resolverOptions))
    let socket

    return new Promise((resolve, reject) => {
        const closeSocket = () => {
            if (socket && !socket.destroyed) {
                resolver && resolver.cancel && resolver.cancel()
                if (socket.lookup) socket.lookup = null
            }
            socket && socket.end()
            socket && socket.destroy()
            socket && socket.unref()
        }

        try {
            const pingStart = performance.now()
            socket = net.connect(
                {
                    host,
                    port,
                    family: 4,  // we don't need to look for IPv6
                    lookup: resolver.resolve
                    // lookup: resolver.staticIpResolver    // assuming the host is a valid IP
                    // lookup: dns.lookup                   // Default
                    // lookup: dns.resolve4                 // IPv4 resolver
                }
            )
            socket.setNoDelay(true)
            socket.setKeepAlive(false)
            socket.setTimeout(destroyTime, () => {
                result.error = new this.TcpPingTimeOutError(`Socket Timeout of ${destroyTime}ms exceeded.`)
                closeSocket()
            })
            socket.on('data', (data) => {
                socket.end()
            })
            socket.on('connect', (data) => {
                result.online = true
                result.ping = (performance.now() - pingStart)
                closeSocket()
            })
            socket.on('error', err => {
                result.error = err
                closeSocket()
            })
            socket.on('lookup', (err, address, family, lHost) => {
                family = 4
                result.ip = address
                if (err || !address) {
                    result.error = err || new this.TcpPingResolverError(`Resolving hostname ${lHost} failed.`)
                    closeSocket()
                }
            })
            socket.on('close', (_hadError) => {
                closeSocket()
                resolve(result)
            })
        } catch (error) {
            closeSocket()
            reject(error)
        }
    })
}
