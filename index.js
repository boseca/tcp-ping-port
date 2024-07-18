'use strict'

const TcpPingPort = require('./src/TcpPingPort')
module.exports = {
    tcpPingPort: TcpPingPort.tcpPingPort,
    TcpPingError: TcpPingPort.TcpPingError,
    TcpPingTimeOutError: TcpPingPort.TcpPingTimeOutError,
    TcpPingResolverError: TcpPingPort.TcpPingResolverError,
    TcpPingValidationError: TcpPingPort.TcpPingValidationError
}
