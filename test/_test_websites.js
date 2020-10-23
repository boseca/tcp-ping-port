module.exports = [
    // online
    { ipv4: 1, ipv6: 1, id: 0, online: 1, hostname: 'google.com' },
    { ipv4: 1, ipv6: 0, id: 1, online: 1, hostname: '172.217.1.174' },
    { ipv4: 1, ipv6: 1, id: 2, online: 1, hostname: 'yahoo.com' },
    { ipv4: 1, ipv6: 0, id: 3, online: 1, hostname: '24h.com.vn' },
    { ipv4: 1, ipv6: 0, id: 4, online: 1, hostname: 'doctissimo.fr' },
    { ipv4: 1, ipv6: 0, id: 5, online: 1, hostname: 'sapo.pt' },

    // ECONNREFUSED (online)
    { ipv4: 1, ipv6: 1, id: 6, online: 1, hostname: 'wikimedia.org' },
    // ENOTFOUND    (offline)
    { ipv4: 0, ipv6: 0, id: 7, online: 0, hostname: '17kuxun.com' },
    // EAI_AGAIN    (offline)
    { ipv4: 0, ipv6: 0, id: 8, online: 0, hostname: 'megaupload.com' },
    // ESERVFAIL    (offline)
    { ipv4: 0, ipv6: 0, id: 9, online: 0, hostname: 'pcgames.com.cn' },
    // 0.0.0.0      (offline)
    { ipv4: 0, ipv6: 0, id: 10, online: 0, hostname: 'rapidshare.com' },

    // Resolved IP  (offline)
    { ipv4: 1, ipv6: 0, id: 11, online: 0, hostname: '8.8.8.8' },
    { ipv4: 1, ipv6: 0, id: 12, online: 0, hostname: '8.8.4.4' },

    // null         (offline)
    { ipv4: 0, ipv6: 0, id: 13, online: 0, hostname: null },

    // slow         (online|offline)
    { ipv4: 1, ipv6: 0, id: 14, online: 1, hostname: 'archive.org' },
    { ipv4: 0, ipv6: 0, id: 15, online: 0, hostname: '5d6d.com' },
    { ipv4: 0, ipv6: 0, id: 16, online: 0, hostname: 'juchang.com' },
    { ipv4: 0, ipv6: 0, id: 17, online: 0, hostname: 'letitbit.net' },
    { ipv4: 0, ipv6: 0, id: 18, online: 1, hostname: 'aipai.com', skip: 1 },     // very slow > 15sec

    // Load balancer (online|offline depeneding of the Load Balancer IP)
    { ipv4: 0, ipv6: 0, id: 19, online: 1, hostname: 'businessweek.com', skip: 1 },
    { ipv4: 1, ipv6: 1, id: 20, online: 1, hostname: 'hsbccreditcard.com', skip: 1 },
    { ipv4: 1, ipv6: 1, id: 21, online: 1, hostname: 'fileserve.com', skip: 1 },
    { ipv4: 1, ipv6: 1, id: 22, online: 1, hostname: 'passport.net', skip: 1 },
    { ipv4: 1, ipv6: 1, id: 23, online: 1, hostname: 'changyou.com', skip: 1 },
    { ipv4: 1, ipv6: 1, id: 24, online: 1, hostname: 'popcap.com', skip: 1 }
]
