---
date: '2024-12-14T14:32:12+08:00'
draft: false
title: '从输入 URL 到页面展示'
author: 'qinqinfeng'
ShowToc: true
ShowReadingTime: true
tags: ['tcp', 'tls', 'http', 'browser']
aliases: ["migrate-from-jekyl"]
TocOpen: true
summary: 'TCP 连接建立、TLS 连接建立、跨域与缓存、渲染流水线。'
---

# TCP 连接建立
TCP 协议在 IP 协议之上，应用层之下。如何选用不同网络，是 IP 层及数据链路层决定的；如何构造消息响应，是应用层决定的。如何保证消息的可靠传输，是 TCP 协议决定的。TCP 协议的特性如下：
- 面向连接：点对点通信，不能广播或多播；连接存在的情况下才会传输数据。
- 双向传递：全双工。HTTP 1.1 协议是 client 端发送消息，server 进行响应。Websocket 的升级其实是把 TCP 的双工特性暴露在应用层中。
- 字节流：消息无边界，可以分多次传输；字节流是有序的，只有上一个流消息被接收到，才会处理下一个流，而非给应用层处理。
  - 缺点：不维护应用层报文的边界。
  - 优点：不强制要求应用必须创建离散的数据块，不限制数据块的大小。
- 可靠传输：保证可达，丢包时通过重发增加时延保证可靠性。
- 流量缓冲：解决速度不匹配的问题。
- 拥塞控制。

