! function(t, n) {
    "object" == typeof exports && "object" == typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define([], n) : "object" == typeof exports ? exports.AniCursor = n() : t.AniCursor = n()
}(this, () => (() => {
    "use strict";
    var t = {
            137: (t, n, e) => {
                function r(t, n, e = 0, r = t.length) {
                    if (r % n) throw new Error("Bad buffer length.");
                    for (let a = e; a < r; a += n) i(t, n, a)
                }

                function i(t, n, e) {
                    n--;
                    for (let r = 0; r < n; r++) {
                        let i = t[e + r];
                        t[e + r] = t[e + n], t[e + n] = i, n--
                    }
                }

                function a(t, n, e = 0) {
                    for (let r = 0, i = t.length; r < i; r++) {
                        let i = t.codePointAt(r);
                        if (i < 128) n[e] = i, e++;
                        else {
                            let t = 0,
                                a = 0;
                            for (i <= 2047 ? (t = 1, a = 192) : i <= 65535 ? (t = 2, a = 224) : i <= 1114111 && (t = 3, a = 240, r++), n[e] = (i >> 6 * t) + a, e++; t > 0;) n[e] = 128 | i >> 6 * (t - 1) & 63, e++, t--
                        }
                    }
                    return e
                }
                e.r(n), e.d(n, {
                    pack: () => b,
                    packArray: () => k,
                    packArrayTo: () => l,
                    packString: () => c,
                    packStringTo: () => f,
                    packTo: () => d,
                    unpack: () => m,
                    unpackArray: () => g,
                    unpackArrayTo: () => p,
                    unpackString: () => h
                });
                class s {
                    constructor(t, n = !1, e = !1) {
                        this.bits = t, this.bytes = t < 8 ? 1 : Math.ceil(t / 8), this.max = Math.pow(2, t) - 1, this.min = 0;
                        let r = 8 - (1 + (t - 1 | 7) - t);
                        this.lastByteMask_ = Math.pow(2, r > 0 ? r : 8) - 1, this.unpack = this.unpackUnsigned_, n && (this.max = Math.pow(2, t) / 2 - 1, this.min = -this.max - 1, this.unpack = this.unpackSigned_), e && (this.overflow_ = this.overflowClamp_)
                    }
                    pack(t, n, e = 0) {
                        if (n != n || n.constructor != Number) throw new TypeError;
                        n = this.overflow_(n), t[e] = 255 & (n < 0 ? n + Math.pow(2, this.bits) : n), e++;
                        for (let r = 2, i = this.bytes; r < i; r++) t[e] = 255 & Math.floor(n / Math.pow(2, 8 * (r - 1))), e++;
                        return this.bits > 8 && (t[e] = Math.floor(n / Math.pow(2, 8 * (this.bytes - 1))) & this.lastByteMask_, e++), e
                    }
                    unpack_(t, n = 0) {
                        let e = 0;
                        for (let r = 0; r < this.bytes; r++) e += t[n + r] * Math.pow(256, r);
                        return e
                    }
                    unpackUnsigned_(t, n = 0) {
                        return this.overflow_(this.unpack_(t, n))
                    }
                    unpackSigned_(t, n = 0) {
                        return this.overflow_(this.sign_(this.unpack_(t, n)))
                    }
                    overflow_(t) {
                        if (t > this.max || t < this.min) throw new RangeError;
                        return t
                    }
                    overflowClamp_(t) {
                        return t > this.max ? this.max : t < this.min ? this.min : t
                    }
                    sign_(t) {
                        return t > this.max && (t -= 2 * this.max + 2), t
                    }
                }
                class o {
                    constructor(t, n) {
                        this.ebits = t, this.fbits = n, this.bias = (1 << t - 1) - 1, this.numBytes = Math.ceil((t + n) / 8), this.biasP2 = Math.pow(2, this.bias + 1), this.ebitsFbits = t + n, this.fbias = Math.pow(2, -(8 * this.numBytes - 1 - t))
                    }
                    pack(t, n, e) {
                        if ("number" != typeof n) throw new TypeError;
                        Math.abs(n) > this.biasP2 - 2 * this.ebitsFbits && (n = n < 0 ? -1 / 0 : 1 / 0);
                        let r = ((n = +n) || 1 / n) < 0 || n < 0 ? 1 : 0;
                        n = Math.abs(n);
                        let i = Math.min(Math.floor(Math.log(n) / Math.LN2), 1023),
                            a = u(n / Math.pow(2, i) * Math.pow(2, this.fbits));
                        return n != n ? (a = Math.pow(2, this.fbits - 1), i = (1 << this.ebits) - 1) : 0 !== n && (n >= Math.pow(2, 1 - this.bias) ? (a / Math.pow(2, this.fbits) >= 2 && (i += 1, a = 1), i > this.bias ? (i = (1 << this.ebits) - 1, a = 0) : (i += this.bias, a = u(a) - Math.pow(2, this.fbits))) : (a = u(n / Math.pow(2, 1 - this.bias - this.fbits)), i = 0)), this.packFloatBits_(t, e, r, i, a)
                    }
                    unpack(t, n) {
                        let e, r = (1 << this.ebits) - 1,
                            i = "";
                        for (let e = this.numBytes - 1; e >= 0; e--) {
                            let r = t[e + n].toString(2);
                            i += "00000000".substring(r.length) + r
                        }
                        let a = "1" == i.charAt(0) ? -1 : 1;
                        i = i.substring(1);
                        let s = parseInt(i.substring(0, this.ebits), 2);
                        return i = i.substring(this.ebits), s == r ? 0 !== parseInt(i, 2) ? NaN : a * (1 / 0) : (0 === s ? (s += 1, e = parseInt(i, 2)) : e = parseInt("1" + i, 2), a * e * this.fbias * Math.pow(2, s - this.bias))
                    }
                    packFloatBits_(t, n, e, r, i) {
                        let a = [];
                        a.push(e);
                        for (let t = this.ebits; t > 0; t -= 1) a[t] = r % 2 ? 1 : 0, r = Math.floor(r / 2);
                        let s = a.length;
                        for (let t = this.fbits; t > 0; t -= 1) a[s + t] = i % 2 ? 1 : 0, i = Math.floor(i / 2);
                        let o = a.join(""),
                            u = this.numBytes + n - 1,
                            h = n;
                        for (; u >= n;) t[u] = parseInt(o.substring(0, 8), 2), o = o.substring(8), u--, h++;
                        return h
                    }
                }

                function u(t) {
                    let n = Math.floor(t),
                        e = t - n;
                    return e < .5 ? n : e > .5 || n % 2 ? n + 1 : n
                }

                function h(t, n = 0, e = t.length) {
                    return function(t, n = 0, e = t.length) {
                        let r = "";
                        for (let i = n; i < e;) {
                            let n = 128,
                                e = 191,
                                a = !1,
                                s = t[i++];
                            if (s >= 0 && s <= 127) r += String.fromCharCode(s);
                            else {
                                let o = 0;
                                s >= 194 && s <= 223 ? o = 1 : s >= 224 && s <= 239 ? (o = 2, 224 === t[i] && (n = 160), 237 === t[i] && (e = 159)) : s >= 240 && s <= 244 ? (o = 3, 240 === t[i] && (n = 144), 244 === t[i] && (e = 143)) : a = !0, s &= (1 << 8 - o - 1) - 1;
                                for (let r = 0; r < o; r++)(t[i] < n || t[i] > e) && (a = !0), s = s << 6 | 63 & t[i], i++;
                                a ? r += String.fromCharCode(65533) : s <= 65535 ? r += String.fromCharCode(s) : (s -= 65536, r += String.fromCharCode(55296 + (s >> 10 & 1023), 56320 + (1023 & s)))
                            }
                        }
                        return r
                    }(t, n, e)
                }

                function c(t) {
                    let n = [];
                    return a(t, n, 0), n
                }

                function f(t, n, e = 0) {
                    return a(t, n, e)
                }

                function l(t, n, e, i = 0, a = !1) {
                    let s = S((n = n || {}).bits, n.fp, n.signed, a),
                        o = Math.ceil(n.bits / 8),
                        u = 0,
                        h = i;
                    try {
                        for (let n = t.length; u < n; u++) i = s.pack(e, t[u], i);
                        n.be && r(e, o, h, i)
                    } catch (n) {
                        w(n, t[u], u)
                    }
                    return i
                }

                function p(t, n, e, i = 0, a = t.length, s = !1, o = !1) {
                    let u = S((n = n || {}).bits, n.fp, n.signed, o),
                        h = Math.ceil(n.bits / 8);
                    a = function(t, n, e, r, i) {
                        let a = (e - n) % r;
                        if (i && (a || t.length < r)) throw new Error("Bad buffer length");
                        return e - a
                    }(t, i, a, h, s);
                    let c = 0,
                        f = i;
                    try {
                        for (n.be && r(t, h, i, a); f < a; f += h, c++) e[c] = u.unpack(t, f);
                        n.be && r(t, h, i, a)
                    } catch (n) {
                        w(n, t.slice(f, f + h), f)
                    }
                }

                function d(t, n, e, r = 0, i = !1) {
                    return l([t], n, e, r, i)
                }

                function b(t, n, e = !1) {
                    let r = [];
                    return d(t, n, r, 0, e), r
                }

                function k(t, n, e = !1) {
                    let r = [];
                    return l(t, n, r, 0, e), r
                }

                function g(t, n, e = 0, r = t.length, i = !1, a = !1) {
                    let s = [];
                    return p(t, n, s, e, r, i, a), s
                }

                function m(t, n, e = 0, r = !1) {
                    return g(t, n, e, e + Math.ceil(n.bits / 8), !0, r)[0]
                }

                function w(t, n, e) {
                    throw t.message = t.constructor.name + " at index " + e + ": " + n, t
                }

                function S(t, n, e, r) {
                    return n ? function(t) {
                        if (!t || 16 !== t && 32 !== t && 64 !== t) throw new Error(y + ": float, bits: " + t)
                    }(t) : function(t) {
                        if (!t || t < 1 || t > 53) throw new Error(y + ": int, bits: " + t)
                    }(t), n && 16 === t ? new o(5, 11) : n && 32 == t ? new o(8, 23) : n && 64 == t ? new o(11, 52) : new s(t, e, r)
                }
                const y = "Unsupported type"
            },
            249: (t, n, e) => {
                e.r(n), e.d(n, {
                    RIFFFile: () => i
                });
                var r = e(137);
                class i {
                    constructor() {
                        this.container = "", this.chunkSize = 0, this.format = "", this.signature = null, this.head = 0, this.uInt32 = {
                            bits: 32,
                            be: !1,
                            signed: !1,
                            fp: !1
                        }, this.supported_containers = ["RIFF", "RIFX"]
                    }
                    setSignature(t) {
                        if (this.head = 0, this.container = this.readString(t, 4), -1 === this.supported_containers.indexOf(this.container)) throw Error("Not a supported format.");
                        this.uInt32.be = "RIFX" === this.container, this.chunkSize = this.readUInt32(t), this.format = this.readString(t, 4), this.signature = {
                            chunkId: this.container,
                            chunkSize: this.chunkSize,
                            format: this.format,
                            subChunks: this.getSubChunksIndex_(t),
                            chunkData: {
                                start: 0,
                                end: this.chunkSize
                            }
                        }
                    }
                    findChunk(t, n = !1) {
                        let e = this.signature.subChunks,
                            r = [];
                        for (let i = 0; i < e.length; i++)
                            if (e[i].chunkId == t) {
                                if (!n) return e[i];
                                r.push(e[i])
                            } return "LIST" == t && r.length ? r : null
                    }
                    readString(t, n) {
                        let e = "";
                        return e = (0, r.unpackString)(t, this.head, this.head + n), this.head += n, e
                    }
                    readUInt32(t) {
                        let n = (0, r.unpack)(t, this.uInt32, this.head);
                        return this.head += 4, n
                    }
                    getSubChunksIndex_(t) {
                        let n = [],
                            e = this.head;
                        for (; e <= t.length - 8;) n.push(this.getSubChunkIndex_(t, e)), e += 8 + n[n.length - 1].chunkSize, e = e % 2 ? e + 1 : e;
                        return n
                    }
                    getSubChunkIndex_(t, n) {
                        let e = {
                            chunkId: this.getChunkId_(t, n),
                            chunkSize: this.getChunkSize_(t, n)
                        };
                        if ("LIST" == e.chunkId) e.format = (0, r.unpackString)(t, n + 8, n + 12), this.head += 4, e.subChunks = this.getSubChunksIndex_(t);
                        else {
                            let t = e.chunkSize % 2 ? e.chunkSize + 1 : e.chunkSize;
                            this.head = n + 8 + t, e.chunkData = {
                                start: n + 8,
                                end: this.head
                            }
                        }
                        return e
                    }
                    getChunkId_(t, n) {
                        return this.head += 4, (0, r.unpackString)(t, n, n + 4)
                    }
                    getChunkSize_(t, n) {
                        return this.head += 4, (0, r.unpack)(t, this.uInt32, n + 4)
                    }
                }
            },
            579: function(t, n, e) {
                var r = this && this.__read || function(t, n) {
                        var e = "function" == typeof Symbol && t[Symbol.iterator];
                        if (!e) return t;
                        var r, i, a = e.call(t),
                            s = [];
                        try {
                            for (;
                                (void 0 === n || n-- > 0) && !(r = a.next()).done;) s.push(r.value)
                        } catch (t) {
                            i = {
                                error: t
                            }
                        } finally {
                            try {
                                r && !r.done && (e = a.return) && e.call(a)
                            } finally {
                                if (i) throw i.error
                            }
                        }
                        return s
                    },
                    i = this && this.__spread || function() {
                        for (var t = [], n = 0; n < arguments.length; n++) t = t.concat(r(arguments[n]));
                        return t
                    };
                Object.defineProperty(n, "__esModule", {
                    value: !0
                }), n.convertAniBinaryToCSS = void 0;
                var a = e(956),
                    s = 1e3 / 60;
                n.convertAniBinaryToCSS = function(t, n) {
                    var e = function(t) {
                            var n, e = a.parseAni(t),
                                r = null !== (n = e.rate) && void 0 !== n ? n : e.images.map(function() {
                                    return e.metadata.iDispRate
                                }),
                                o = r.reduce(function(t, n) {
                                    return t + n
                                }, 0),
                                u = e.images.map(function(t) {
                                    return {
                                        url: (n = t, "data:image/png;base64," + (e = n, window.btoa(String.fromCharCode.apply(String, i(e))))),
                                        percents: []
                                    };
                                    var n, e
                                }),
                                h = 0;
                            return r.forEach(function(t, n) {
                                var r = e.seq ? e.seq[n] : n;
                                u[r].percents.push(h / o * 100), h += t
                            }), {
                                duration: o * s,
                                frames: u
                            }
                        }(n),
                        r = "ani-cursor-" + u();
                    return "\n    @keyframes " + r + " {\n        " + e.frames.map(function(t) {
                        var n = t.url;
                        return t.percents.map(function(t) {
                            return t + "%"
                        }).join(", ") + " { cursor: url(" + n + "), auto; }"
                    }).join("\n") + "\n    }\n    " + t + ":hover {\n        animation: " + r + " " + e.duration + "ms step-end infinite;\n    }\n   "
                };
                var o = 0,
                    u = function() {
                        return o++
                    }
            },
            956: (t, n, e) => {
                Object.defineProperty(n, "__esModule", {
                    value: !0
                }), n.parseAni = void 0;
                var r = e(249),
                    i = e(137),
                    a = {
                        bits: 32,
                        be: !1,
                        signed: !1,
                        fp: !1
                    };
                n.parseAni = function(t) {
                    var n = new r.RIFFFile;
                    n.setSignature(t);
                    var e = n.signature;
                    if ("ACON" !== e.format) throw new Error('Expected format. Expected "ACON", got "' + e.format + '"');

                    function s(t, e) {
                        var r = n.findChunk(t);
                        return null == r ? null : e(r)
                    }

                    function o(n, e) {
                        return n.subChunks.slice(0, e).map(function(n) {
                            if ("icon" !== n.chunkId) throw new Error("Unexpected chunk type in fram: " + n.chunkId);
                            return t.slice(n.chunkData.start, n.chunkData.end)
                        })
                    }
                    var u = s("anih", function(n) {
                        var e = i.unpackArray(t, a, n.chunkData.start, n.chunkData.end);
                        return {
                            cbSize: e[0],
                            nFrames: e[1],
                            nSteps: e[2],
                            iWidth: e[3],
                            iHeight: e[4],
                            iBitCount: e[5],
                            nPlanes: e[6],
                            iDispRate: e[7],
                            bfAttributes: e[8]
                        }
                    });
                    if (null == u) throw new Error("Did not find anih");
                    var h = s("rate", function(n) {
                            return i.unpackArray(t, a, n.chunkData.start, n.chunkData.end)
                        }),
                        c = s("seq ", function(n) {
                            return i.unpackArray(t, a, n.chunkData.start, n.chunkData.end)
                        }),
                        f = n.findChunk("LIST", !0),
                        l = null == f ? void 0 : f.find(function(t) {
                            return "fram" === t.format
                        });
                    if (null == l) throw new Error("Did not find fram LIST");
                    var p = o(l, u.nFrames),
                        d = null,
                        b = null,
                        k = null == f ? void 0 : f.find(function(t) {
                            return "INFO" === t.format
                        });
                    return null != k && k.subChunks.forEach(function(n) {
                        switch (n.chunkId) {
                            case "INAM":
                                d = i.unpackString(t, n.chunkData.start, n.chunkData.end);
                                break;
                            case "IART":
                                b = i.unpackString(t, n.chunkData.start, n.chunkData.end);
                                break;
                            case "LIST":
                                "fram" === n.format && (p = o(n, u.nFrames))
                        }
                    }), {
                        images: p,
                        rate: h,
                        seq: c,
                        metadata: u,
                        artist: b,
                        title: d
                    }
                }
            }
        },
        n = {};

    function e(r) {
        var i = n[r];
        if (void 0 !== i) return i.exports;
        var a = n[r] = {
            exports: {}
        };
        return t[r].call(a.exports, a, a.exports, e), a.exports
    }
    return e.d = (t, n) => {
        for (var r in n) e.o(n, r) && !e.o(t, r) && Object.defineProperty(t, r, {
            enumerable: !0,
            get: n[r]
        })
    }, e.o = (t, n) => Object.prototype.hasOwnProperty.call(t, n), e.r = t => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(t, "__esModule", {
            value: !0
        })
    }, e(579)
})());