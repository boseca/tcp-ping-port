// utils
const net = require('net')
const fastResolver = require('dns-fast-resolver')

const {
    isNumber,
    isString
} = require('maketype')

const DEFAULT_TIME_OUT = 3000 // 3sec

/**
 * @typedef Options
 * @property {number} dnsTimeout Number of miliseconds to wait before resolver times out
 * @property {Array<string>} dnsServers Array of DNS servers to be used to resolve the hostname
 */

/**
 * Pings a host or IP on given port.
 * @description Attemps to open TCP connection and on success it closes it right the way
 * @param host {string}  Hostname or IP
 * @param port {number}  Port number
 * @param options {Options}  Socket and Resolver options
 * @param resolver {object}  Resolver to be used for resolving the host
 * @returns {Promise<boolean>}  Promise that will return online status of `host`
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
        online: false
    }

    // #region  check parameters
    if (!isString(host)) { return Promise.resolve(result) }
    if (!isNumber(port)) { return Promise.resolve(result) }
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
            socket.setTimeout(destroyTime, closeSocket)
            socket.on('data', (data) => {
                socket.end()
            })
            socket.on('connect', (data) => {
                result.online = true
                closeSocket()
            })
            socket.on('error', _err => closeSocket())
            socket.on('lookup', (err, address, family, lHost) => {
                family = 4
                result.ip = address
                if (err || !address) closeSocket()
            })
            socket.on('close', (data, err) => {
                closeSocket()
                resolve(result)
            })
        } catch (error) {
            console.warn('socket connection error:', host, port, error.message)
            closeSocket()
            reject(error)
        }
    })
}