![TCP协议](https://s2.loli.net/2024/12/15/1HMl49z8BLs5C2E.png)

基于以上特性，TCP 协议需要做到：
- 主机内的进程寻址
    > TCP 使用(源IP, 源端口, 目的IP, 目的端口)来唯一标识一个连接。对于基于无连接 UDP 协议的 QUIC 协议来讲，它标识连接的方式，是 Connection ID，即使 IP 或 port 发生变化，也能复用同一个连接。
- 创建、管理、终止连接
- 处理并将字节（8bit）流打包成报文段（如 IP 报文）
- 传输数据
- 保持可靠性与传输质量
- 流控制与拥塞控制




## 三次握手
握手的目标：
- 同步 Sequence 序列号
  - 初始序列号 ISN（Initial Sequence Number）
- 交换 TCP 通讯参数
  - 如 MSS、窗口比例因子、选择性确认、指定校验和算法

使用 tcpdump 抓取前三次报文：
```bash
sudo tcpdump -i lo0 port 1313 -c 3 -S
```
得到:
```bash
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on lo0, link-type NULL (BSD loopback), snapshot length 262144 bytes
17:25:44.928561 IP localhost.bmc_patroldb > localhost.57495: Flags [.], ack 1496517778, win 6365, length 0
17:25:44.928604 IP localhost.57495 > localhost.bmc_patroldb: Flags [.], ack 2273462556, win 5126, options [nop,nop,TS val 2441526792 ecr 3417693123], length 0
17:25:45.574496 IP localhost.57494 > localhost.bmc_patroldb: Flags [P.], seq 2233224788:2233225864, ack 112312241, win 5427, options [nop,nop,TS val 4021109083 ecr 2781911591], length 1076
3 packets captured
1304 packets received by filter
0 packets dropped by kernel
```
每一次连接时，采用不同的随机化序列号确保每个新连接的序列号与先前连接不同，从而避免旧连接中的数据包被新连接错误接收。

![tcp连接](https://s2.loli.net/2024/12/15/nk9t8FQOT7AlqDo.png)

上图显示了 tcp 连接过程中的 5 中状态，分别是：
- CLOSED：初始状态，表示连接未建立。
- LISTEN：服务器端在等待连接。
- SYN-SENT：客户端发送连接请求。
- SYN-RECEIVED：服务器端收到连接请求，并发送确认。
- ESTABLISHED：连接建立完成。

使用 netstat 可以很方便进行查看：
```bash
netstat -an | grep tcp
```
![tcp状态](https://s2.loli.net/2024/12/15/8fjFe4J5MozbVln.png)

### 三次握手中性能和安全问题

在 TCP 协议中，服务器端监听的套接字会维护两个队列来处理连接，不同端口的队列相互独立，不会共享：
- SYN 队列（半连接队列）：
  - 存放已收到 SYN 报文但还未完成三次握手的连接。
  - 这些连接处于 SYN_RECEIVED 状态。
- accept 队列（全连接队列）：
  - 存放已完成三次握手的连接，等待应用程序通过 accept() 系统调用提取。
  - 这些连接处于 ESTABLISHED 状态。


![服务器三次握手如何处理](https://s2.loli.net/2024/12/15/JQUxI9y6ZLKAhfN.png)

有很多命令对超时时间和 syn/accept 缓冲队列进行调整，来适应不同的需求：
- 应用层 connect 超时时间调整
- 操作系统内核限制调整
  - 服务器端 SYN_RCV 状态
    - net.ipv4.tcp_max_syn_backlog：SYN_RCVD 状态连接的最大个数
    - net.ipv4.tcp_synack_retries：被动建立连接时，发SYN/ACK的重试次数
  - 客户端 SYN_SENT 状态
    - net.ipv4.tcp_syn_retries = 6 主动建立连接时，发 SYN 的重试次数
    - net.ipv4.ip_local_port_range = 32768 60999 建立连接时的本地端口可用范围
  - ACCEPT队列设置

TFO 通过设置 Cookie 的方式，减少 TCP 每次建立连接带来的时延。从 2RTT 减少到 1RTT。在 Linux 中，具体操作如下：
```bash
sysctl -w net.ipv4.tcp_fastopen=3
```
- 0：关闭
- 1：作为客户端时可以使用 TFO
- 2：作为服务器时可以使用 TFO
- 3：无论作为客户端还是服务器，都可以使用 TFO

![TFO](https://s2.loli.net/2024/12/15/ie8jSNgycsXtnoI.png)

在 syn 攻击中，攻击者短时间伪造不同 IP 地址的 SYN 报文，快速占满 backlog 队列，，服务器无法处理新的合法连接请求
- 通过启用 syn 队列的超时机制，及时清除未完成握手的条目
- 通过扩充 syn 队列大小提高服务器的抗攻击能力，linux 中修改内核参数命令如下：
    ```bash
    sysctl -w net.ipv4.tcp_max_syn_backlog=4096
    ```
可以使用 tcp_syn_cookie 的方式处理 backlog 队列满的问题：
![syn cookie](https://s2.loli.net/2024/12/15/l5Cf8NWM3pQGcwu.png)



## 四次挥手
# TLS 连接建立
## 对称加密原理
对输入 A 和 B，可以通过四种运算方式：与、或、同或和异或得到输出结果 C。这其中，同或和异或的结果具有唯一性和可逆性。这意味着对于给定的一个输出 C 和一个输入 A，可以唯一确定另一个输入 B。这种特性非常适合用于加密场景。

在对称加密中，异或运算是核心操作之一。通过一次遍历，就可以完成加密和解密操作。

**填充操作**
Block cipher 分组加密将明文分成多个等长的 Block 模块，对每个模块分别加解密。由于明文长度不固定，可能会对明文进行填充。

**异或运算**
根据异或运算的种类，分为下图几种工作模式。
- ECB 直接将明文分解为多个块，对每个块独立加密，缺点：无法隐藏数据特征
- CBC 每个明文块先与前一个密文块进行异或后，再进行加密，缺点：加密过程串行化
- CTR 通过递增一个加密计数器以产生连续的密钥流，缺点：不能提供密文消息完整性校验
![异或运算](https://s2.loli.net/2024/12/14/Fu5a2yLDnZ4Srtp.png)

**验证完整性**
哈希算法能够将任意长度的输入转换为固定长度、不可逆的输出。以 sha-256 为例：
- 将输入分成固定大小的块（通常为 512 位）。
- 如果输入不足一块，则通过填充补齐。
- 通过对每个块迭代处理，最终将结果压缩为固定长度。

将 CTR 模式和 MAC算法结合，可以得到 GCM 工作模式。AES 就是采用这种模式进行加密的。
![GCM](https://s2.loli.net/2024/12/14/4NfmntoAHXqg3FV.png)


### AES 加密的具体流程
AES 使用填充算法 PKCS7，使用分组工作模式：GCM。它的加密算法如下：
1. 把明文按照 128bit（16 字节）拆分成若干个明文块，每个明文块是4*4 矩阵
2. 按照选择的填充方式来填充最后一个明文块
3. **每一个明文块利用 AES 加密器和密钥，加密成密文块**
4. 拼接所有的密文块，成为最终的密文结果
![AES](https://s2.loli.net/2024/12/14/f1whsxDFyrBdM4H.png)

## 非对称加密
如何传递对称加密的密钥，成为一个难题。RSA 算法在早期就经常被使用来解决这个问题（现在则经常使用 RSA 加密 CA 证书）。

RSA 计算公钥和私钥的步骤如下：
1. 随机选择两个不相等的质数 p 和 q
2. 计算 p 和 q 的乘积 n（明文小于 n）
3. 计算 n 的欧拉函数 v=φ(n)
4. 随机选择一个整数 k, 1< k < v，且 k 与 v 互质
5. 计算 k 对于 v 的模反元素 d
6. 公钥：(k,n)
7. 私钥： (d,n)

假定公钥被泄露，需要计算 v 来获取私钥中的 d 值，由于 n 是一个非常大的数字，对 n 进行因式分解找到 p 和 q 非常困难，所以很难获取 v 值。以此保障了 rsa 算法的可靠性。

RSA 加解密流程如图所示：![RSA](https://s2.loli.net/2024/12/14/n2TNAVR5EycMsvF.png)

### CA 机构签名验签流程
公钥基础设施（Public Key Infrastructure, PKI）是一套系统，用于：
- 将用户身份与公钥绑定。
- 验证公钥的真实性，确保通信双方的身份可信。
- 支持数据加密和签名，确保通信的保密性、完整性和不可抵赖性。

数字证书认证机构(Certificate Authority, CA)将用户个人身份与公开密钥关联在一起。颁发出的数字签名证书包括：CA 信息、公钥用户信息、公钥、权威机构的签字、有效期。使用 CA 证书对包含服务器公钥的报文进行签名，浏览器可以验证报文是否被篡改。

签名步骤：
- 服务器端生成公钥和私钥
- 服务器端将公钥等信息，哈希之后发送给 CA 机构
- CA 机构使用私钥对信息进行签名
- 服务器端将数字证书发送给客户端

验签步骤：
- 客户端使用 CA 机构的公钥对签名进行解密
- 客户端使用哈希算法对信息进行哈希
- 客户端对比计算和解密后的哈希值，如果一致，则说明信息未被篡改
![签名验签](https://s2.loli.net/2024/12/15/ySiudc2nmE1QazF.png)

### DH 密钥交换
解决了客户端拿到服务器端公钥过程中可能出现的问题之后，客户端和服务器端需要协商一个对称加密的密钥。如果客户端仅仅使用服务器端的公钥对对称密钥进行加密，会出现前向保密性问题：一旦服务器的私钥被泄漏，过往所有的报文都能被破解。

DH 密钥可以让双方在完全没有对方任何预先信息的条件下通过不安全信道创建起一个密钥。DH 的思路如下：
- 双方共同协商随机数
- A 方使用自己的密钥 a 对随机数进行加密， B 方使用自己的密钥 b 对随机数加密
- 双方交换加密后的随机数
- 双方使用自己的密钥对交换后的随机数进行计算，得到相同的数字
![DH 算法](https://s2.loli.net/2024/12/15/Cn964jxWtXGiqEB.png)

DH 算法也有中间人伪造攻击的可能：
- 向 Alice 假装自己是 Bob，进行一次 DH 密钥交换
- 向 Bob 假装自己是 Alice，进行一次 DH 密钥交换

采用 CA 机构签名验签的方式，可以解决中间人伪造攻击。总体流程为：
- 服务器端：
  - 生成 Diffie-Hellman 参数：a, A = g^a mod p。
  - 对 (A, g, p, Randoms) 用私钥 SK_server 签名，生成 S。
  - 将证书、签名 S、参数 (A, g, p) 发送给客户端。

- 客户端：
  - 验证证书，确认服务器公钥可信。
  - 验证签名 S，确保 A, g, p 未被篡改。
  - 生成 b 和 B = g^b mod p。
  - 计算共享密钥：K = A^b mod p。
  - 发送 B 给服务器。

- 服务器端：
  - 接收 B，计算共享密钥：K = B^a mod p。



# HTTP 协议
## 同源策略
限制了从同一个源加载的文档或脚本如何与另一个源的资源进行交互。安全性与可用性需要一个平衡点。

可用性：HTML 的创作者决定跨域请求是否对本站点安全
- `<script> <img> <iframe> <link> <video> <audio>` 带有 src 属性可以跨域访问
  - 本质是浏览器发起http get 请求，去拿这些资源，加载到本地使用，这一步骤不受同源策略影响。但如果库里含有跨域请求，同样也受同源策略限制
    ```html
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script> // 可以

    <script src="./b.js"></script> // b中 axios.get('https://example.com/api/data') 不可以
    ```
- 允许跨域写操作：例如表单提交或者重定向请求
- CSRF安全性问题
  - 使用 referer 解决，有可能浏览器不支持
  - 使用唯一 token 验证


安全性：浏览器需要防止站点 A 的脚本向站点 B 发起危险动作
- Cookie、LocalStorage 和 IndexDB 无法读取
- DOM 无法获得（防止跨域脚本篡改 DOM 结构）
- AJAX 请求不能发送

### CORS
CORS 是最为规范和安全的跨域方法。浏览器同源策略下的跨域访问解决方案：
- 如果站点 A 允许站点 B 的脚本访问其资源，必须在 HTTP 响应中显式的告知浏览器：站点B是被允许的
  - 访问站点 A 的请求，浏览器应告知该请求来自站点 B
  - 站点 A 的响应中，应明确哪些跨域请求是被允许的

**策略 1：何为简单请求？**
- GET/HEAD/POST 方法之一
- 仅能使用 CORS 安全的头部：Accept、Accept-Language、Content-Language、Content-Type
- Content-Type 值只能是： text/plain、multipart/form-data、application/x-www-form-urlencoded三者其中之一

简单请求的跨域访问：
- 请求中携带 origin 告知是哪一个域
- 响应中携带 Access-Control-Allow-Origin 头部表示允许哪些域
- 浏览器放行（一般来讲，服务器都会做返回，浏览器来做对比放行）




**策略 2：简单请求以外的其他请求**
- 访问资源前，需要先发起 prefilght 预检请求（方法为 OPTIONS）询问何种请求是被允许的

预检请求：
- 预检请求头部
  - Access-Control-Request-Method：告知请求方法
  - Access-Control-Request-Headers：告知请求头
- 预检请求响应
  - Access-Control-Allow-Methods：告知允许哪些方法
  - Access-Control-Allow-Headers：告知允许哪些头部
  - Access-Control-Max-Age：告知预检请求的有效期  

请求头部
- Origin（RFC6454）：一个页面的资源可能来自于多个域名，在AJAX 等子请求中标明来源于某个域名下的脚本，以通过服务器的安全校验
  - origin = "Origin:" OWS origin-list-or-null OWS
  - origin-list-or-null = %x6E %x75 %x6C %x6C / origin-list
  - origin-list = serialized-origin *( SP serialized-origin )
  - serialized-origin = scheme "://" host [ ":" port ]
- Access-Control-Request-Method
  - 在 preflight 预检请求 (OPTIONS) 中，告知服务器接下来的请求会使用哪些方法
- Access-Control-Request-Headers
  - 在 preflight 预检请求 (OPTIONS) 中，告知服务器接下来的请求会传递哪些头部

响应头部
- Access-Control-Allow-Methods
  - 在 preflight 预检请求的响应中，告知客户端后续请求允许使用的方法
- Access-Control-Allow-Headers
  - 在 preflight 预检请求的响应中，告知客户端后续请求允许携带的头部
- Access-Control-Max-Age
  - 在 preflight 预检请求的响应中，告知客户端该响应的信息可以缓存多久
- Access-Control-Expose-Headers
  - 告知浏览器哪些响应头部可以供客户端使用，默认情况下只有 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 可供使用
- Access-Control-Allow-Origin
  - 告知浏览器允许哪些域访问当前资源，*表示允许所有域。为避免缓存错乱，响应中需要携带Vary: Origin
- Access-Control-Allow-Credentials
  - 告知浏览器是否可以将 Credentials 暴露给客户端使用，Credentials 包含 cookie、authorization 类头部、TLS证书等。



## HTTP 响应码
成功响应码以 1xx、2xx、3xx 开头，错误响应码以 4xx、5xx 开头。
- 1xx：请求已接收到，需要进一步处理才能完成，HTTP1.0 不支持
  - 100 Continue：上传大文件前使用
    - 由客户端发起请求中携带 Expect: 100-continue 头部触发
  - 101 Switch Protocols：协议升级使用
    - 由客户端发起请求中携带 Upgrade: 头部触发，如升级 websocket 或者http/2.0
- 2xx：成功处理请求
  - 200 OK: 成功返回响应
  - 201 Created: 成功创建资源(PUT请求)
- 3xx：重定向使用 Location 指向的资源或者缓存中的资源。在RFC2068中规定客户端重定向次数不应超过 5 次，以防止死循环。
  - 301 Moved Permanently：资源永久性的重定向到另一个URI 中
  - 302 Found：资源临时的重定向到另一个 URI 中。
  - 304 Not Modified：当客户端拥有可能过期的缓存时，会携带缓存的标识etag、时间等信息询问服务器缓存是否仍可复用，而304是告诉客户端可以复用缓存。

- 4xx：客户端出现错误
  - 400 Bad Request：服务器认为客户端出现了错误，但不能明确判断为以下哪种错误时使用此错误码。例如HTTP请求格式错误。
  - 401 Unauthorized：用户认证信息缺失或者不正确，导致服务器无法处理请求。
  - 403 Forbidden：服务器理解请求的含义，但没有权限执行此请求
  - 404 Not Found：服务器没有找到对应的资源
  - 405 Method Not Allowed：服务器不支持请求行中的 method 方法（例如 trace 方法）
  - 413 Payload Too Large/Request Entity Too Large：请求的包体超出服务器能处理的最大长度（WordPress对文件的要求是2m）
- 5xx：服务器错误
  - 500 Internal Server Error：服务器内部错误，且不属于以下错误类型
  - 501 Not Implemented：服务器不支持实现请求所需要的功能
  - 502 Bad Gateway：代理服务器无法获取到合法响应

## HTTP 缓存
客户端和服务器端，都会对资源进行缓存。HTTP 缓存能有效减少时延，并且减少带宽消耗。
curl 一个会被缓存的资源如下：
```bash
curl 'https://static.nowcoder.com/fe/file/logo/1.png' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'Referer: https://www.nowcoder.com/' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' -I 
```
返回结果为 200:
```bash
HTTP/2 200 
server: Tengine
content-type: image/png
content-length: 2360
date: Mon, 16 Dec 2024 09:52:50 GMT
x-oss-request-id: 675FF8727CC18139363CEF49
x-oss-cdn-auth: success
accept-ranges: bytes
x-oss-object-type: Normal
x-oss-storage-class: Standard
cache-control: max-age=315360000
x-oss-version-id: CAEQchiBgMCnivHzsxgiIDE4ZWQ4ZTVlZTg4ODQ2NDliYjg3MDFlMzA5NWI3YzU3
content-md5: g6d3yOcYpcNYBbsnYGGD/Q==
x-oss-server-time: 25
via: cache6.l2cn7492[0,0,304-0,H], cache35.l2cn7492[0,0], kunlun12.cn8001[0,0,200-0,H], kunlun12.cn8001[2,0]
vary: Origin
etag: "83A777C8E718A5C35805BB27606183FD"
last-modified: Thu, 23 Feb 2023 06:31:48 GMT
x-oss-hash-crc64ecma: 7835832694211504772
age: 99447
ali-swift-global-savetime: 1734342770
x-cache: HIT TCP_MEM_HIT dirn:-2:-2
x-swift-savetime: Mon, 16 Dec 2024 09:52:50 GMT
x-swift-cachetime: 691200
access-control-allow-origin: *
access-control-allow-credentials: true
timing-allow-origin: *
eagleid: dcb5a62017344422171651522e
```
为请求添加
```bash
curl 'https://static.nowcoder.com/fe/file/logo/1.png' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'Referer: https://www.nowcoder.com/' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' -H 'if-none-match: "83A777C8E718A5C35805BB27606183FD"' -I
```
 后，返回结果为 304。响应结果中 content-length 为 0，节省了大量带宽。
 ```bash
 HTTP/2 304 
server: Tengine
date: Mon, 16 Dec 2024 09:52:50 GMT
x-oss-request-id: 675FF8727CC18139363CEF49
x-oss-cdn-auth: success
accept-ranges: bytes
x-oss-object-type: Normal
x-oss-storage-class: Standard
cache-control: max-age=315360000
x-oss-version-id: CAEQchiBgMCnivHzsxgiIDE4ZWQ4ZTVlZTg4ODQ2NDliYjg3MDFlMzA5NWI3YzU3
content-md5: g6d3yOcYpcNYBbsnYGGD/Q==
x-oss-server-time: 25
via: cache6.l2cn7492[0,0,304-0,H], cache35.l2cn7492[0,0], kunlun12.cn8001[0,0,304-0,H], kunlun13.cn8001[2,0]
vary: Origin
etag: "83A777C8E718A5C35805BB27606183FD"
last-modified: Thu, 23 Feb 2023 06:31:48 GMT
x-oss-hash-crc64ecma: 7835832694211504772
age: 100896
ali-swift-global-savetime: 1734342770
x-cache: HIT TCP_IMS_HIT dirn:-2:-2
x-swift-savetime: Mon, 16 Dec 2024 09:52:50 GMT
x-swift-cachetime: 691200
access-control-allow-origin: *
access-control-allow-credentials: true
timing-allow-origin: *
eagleid: dcb5a62117344436667782245e
 ```
 这个缓存机制如下：
 - If-None-Match 头部用于缓存验证。它包含了之前请求资源的 ETag 值（在上述例子是 "83A777C8E718A5C35805BB27606183FD"）。服务器使用这个值来判断客户端是否有最新的资源。
 - 当服务器接收到带有 If-None-Match 的请求时，它会检查当前资源的 ETag。如果资源没有被修改，它会返回 304 Not Modified，告知客户端可以使用缓存中的版本，而无需重新传输资源。

 ### 私有缓存和共享缓存
 - 私有缓存：仅供一个用户使用的缓存，通常只存在于如浏览器这样的客户端上
 - 共享缓存：可以供多个用户的缓存，存在于网络中负责转发消息的代理服务器（对热点资源常使用共享缓存，以减轻源服务器的压力，并提升网络效率）
   - Authentication 响应不可被代理服务器缓存
   - 正向代理
   - 反向代理

如何判断请求一个数据时，是代理服务器返回的，还是源服务器返回的呢？当返回响应头中包含 age 时，表示是代理服务器返回，存在时间为 age 秒。判断代理服务器响应是否过期的过程如下图：
![age](https://s2.loli.net/2024/12/17/NefQ9bGXwRCVzHd.png)

缓存实现原理如下图：
![缓存实现原理](https://s2.loli.net/2024/12/17/pDO2c59budjJKCZ.png)

### 判断缓存是否过期
- response_is_fresh = (freshness_lifetime > current_age)
  - freshness_lifetime：按优先级，取以下响应头部的值
    - s-maxage > max-age > Expires > 预估过期时间
    - 例如：
      - Cache-Control: s-maxage=3600
      - Cache-Control: max-age=86400
      - Expires: Fri, 03 May 2019 03:15:20 GMT
        - Expires = HTTP-date，指明缓存的绝对过期时间

在 nginx 中配置如下，如果存在 s-maxage，则不会考虑 max-age。
![nginx](https://s2.loli.net/2024/12/17/Z3bfVHivK68FX1M.png)

当服务器没有显式指定 max-age 过期时间时候，我们也需要预计过期时间，RFC7234 推荐：（DownloadTime– LastModified)*10%。

age 表示表示自源服务器发出响应（或者验证过期缓存），到使用缓存的响应发出时经过的秒数
- 对于代理服务器管理的共享缓存，客户端可以根据 Age 头部判断缓存时间
- Age = delta-seconds

current_age 计算：current_age = corrected_initial_age + resident_time;
-  resident_time = now - response_time(接收到响应的时间);
-  corrected_initial_age = max(apparent_age, corrected_age_value); 
  - corrected_age_value = age_value + response_delay; 
    - response_delay = response_time - request_time(发起请求的时间); 
  - apparent_age = max(0, response_time - date_value);

经过层层代理的响应的 age 计算方式如下：
![age计算](https://s2.loli.net/2024/12/17/13KmdhkXFATcDOo.png)

### cache-control 在请求和响应中的不同取值
下图中，红色表示后面需要跟 = 值，黑色表示该字段可以直接使用，蓝色表示既可以赋具体的值，又可以直接使用。
![cache-control](https://s2.loli.net/2024/12/17/iPJsOuEjvZ9IebU.png)

- cache-control 在请求中的值
  - max-age：告诉服务器，客户端不会接受 Age 超出 max-age 秒的缓存
  - max-stale：告诉服务器，即使缓存不再新鲜，但陈旧秒数没有超出 max-stale 时，客户端仍打算使用。若 max-stale 后没有值，则表示无论过期多久客户端都可使用
  - min-fresh：告诉服务器，Age 至少经过 min-fresh 秒后缓存才可使用
  - no-cache：告诉服务器，不能直接使用已有缓存作为响应返回，除非带着缓存条件到上游服务端得到 304 验证返回码才可使用现有缓存
  - no-store：告诉各代理服务器不要对该请求的响应缓存（实际有不少不遵守该规定的代理服务器）
  - no-transform：告诉代理服务器不要修改消息包体的内容
  - only-if-cached：告诉服务器仅能返回缓存的响应，否则若没有缓存则返回504 错误码
- cache-control 在响应中的值
  - must-revalidate：告诉客户端一旦缓存过期，必须向服务器验证后才可使用
  - proxy-revalidate：与 must-revalidate 类似，但它仅对代理服务器的共享缓存有效
  - no-cache：告诉客户端不能直接使用缓存的响应，使用前必须在源服务器验证得到 304 返回码。如果 no-cache 后指定头部，则若客户端的后续请求及响应中不含有这些头则可直接使用缓存
  - max-age：告诉客户端缓存 Age 超出 max-age 秒后则缓存过期
  - s-maxage：与 max-age 相似，但仅针对共享缓存，且优先级高于max-age和Expires
  - public：表示无论私有缓存或者共享缓存，皆可将该响应缓存
  - private：表示该响应不能被代理服务器作为共享缓存使用。若private 后指定头部，则在告诉代理服务器不能缓存指定的头部，但可缓存其他部分
  - no-store：告诉所有下游节点不能对响应进行缓存
  - no-transform：告诉代理服务器不能修改消息包体的内容


### 什么样的响应会被缓存
**什么样的响应会被缓存？**
- 请求方法可以被缓存理解（不只于 GET 方法）
- 响应码可以被缓存理解（404、206 也可以被缓存）
- 响应与请求的头部没有指明 no-store
- 响应中至少应含有以下头部中的 1 个或者多个：
  - Expires、max-age、s-maxage、public
- 当响应中没有明确指示过期时间的头部时，如果响应码非常明确，也可以缓存
- 如果缓存在代理服务器上
  - 不含有 private
  - 不含有 Authorization

**使用缓存作为响应时，需要满足以下条件：**
- URI 是匹配的
  - URI 作为主要的缓存关键字，当一个 URI 同时对应多份缓存时，选择日期最近的缓存
  - 例如 Nginx 中默认的缓存关键字：proxy_cache_key
  - $scheme$proxy_host$request_uri;
- 缓存中的响应允许当前请求的方法使用缓存
- 缓存中的响应 Vary 头部指定的头部必须与请求中的头部相匹配：
  - Vary = “*” / 1#field-name
    - Vary: *意味着一定匹配失败
- 当前请求以及缓存中的响应都不包含 no-cache 头部（Pragma: no-cache 或者Cache-Control: no-cache）
- 缓存中的响应必须是以下三者之一：
  - 新鲜的（时间上未过期）
  - 缓存中的响应头部明确告知可以使用过期的响应（如 Cache-Control: max-stale=60）
  - 使用条件请求去服务器端验证请求是否过期，得到 304 响应

下面是一个典型的使用 vary 的例子。缓存中使用 gzip 压缩格式，那么，即使所有关键字都一致，也无法使用缓存。
![Vary](https://s2.loli.net/2024/12/17/D8Y9drnfSZVxka7.png)



# 浏览器渲染

当浏览器的网络线程收到 HTML 文档后，会产生一个渲染任务，并将其传递给渲染主线程的消息队列。在事件循环机制的作用下，渲染主线程取出消息队列中的渲染任务，开启渲染流程。

整个渲染流程分为多个阶段，分别是： HTML 解析、样式计算、布局、分层、绘制、分块、光栅化、画，每个阶段都有明确的输入输出，上一个阶段的输出会成为下一个阶段的输入。

这样，整个渲染流程就形成了一套组织严密的生产流水线。下面这张图展示了渲染时机(事件循环排队到合适时间调用)，和渲染流程（预解析线程、主线程、合成线程、GPU 进程）。

![渲染时机和渲染流程](https://s2.loli.net/2024/12/15/TqBIjG84VMt9HCK.png)

## 渲染流水线
### 渲染主线程
1. 解析 HTML

解析过程中遇到 CSS 解析 CSS，遇到 JS 执行 JS。为了提高解析效率，浏览器在开始解析前，会启动一个预解析的线程，率先下载 HTML 中的外部 CSS 文件和 外部的 JS 文件。

如果主线程解析到 link 位置，此时外部的 CSS 文件还没有下载解析好，主线程不会等待，继续解析后续的 HTML。这是因为下载和解析 CSS 的工作是在预解析线程中进行的。这就是 CSS 不会阻塞 HTML 解析的根本原因。

如果主线程解析到 script 位置，会停止解析 HTML，转而等待 JS 文件下载好，并将全局代码解析执行完成后，才能继续解析 HTML。这是因为 JS 代码的执行过程可能会修改当前的 DOM 树，所以 DOM 树的生成必须暂停。这就是 JS 会阻塞 HTML 解析的根本原因。

第一步完成后，会得到 DOM 树和 CSSOM 树，浏览器的默认样式、内部样式、外部样式、行内样式均会包含在 CSSOM 树中。

2. 计算属性

主线程会遍历得到的 DOM 树，依次为树中的每个节点计算出它最终的样式，称之为 Computed Style。在这一过程中，很多预设值会变成绝对值，比如 red 会变成 rgb(255,0,0) ；相对单位会变成绝对单位，比如 em 会变成 px。这一步完成后，会得到一棵带有样式的 DOM 树。

3. 布局

布局阶段会依次遍历 DOM 树的每一个节点，计算每个节点的几何信息。例如节点的宽高尺寸、相对包含块的位置。大部分时候，DOM 树和布局树并非一一对应。比如`display:none`的节点没有几何信息，因此不会生成到布局树；又比如使用了伪元素选择器，虽然 DOM 树中不存在这些伪元素节点，但它们拥有几何信息，所以会生成到布局树中。还有匿名行盒、匿名块盒等等都会导致 DOM 树和布局树无法一一对应。

4. 分层

得到布局树之后，主线程会使用一套复杂的策略对整个布局树中进行分层。分层的好处在于，将来某一个层改变后，仅会对该层进行后续处理，从而提升效率。
滚动条、堆叠上下文、transform、opacity 等样式都会或多或少的影响分层结果，也可以通过 will-change 属性更大程度的影响分层结果。

5. 绘制

主线程会为每个层单独产生绘制指令集，用于描述这一层的内容该如何画出来。完成绘制后，主线程将每个图层的绘制信息提交给合成线程，剩余工作将由合成线程完成。合成线程首先对每个图层进行分块，将其划分为更多的小区域。它会从线程池中拿取多个线程来完成分块工作。

### 合成线程

1. 分块
2. 光栅化

分块完成后，进入光栅化阶段。合成线程会将块信息交给 GPU 进程，以极高的速度完成光栅化。GPU 进程会开启多个线程来完成光栅化，并且优先处理靠近视口区域的块。光栅化的结果，就是一块一块的位图。

3. 画

合成线程拿到每个层、每个块的位图后，生成一个个「指引（quad）」信息。指引会标识出每个位图应该画到屏幕的哪个位置，以及会考虑到旋转、缩放等变形。变形发生在合成线程，与渲染主线程无关，这就是`transform`效率高的本质原因。

合成线程会把 quad 提交给 GPU 进程，由 GPU 进程产生系统调用，提交给 GPU 硬件，完成最终的屏幕成像。

## 渲染效率问题
### 重排与重绘
reflow 的本质就是重新计算 layout 树。几何属性更改。当进行了会影响布局树的操作后，（例如修改DOM和CSSOM）需要重新计算布局树，会引发 layout。为了避免连续的多次操作导致布局树反复计算，浏览器会合并这些操作，当 JS 代码全部完成后再进行统一计算。所以，改动属性造成的 reflow 是异步完成的。也同样因为如此，当 JS 获取布局属性时，就可能造成无法获取到最新的布局信息。

浏览器在反复权衡下，最终决定获取属性立即 reflow。

```javascript
dom.style.width = '100px';   // 记录样式修改
dom.style.height = '100px';  // 记录样式修改
dom.style.padding = '100px'; // 记录样式修改

// 强制执行回流，立即计算最新的布局信息，并返回 clientWidth 的值
console.log(dom.clientWidth); 
// 上述三个步骤，会将修改记录下来放入回流的异步消息队列，合适时候执行。计算布局属性，会产生一个同步任务强制执行回流。
```

repaint 的本质就是重新根据分层信息计算了绘制指令。视觉属性更改。当改动了可见样式后，就需要重新计算，会引发 repaint。由于元素的布局信息也属于可见样式，所以 reflow 一定会引起 repaint。（repaint 虽然会修改cssom树和computed style树，但是layout树只包含布局信息）



### transform 和滚动条拖动

因为 transform 既不会影响布局也不会影响绘制指令，它影响的只是渲染流程的最后一个「draw」阶段，由于 draw 阶段在合成线程中，所以 transform 的变化几乎不会影响渲染主线程。反之，渲染主线程无论如何忙碌，也不会影响 transform 的变化。

另外，由于分层信息是独立的，渲染主线程死循环时候，不影响滚动条拖动。滚动条是在单独的图层进行重排。页面是指在合成线程中，GPU draw的这一步，重新画视口的内容。


### async 和 defer
![async 和 defer](https://s2.loli.net/2024/12/15/uXZPkFJqCEM6Ypg.png)
