"use strict";
var HWPModule = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // public/hwp/build/esm.js
  var import_fs = { default: null }; // __toESM(__require("fs"));
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf2(o2) {
      return o2.__proto__ || Object.getPrototypeOf(o2);
    };
    return _getPrototypeOf(o);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf2(o2, p2) {
      o2.__proto__ = p2;
      return o2;
    };
    return _setPrototypeOf(o, p);
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function() {
      }));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }
    return _assertThisInitialized(self);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }
  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = void 0;
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err2) {
      _d = true;
      _e = err2;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function createCommonjsModule(fn, basedir, module) {
    return module = {
      path: basedir,
      exports: {},
      require: function(path, base) {
        return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
      }
    }, fn(module, module.exports), module.exports;
  }
  function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
  }
  var cfb = createCommonjsModule(function(module) {
    var Base64 = /* @__PURE__ */ (function make_b64() {
      var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      return {
        encode: function(input) {
          var o = "";
          var c1 = 0, c2 = 0, c3 = 0, e1 = 0, e2 = 0, e3 = 0, e4 = 0;
          for (var i = 0; i < input.length; ) {
            c1 = input.charCodeAt(i++);
            e1 = c1 >> 2;
            c2 = input.charCodeAt(i++);
            e2 = (c1 & 3) << 4 | c2 >> 4;
            c3 = input.charCodeAt(i++);
            e3 = (c2 & 15) << 2 | c3 >> 6;
            e4 = c3 & 63;
            if (isNaN(c2)) {
              e3 = e4 = 64;
            } else if (isNaN(c3)) {
              e4 = 64;
            }
            o += map.charAt(e1) + map.charAt(e2) + map.charAt(e3) + map.charAt(e4);
          }
          return o;
        },
        decode: function b64_decode(input) {
          var o = "";
          var c1 = 0, c2 = 0, c3 = 0, e1 = 0, e2 = 0, e3 = 0, e4 = 0;
          input = input.replace(/[^\w\+\/\=]/g, "");
          for (var i = 0; i < input.length; ) {
            e1 = map.indexOf(input.charAt(i++));
            e2 = map.indexOf(input.charAt(i++));
            c1 = e1 << 2 | e2 >> 4;
            o += String.fromCharCode(c1);
            e3 = map.indexOf(input.charAt(i++));
            c2 = (e2 & 15) << 4 | e3 >> 2;
            if (e3 !== 64) {
              o += String.fromCharCode(c2);
            }
            e4 = map.indexOf(input.charAt(i++));
            c3 = (e3 & 3) << 6 | e4;
            if (e4 !== 64) {
              o += String.fromCharCode(c3);
            }
          }
          return o;
        }
      };
    })();
    var has_buf = typeof Buffer !== "undefined" && typeof process !== "undefined" && typeof process.versions !== "undefined" && process.versions.node;
    var Buffer_from = function() {
    };
    if (typeof Buffer !== "undefined") {
      var nbfs = !Buffer.from;
      if (!nbfs) try {
        Buffer.from("foo", "utf8");
      } catch (e) {
        nbfs = true;
      }
      Buffer_from = nbfs ? function(buf, enc) {
        return enc ? new Buffer(buf, enc) : new Buffer(buf);
      } : Buffer.from.bind(Buffer);
      if (!Buffer.alloc) Buffer.alloc = function(n) {
        return new Buffer(n);
      };
      if (!Buffer.allocUnsafe) Buffer.allocUnsafe = function(n) {
        return new Buffer(n);
      };
    }
    function new_raw_buf(len) {
      return has_buf ? Buffer.alloc(len) : new Array(len);
    }
    function new_unsafe_buf(len) {
      return has_buf ? Buffer.allocUnsafe(len) : new Array(len);
    }
    var s2a = function s2a2(s) {
      if (has_buf) return Buffer_from(s, "binary");
      return s.split("").map(function(x) {
        return x.charCodeAt(0) & 255;
      });
    };
    var chr0 = /\u0000/g, chr1 = /[\u0001-\u0006]/g;
    var __toBuffer = function(bufs) {
      var x = [];
      for (var i = 0; i < bufs[0].length; ++i) {
        x.push.apply(x, bufs[0][i]);
      }
      return x;
    };
    var ___toBuffer = __toBuffer;
    var __utf16le = function(b, s, e) {
      var ss = [];
      for (var i = s; i < e; i += 2) ss.push(String.fromCharCode(__readUInt16LE(b, i)));
      return ss.join("").replace(chr0, "");
    };
    var ___utf16le = __utf16le;
    var __hexlify = function(b, s, l) {
      var ss = [];
      for (var i = s; i < s + l; ++i) ss.push(("0" + b[i].toString(16)).slice(-2));
      return ss.join("");
    };
    var ___hexlify = __hexlify;
    var __bconcat = function(bufs) {
      if (Array.isArray(bufs[0])) return [].concat.apply([], bufs);
      var maxlen = 0, i = 0;
      for (i = 0; i < bufs.length; ++i) maxlen += bufs[i].length;
      var o = new Uint8Array(maxlen);
      for (i = 0, maxlen = 0; i < bufs.length; maxlen += bufs[i].length, ++i) o.set(bufs[i], maxlen);
      return o;
    };
    var bconcat = __bconcat;
    if (has_buf) {
      __utf16le = function(b, s, e) {
        if (!Buffer.isBuffer(b)) return ___utf16le(b, s, e);
        return b.toString("utf16le", s, e).replace(chr0, "");
      };
      __hexlify = function(b, s, l) {
        return Buffer.isBuffer(b) ? b.toString("hex", s, s + l) : ___hexlify(b, s, l);
      };
      __toBuffer = function(bufs) {
        return bufs[0].length > 0 && Buffer.isBuffer(bufs[0][0]) ? Buffer.concat(bufs[0]) : ___toBuffer(bufs);
      };
      s2a = function(s) {
        return Buffer_from(s, "binary");
      };
      bconcat = function(bufs) {
        return Buffer.isBuffer(bufs[0]) ? Buffer.concat(bufs) : __bconcat(bufs);
      };
    }
    var __readUInt8 = function(b, idx) {
      return b[idx];
    };
    var __readUInt16LE = function(b, idx) {
      return b[idx + 1] * (1 << 8) + b[idx];
    };
    var __readInt16LE = function(b, idx) {
      var u = b[idx + 1] * (1 << 8) + b[idx];
      return u < 32768 ? u : (65535 - u + 1) * -1;
    };
    var __readUInt32LE = function(b, idx) {
      return b[idx + 3] * (1 << 24) + (b[idx + 2] << 16) + (b[idx + 1] << 8) + b[idx];
    };
    var __readInt32LE = function(b, idx) {
      return (b[idx + 3] << 24) + (b[idx + 2] << 16) + (b[idx + 1] << 8) + b[idx];
    };
    function ReadShift(size, t) {
      var oI, oS, type = 0;
      switch (size) {
        case 1:
          oI = __readUInt8(this, this.l);
          break;
        case 2:
          oI = (t !== "i" ? __readUInt16LE : __readInt16LE)(this, this.l);
          break;
        case 4:
          oI = __readInt32LE(this, this.l);
          break;
        case 16:
          type = 2;
          oS = __hexlify(this, this.l, size);
      }
      this.l += size;
      if (type === 0) return oI;
      return oS;
    }
    var __writeUInt32LE = function(b, val, idx) {
      b[idx] = val & 255;
      b[idx + 1] = val >>> 8 & 255;
      b[idx + 2] = val >>> 16 & 255;
      b[idx + 3] = val >>> 24 & 255;
    };
    var __writeInt32LE = function(b, val, idx) {
      b[idx] = val & 255;
      b[idx + 1] = val >> 8 & 255;
      b[idx + 2] = val >> 16 & 255;
      b[idx + 3] = val >> 24 & 255;
    };
    function WriteShift(t, val, f) {
      var size = 0, i = 0;
      switch (f) {
        case "hex":
          for (; i < t; ++i) {
            this[this.l++] = parseInt(val.slice(2 * i, 2 * i + 2), 16) || 0;
          }
          return this;
        case "utf16le":
          var end = this.l + t;
          for (i = 0; i < Math.min(val.length, t); ++i) {
            var cc = val.charCodeAt(i);
            this[this.l++] = cc & 255;
            this[this.l++] = cc >> 8;
          }
          while (this.l < end) this[this.l++] = 0;
          return this;
      }
      switch (t) {
        case 1:
          size = 1;
          this[this.l] = val & 255;
          break;
        case 2:
          size = 2;
          this[this.l] = val & 255;
          val >>>= 8;
          this[this.l + 1] = val & 255;
          break;
        case 4:
          size = 4;
          __writeUInt32LE(this, val, this.l);
          break;
        case -4:
          size = 4;
          __writeInt32LE(this, val, this.l);
          break;
      }
      this.l += size;
      return this;
    }
    function CheckField(hexstr, fld) {
      var m = __hexlify(this, this.l, hexstr.length >> 1);
      if (m !== hexstr) throw new Error(fld + "Expected " + hexstr + " saw " + m);
      this.l += hexstr.length >> 1;
    }
    function prep_blob(blob, pos) {
      blob.l = pos;
      blob.read_shift = ReadShift;
      blob.chk = CheckField;
      blob.write_shift = WriteShift;
    }
    function new_buf(sz) {
      var o = new_raw_buf(sz);
      prep_blob(o, 0);
      return o;
    }
    var CRC32;
    (function(factory) {
      factory(CRC32 = {});
    })(function(CRC322) {
      CRC322.version = "1.2.0";
      function signed_crc_table() {
        var c = 0, table = new Array(256);
        for (var n = 0; n != 256; ++n) {
          c = n;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
          table[n] = c;
        }
        return typeof Int32Array !== "undefined" ? new Int32Array(table) : table;
      }
      var T = signed_crc_table();
      function crc32_bstr(bstr, seed) {
        var C = seed ^ -1, L = bstr.length - 1;
        for (var i = 0; i < L; ) {
          C = C >>> 8 ^ T[(C ^ bstr.charCodeAt(i++)) & 255];
          C = C >>> 8 ^ T[(C ^ bstr.charCodeAt(i++)) & 255];
        }
        if (i === L) C = C >>> 8 ^ T[(C ^ bstr.charCodeAt(i)) & 255];
        return C ^ -1;
      }
      function crc32_buf(buf, seed) {
        if (buf.length > 1e4) return crc32_buf_8(buf, seed);
        var C = seed ^ -1, L = buf.length - 3;
        for (var i = 0; i < L; ) {
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
        }
        while (i < L + 3) C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
        return C ^ -1;
      }
      function crc32_buf_8(buf, seed) {
        var C = seed ^ -1, L = buf.length - 7;
        for (var i = 0; i < L; ) {
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
          C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
        }
        while (i < L + 7) C = C >>> 8 ^ T[(C ^ buf[i++]) & 255];
        return C ^ -1;
      }
      function crc32_str(str, seed) {
        var C = seed ^ -1;
        for (var i = 0, L = str.length, c, d; i < L; ) {
          c = str.charCodeAt(i++);
          if (c < 128) {
            C = C >>> 8 ^ T[(C ^ c) & 255];
          } else if (c < 2048) {
            C = C >>> 8 ^ T[(C ^ (192 | c >> 6 & 31)) & 255];
            C = C >>> 8 ^ T[(C ^ (128 | c & 63)) & 255];
          } else if (c >= 55296 && c < 57344) {
            c = (c & 1023) + 64;
            d = str.charCodeAt(i++) & 1023;
            C = C >>> 8 ^ T[(C ^ (240 | c >> 8 & 7)) & 255];
            C = C >>> 8 ^ T[(C ^ (128 | c >> 2 & 63)) & 255];
            C = C >>> 8 ^ T[(C ^ (128 | d >> 6 & 15 | (c & 3) << 4)) & 255];
            C = C >>> 8 ^ T[(C ^ (128 | d & 63)) & 255];
          } else {
            C = C >>> 8 ^ T[(C ^ (224 | c >> 12 & 15)) & 255];
            C = C >>> 8 ^ T[(C ^ (128 | c >> 6 & 63)) & 255];
            C = C >>> 8 ^ T[(C ^ (128 | c & 63)) & 255];
          }
        }
        return C ^ -1;
      }
      CRC322.table = T;
      CRC322.bstr = crc32_bstr;
      CRC322.buf = crc32_buf;
      CRC322.str = crc32_str;
    });
    var CFB = (function _CFB() {
      var exports = {};
      exports.version = "1.2.0";
      function namecmp(l, r) {
        var L = l.split("/"), R = r.split("/");
        for (var i2 = 0, c = 0, Z = Math.min(L.length, R.length); i2 < Z; ++i2) {
          if (c = L[i2].length - R[i2].length) return c;
          if (L[i2] != R[i2]) return L[i2] < R[i2] ? -1 : 1;
        }
        return L.length - R.length;
      }
      function dirname(p) {
        if (p.charAt(p.length - 1) == "/") return p.slice(0, -1).indexOf("/") === -1 ? p : dirname(p.slice(0, -1));
        var c = p.lastIndexOf("/");
        return c === -1 ? p : p.slice(0, c + 1);
      }
      function filename(p) {
        if (p.charAt(p.length - 1) == "/") return filename(p.slice(0, -1));
        var c = p.lastIndexOf("/");
        return c === -1 ? p : p.slice(c + 1);
      }
      function write_dos_date(buf, date) {
        if (typeof date === "string") date = new Date(date);
        var hms = date.getHours();
        hms = hms << 6 | date.getMinutes();
        hms = hms << 5 | date.getSeconds() >>> 1;
        buf.write_shift(2, hms);
        var ymd = date.getFullYear() - 1980;
        ymd = ymd << 4 | date.getMonth() + 1;
        ymd = ymd << 5 | date.getDate();
        buf.write_shift(2, ymd);
      }
      function parse_dos_date(buf) {
        var hms = buf.read_shift(2) & 65535;
        var ymd = buf.read_shift(2) & 65535;
        var val = /* @__PURE__ */ new Date();
        var d = ymd & 31;
        ymd >>>= 5;
        var m = ymd & 15;
        ymd >>>= 4;
        val.setMilliseconds(0);
        val.setFullYear(ymd + 1980);
        val.setMonth(m - 1);
        val.setDate(d);
        var S = hms & 31;
        hms >>>= 5;
        var M = hms & 63;
        hms >>>= 6;
        val.setHours(hms);
        val.setMinutes(M);
        val.setSeconds(S << 1);
        return val;
      }
      function parse_extra_field(blob) {
        prep_blob(blob, 0);
        var o = {};
        var flags = 0;
        while (blob.l <= blob.length - 4) {
          var type = blob.read_shift(2);
          var sz = blob.read_shift(2), tgt = blob.l + sz;
          var p = {};
          switch (type) {
            /* UNIX-style Timestamps */
            case 21589:
              {
                flags = blob.read_shift(1);
                if (flags & 1) p.mtime = blob.read_shift(4);
                if (sz > 5) {
                  if (flags & 2) p.atime = blob.read_shift(4);
                  if (flags & 4) p.ctime = blob.read_shift(4);
                }
                if (p.mtime) p.mt = new Date(p.mtime * 1e3);
              }
              break;
          }
          blob.l = tgt;
          o[type] = p;
        }
        return o;
      }
      var fs;
      function get_fs() {
        return fs || (fs = import_fs.default);
      }
      function parse2(file, options) {
        if (file[0] == 80 && file[1] == 75) return parse_zip(file, options);
        if ((file[0] | 32) == 109 && (file[1] | 32) == 105) return parse_mad(file, options);
        if (file.length < 512) throw new Error("CFB file size " + file.length + " < 512");
        var mver = 3;
        var ssz = 512;
        var nmfs = 0;
        var difat_sec_cnt = 0;
        var dir_start = 0;
        var minifat_start = 0;
        var difat_start = 0;
        var fat_addrs = [];
        var blob = file.slice(0, 512);
        prep_blob(blob, 0);
        var mv = check_get_mver(blob);
        mver = mv[0];
        switch (mver) {
          case 3:
            ssz = 512;
            break;
          case 4:
            ssz = 4096;
            break;
          case 0:
            if (mv[1] == 0) return parse_zip(file, options);
          /* falls through */
          default:
            throw new Error("Major Version: Expected 3 or 4 saw " + mver);
        }
        if (ssz !== 512) {
          blob = file.slice(0, ssz);
          prep_blob(
            blob,
            28
            /* blob.l */
          );
        }
        var header = file.slice(0, ssz);
        check_shifts(blob, mver);
        var dir_cnt = blob.read_shift(4, "i");
        if (mver === 3 && dir_cnt !== 0) throw new Error("# Directory Sectors: Expected 0 saw " + dir_cnt);
        blob.l += 4;
        dir_start = blob.read_shift(4, "i");
        blob.l += 4;
        blob.chk("00100000", "Mini Stream Cutoff Size: ");
        minifat_start = blob.read_shift(4, "i");
        nmfs = blob.read_shift(4, "i");
        difat_start = blob.read_shift(4, "i");
        difat_sec_cnt = blob.read_shift(4, "i");
        for (var q3 = -1, j = 0; j < 109; ++j) {
          q3 = blob.read_shift(4, "i");
          if (q3 < 0) break;
          fat_addrs[j] = q3;
        }
        var sectors = sectorify(file, ssz);
        sleuth_fat(difat_start, difat_sec_cnt, sectors, ssz, fat_addrs);
        var sector_list = make_sector_list(sectors, dir_start, fat_addrs, ssz);
        sector_list[dir_start].name = "!Directory";
        if (nmfs > 0 && minifat_start !== ENDOFCHAIN) sector_list[minifat_start].name = "!MiniFAT";
        sector_list[fat_addrs[0]].name = "!FAT";
        sector_list.fat_addrs = fat_addrs;
        sector_list.ssz = ssz;
        var files = {}, Paths = [], FileIndex = [], FullPaths = [];
        read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex, minifat_start);
        build_full_paths(FileIndex, FullPaths, Paths);
        Paths.shift();
        var o = {
          FileIndex,
          FullPaths
        };
        if (options && options.raw) o.raw = {
          header,
          sectors
        };
        return o;
      }
      function check_get_mver(blob) {
        if (blob[blob.l] == 80 && blob[blob.l + 1] == 75) return [0, 0];
        blob.chk(HEADER_SIGNATURE, "Header Signature: ");
        blob.l += 16;
        var mver = blob.read_shift(2, "u");
        return [blob.read_shift(2, "u"), mver];
      }
      function check_shifts(blob, mver) {
        var shift = 9;
        blob.l += 2;
        switch (shift = blob.read_shift(2)) {
          case 9:
            if (mver != 3) throw new Error("Sector Shift: Expected 9 saw " + shift);
            break;
          case 12:
            if (mver != 4) throw new Error("Sector Shift: Expected 12 saw " + shift);
            break;
          default:
            throw new Error("Sector Shift: Expected 9 or 12 saw " + shift);
        }
        blob.chk("0600", "Mini Sector Shift: ");
        blob.chk("000000000000", "Reserved: ");
      }
      function sectorify(file, ssz) {
        var nsectors = Math.ceil(file.length / ssz) - 1;
        var sectors = [];
        for (var i2 = 1; i2 < nsectors; ++i2) sectors[i2 - 1] = file.slice(i2 * ssz, (i2 + 1) * ssz);
        sectors[nsectors - 1] = file.slice(nsectors * ssz);
        return sectors;
      }
      function build_full_paths(FI, FP, Paths) {
        var i2 = 0, L = 0, R = 0, C = 0, j = 0, pl = Paths.length;
        var dad = [], q3 = [];
        for (; i2 < pl; ++i2) {
          dad[i2] = q3[i2] = i2;
          FP[i2] = Paths[i2];
        }
        for (; j < q3.length; ++j) {
          i2 = q3[j];
          L = FI[i2].L;
          R = FI[i2].R;
          C = FI[i2].C;
          if (dad[i2] === i2) {
            if (L !== -1 && dad[L] !== L) dad[i2] = dad[L];
            if (R !== -1 && dad[R] !== R) dad[i2] = dad[R];
          }
          if (C !== -1) dad[C] = i2;
          if (L !== -1 && i2 != dad[i2]) {
            dad[L] = dad[i2];
            if (q3.lastIndexOf(L) < j) q3.push(L);
          }
          if (R !== -1 && i2 != dad[i2]) {
            dad[R] = dad[i2];
            if (q3.lastIndexOf(R) < j) q3.push(R);
          }
        }
        for (i2 = 1; i2 < pl; ++i2) if (dad[i2] === i2) {
          if (R !== -1 && dad[R] !== R) dad[i2] = dad[R];
          else if (L !== -1 && dad[L] !== L) dad[i2] = dad[L];
        }
        for (i2 = 1; i2 < pl; ++i2) {
          if (FI[i2].type === 0) continue;
          j = i2;
          if (j != dad[j]) do {
            j = dad[j];
            FP[i2] = FP[j] + "/" + FP[i2];
          } while (j !== 0 && -1 !== dad[j] && j != dad[j]);
          dad[i2] = -1;
        }
        FP[0] += "/";
        for (i2 = 1; i2 < pl; ++i2) {
          if (FI[i2].type !== 2) FP[i2] += "/";
        }
      }
      function get_mfat_entry(entry, payload, mini) {
        var start = entry.start, size = entry.size;
        var o = [];
        var idx = start;
        while (mini && size > 0 && idx >= 0) {
          o.push(payload.slice(idx * MSSZ, idx * MSSZ + MSSZ));
          size -= MSSZ;
          idx = __readInt32LE(mini, idx * 4);
        }
        if (o.length === 0) return new_buf(0);
        return bconcat(o).slice(0, entry.size);
      }
      function sleuth_fat(idx, cnt, sectors, ssz, fat_addrs) {
        var q3 = ENDOFCHAIN;
        if (idx === ENDOFCHAIN) {
          if (cnt !== 0) throw new Error("DIFAT chain shorter than expected");
        } else if (idx !== -1) {
          var sector = sectors[idx], m = (ssz >>> 2) - 1;
          if (!sector) return;
          for (var i2 = 0; i2 < m; ++i2) {
            if ((q3 = __readInt32LE(sector, i2 * 4)) === ENDOFCHAIN) break;
            fat_addrs.push(q3);
          }
          sleuth_fat(__readInt32LE(sector, ssz - 4), cnt - 1, sectors, ssz, fat_addrs);
        }
      }
      function get_sector_list(sectors, start, fat_addrs, ssz, chkd) {
        var buf = [], buf_chain = [];
        if (!chkd) chkd = [];
        var modulus = ssz - 1, j = 0, jj = 0;
        for (j = start; j >= 0; ) {
          chkd[j] = true;
          buf[buf.length] = j;
          buf_chain.push(sectors[j]);
          var addr = fat_addrs[Math.floor(j * 4 / ssz)];
          jj = j * 4 & modulus;
          if (ssz < 4 + jj) throw new Error("FAT boundary crossed: " + j + " 4 " + ssz);
          if (!sectors[addr]) break;
          j = __readInt32LE(sectors[addr], jj);
        }
        return {
          nodes: buf,
          data: __toBuffer([buf_chain])
        };
      }
      function make_sector_list(sectors, dir_start, fat_addrs, ssz) {
        var sl = sectors.length, sector_list = [];
        var chkd = [], buf = [], buf_chain = [];
        var modulus = ssz - 1, i2 = 0, j = 0, k = 0, jj = 0;
        for (i2 = 0; i2 < sl; ++i2) {
          buf = [];
          k = i2 + dir_start;
          if (k >= sl) k -= sl;
          if (chkd[k]) continue;
          buf_chain = [];
          var seen = [];
          for (j = k; j >= 0; ) {
            seen[j] = true;
            chkd[j] = true;
            buf[buf.length] = j;
            buf_chain.push(sectors[j]);
            var addr = fat_addrs[Math.floor(j * 4 / ssz)];
            jj = j * 4 & modulus;
            if (ssz < 4 + jj) throw new Error("FAT boundary crossed: " + j + " 4 " + ssz);
            if (!sectors[addr]) break;
            j = __readInt32LE(sectors[addr], jj);
            if (seen[j]) break;
          }
          sector_list[k] = {
            nodes: buf,
            data: __toBuffer([buf_chain])
          };
        }
        return sector_list;
      }
      function read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex, mini) {
        var minifat_store = 0, pl = Paths.length ? 2 : 0;
        var sector = sector_list[dir_start].data;
        var i2 = 0, namelen = 0, name;
        for (; i2 < sector.length; i2 += 128) {
          var blob = sector.slice(i2, i2 + 128);
          prep_blob(blob, 64);
          namelen = blob.read_shift(2);
          name = __utf16le(blob, 0, namelen - pl);
          Paths.push(name);
          var o = {
            name,
            type: blob.read_shift(1),
            color: blob.read_shift(1),
            L: blob.read_shift(4, "i"),
            R: blob.read_shift(4, "i"),
            C: blob.read_shift(4, "i"),
            clsid: blob.read_shift(16),
            state: blob.read_shift(4, "i"),
            start: 0,
            size: 0
          };
          var ctime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
          if (ctime !== 0) o.ct = read_date(blob, blob.l - 8);
          var mtime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
          if (mtime !== 0) o.mt = read_date(blob, blob.l - 8);
          o.start = blob.read_shift(4, "i");
          o.size = blob.read_shift(4, "i");
          if (o.size < 0 && o.start < 0) {
            o.size = o.type = 0;
            o.start = ENDOFCHAIN;
            o.name = "";
          }
          if (o.type === 5) {
            minifat_store = o.start;
            if (nmfs > 0 && minifat_store !== ENDOFCHAIN) sector_list[minifat_store].name = "!StreamData";
          } else if (o.size >= 4096) {
            o.storage = "fat";
            if (sector_list[o.start] === void 0) sector_list[o.start] = get_sector_list(sectors, o.start, sector_list.fat_addrs, sector_list.ssz);
            sector_list[o.start].name = o.name;
            o.content = sector_list[o.start].data.slice(0, o.size);
          } else {
            o.storage = "minifat";
            if (o.size < 0) o.size = 0;
            else if (minifat_store !== ENDOFCHAIN && o.start !== ENDOFCHAIN && sector_list[minifat_store]) {
              o.content = get_mfat_entry(o, sector_list[minifat_store].data, (sector_list[mini] || {}).data);
            }
          }
          if (o.content) prep_blob(o.content, 0);
          files[name] = o;
          FileIndex.push(o);
        }
      }
      function read_date(blob, offset) {
        return new Date((__readUInt32LE(blob, offset + 4) / 1e7 * Math.pow(2, 32) + __readUInt32LE(blob, offset) / 1e7 - 11644473600) * 1e3);
      }
      function read_file(filename2, options) {
        get_fs();
        return parse2(fs.readFileSync(filename2), options);
      }
      function read(blob, options) {
        switch (options && options.type || "base64") {
          case "file":
            return read_file(blob, options);
          case "base64":
            return parse2(s2a(Base64.decode(blob)), options);
          case "binary":
            return parse2(s2a(blob), options);
        }
        return parse2(blob, options);
      }
      function init_cfb(cfb2, opts) {
        var o = opts || {}, root = o.root || "Root Entry";
        if (!cfb2.FullPaths) cfb2.FullPaths = [];
        if (!cfb2.FileIndex) cfb2.FileIndex = [];
        if (cfb2.FullPaths.length !== cfb2.FileIndex.length) throw new Error("inconsistent CFB structure");
        if (cfb2.FullPaths.length === 0) {
          cfb2.FullPaths[0] = root + "/";
          cfb2.FileIndex[0] = {
            name: root,
            type: 5
          };
        }
        if (o.CLSID) cfb2.FileIndex[0].clsid = o.CLSID;
        seed_cfb(cfb2);
      }
      function seed_cfb(cfb2) {
        var nm = "Sh33tJ5";
        if (CFB.find(cfb2, "/" + nm)) return;
        var p = new_buf(4);
        p[0] = 55;
        p[1] = p[3] = 50;
        p[2] = 54;
        cfb2.FileIndex.push({
          name: nm,
          type: 2,
          content: p,
          size: 4,
          L: 69,
          R: 69,
          C: 69
        });
        cfb2.FullPaths.push(cfb2.FullPaths[0] + nm);
        rebuild_cfb(cfb2);
      }
      function rebuild_cfb(cfb2, f) {
        init_cfb(cfb2);
        var gc = false, s = false;
        for (var i2 = cfb2.FullPaths.length - 1; i2 >= 0; --i2) {
          var _file = cfb2.FileIndex[i2];
          switch (_file.type) {
            case 0:
              if (s) gc = true;
              else {
                cfb2.FileIndex.pop();
                cfb2.FullPaths.pop();
              }
              break;
            case 1:
            case 2:
            case 5:
              s = true;
              if (isNaN(_file.R * _file.L * _file.C)) gc = true;
              if (_file.R > -1 && _file.L > -1 && _file.R == _file.L) gc = true;
              break;
            default:
              gc = true;
              break;
          }
        }
        if (!gc && !f) return;
        var now = new Date(1987, 1, 19), j = 0;
        var data = [];
        for (i2 = 0; i2 < cfb2.FullPaths.length; ++i2) {
          if (cfb2.FileIndex[i2].type === 0) continue;
          data.push([cfb2.FullPaths[i2], cfb2.FileIndex[i2]]);
        }
        for (i2 = 0; i2 < data.length; ++i2) {
          var dad = dirname(data[i2][0]);
          s = false;
          for (j = 0; j < data.length; ++j) if (data[j][0] === dad) s = true;
          if (!s) data.push([dad, {
            name: filename(dad).replace("/", ""),
            type: 1,
            clsid: HEADER_CLSID,
            ct: now,
            mt: now,
            content: null
          }]);
        }
        data.sort(function(x, y) {
          return namecmp(x[0], y[0]);
        });
        cfb2.FullPaths = [];
        cfb2.FileIndex = [];
        for (i2 = 0; i2 < data.length; ++i2) {
          cfb2.FullPaths[i2] = data[i2][0];
          cfb2.FileIndex[i2] = data[i2][1];
        }
        for (i2 = 0; i2 < data.length; ++i2) {
          var elt = cfb2.FileIndex[i2];
          var nm = cfb2.FullPaths[i2];
          elt.name = filename(nm).replace("/", "");
          elt.L = elt.R = elt.C = -(elt.color = 1);
          elt.size = elt.content ? elt.content.length : 0;
          elt.start = 0;
          elt.clsid = elt.clsid || HEADER_CLSID;
          if (i2 === 0) {
            elt.C = data.length > 1 ? 1 : -1;
            elt.size = 0;
            elt.type = 5;
          } else if (nm.slice(-1) == "/") {
            for (j = i2 + 1; j < data.length; ++j) if (dirname(cfb2.FullPaths[j]) == nm) break;
            elt.C = j >= data.length ? -1 : j;
            for (j = i2 + 1; j < data.length; ++j) if (dirname(cfb2.FullPaths[j]) == dirname(nm)) break;
            elt.R = j >= data.length ? -1 : j;
            elt.type = 1;
          } else {
            if (dirname(cfb2.FullPaths[i2 + 1] || "") == dirname(nm)) elt.R = i2 + 1;
            elt.type = 2;
          }
        }
      }
      function _write(cfb2, options) {
        var _opts = options || {};
        if (_opts.fileType == "mad") return write_mad(cfb2, _opts);
        rebuild_cfb(cfb2);
        switch (_opts.fileType) {
          case "zip":
            return write_zip(cfb2, _opts);
        }
        var L = (function(cfb3) {
          var mini_size = 0, fat_size = 0;
          for (var i3 = 0; i3 < cfb3.FileIndex.length; ++i3) {
            var file2 = cfb3.FileIndex[i3];
            if (!file2.content) continue;
            var flen2 = file2.content.length;
            if (flen2 > 0) {
              if (flen2 < 4096) mini_size += flen2 + 63 >> 6;
              else fat_size += flen2 + 511 >> 9;
            }
          }
          var dir_cnt = cfb3.FullPaths.length + 3 >> 2;
          var mini_cnt = mini_size + 7 >> 3;
          var mfat_cnt = mini_size + 127 >> 7;
          var fat_base = mini_cnt + fat_size + dir_cnt + mfat_cnt;
          var fat_cnt = fat_base + 127 >> 7;
          var difat_cnt = fat_cnt <= 109 ? 0 : Math.ceil((fat_cnt - 109) / 127);
          while (fat_base + fat_cnt + difat_cnt + 127 >> 7 > fat_cnt) difat_cnt = ++fat_cnt <= 109 ? 0 : Math.ceil((fat_cnt - 109) / 127);
          var L2 = [1, difat_cnt, fat_cnt, mfat_cnt, dir_cnt, fat_size, mini_size, 0];
          cfb3.FileIndex[0].size = mini_size << 6;
          L2[7] = (cfb3.FileIndex[0].start = L2[0] + L2[1] + L2[2] + L2[3] + L2[4] + L2[5]) + (L2[6] + 7 >> 3);
          return L2;
        })(cfb2);
        var o = new_buf(L[7] << 9);
        var i2 = 0, T = 0;
        {
          for (i2 = 0; i2 < 8; ++i2) o.write_shift(1, HEADER_SIG[i2]);
          for (i2 = 0; i2 < 8; ++i2) o.write_shift(2, 0);
          o.write_shift(2, 62);
          o.write_shift(2, 3);
          o.write_shift(2, 65534);
          o.write_shift(2, 9);
          o.write_shift(2, 6);
          for (i2 = 0; i2 < 3; ++i2) o.write_shift(2, 0);
          o.write_shift(4, 0);
          o.write_shift(4, L[2]);
          o.write_shift(4, L[0] + L[1] + L[2] + L[3] - 1);
          o.write_shift(4, 0);
          o.write_shift(4, 1 << 12);
          o.write_shift(4, L[3] ? L[0] + L[1] + L[2] - 1 : ENDOFCHAIN);
          o.write_shift(4, L[3]);
          o.write_shift(-4, L[1] ? L[0] - 1 : ENDOFCHAIN);
          o.write_shift(4, L[1]);
          for (i2 = 0; i2 < 109; ++i2) o.write_shift(-4, i2 < L[2] ? L[1] + i2 : -1);
        }
        if (L[1]) {
          for (T = 0; T < L[1]; ++T) {
            for (; i2 < 236 + T * 127; ++i2) o.write_shift(-4, i2 < L[2] ? L[1] + i2 : -1);
            o.write_shift(-4, T === L[1] - 1 ? ENDOFCHAIN : T + 1);
          }
        }
        var chainit = function(w) {
          for (T += w; i2 < T - 1; ++i2) o.write_shift(-4, i2 + 1);
          if (w) {
            ++i2;
            o.write_shift(-4, ENDOFCHAIN);
          }
        };
        T = i2 = 0;
        for (T += L[1]; i2 < T; ++i2) o.write_shift(-4, consts.DIFSECT);
        for (T += L[2]; i2 < T; ++i2) o.write_shift(-4, consts.FATSECT);
        chainit(L[3]);
        chainit(L[4]);
        var j = 0, flen = 0;
        var file = cfb2.FileIndex[0];
        for (; j < cfb2.FileIndex.length; ++j) {
          file = cfb2.FileIndex[j];
          if (!file.content) continue;
          flen = file.content.length;
          if (flen < 4096) continue;
          file.start = T;
          chainit(flen + 511 >> 9);
        }
        chainit(L[6] + 7 >> 3);
        while (o.l & 511) o.write_shift(-4, consts.ENDOFCHAIN);
        T = i2 = 0;
        for (j = 0; j < cfb2.FileIndex.length; ++j) {
          file = cfb2.FileIndex[j];
          if (!file.content) continue;
          flen = file.content.length;
          if (!flen || flen >= 4096) continue;
          file.start = T;
          chainit(flen + 63 >> 6);
        }
        while (o.l & 511) o.write_shift(-4, consts.ENDOFCHAIN);
        for (i2 = 0; i2 < L[4] << 2; ++i2) {
          var nm = cfb2.FullPaths[i2];
          if (!nm || nm.length === 0) {
            for (j = 0; j < 17; ++j) o.write_shift(4, 0);
            for (j = 0; j < 3; ++j) o.write_shift(4, -1);
            for (j = 0; j < 12; ++j) o.write_shift(4, 0);
            continue;
          }
          file = cfb2.FileIndex[i2];
          if (i2 === 0) file.start = file.size ? file.start - 1 : ENDOFCHAIN;
          var _nm = i2 === 0 && _opts.root || file.name;
          flen = 2 * (_nm.length + 1);
          o.write_shift(64, _nm, "utf16le");
          o.write_shift(2, flen);
          o.write_shift(1, file.type);
          o.write_shift(1, file.color);
          o.write_shift(-4, file.L);
          o.write_shift(-4, file.R);
          o.write_shift(-4, file.C);
          if (!file.clsid) for (j = 0; j < 4; ++j) o.write_shift(4, 0);
          else o.write_shift(16, file.clsid, "hex");
          o.write_shift(4, file.state || 0);
          o.write_shift(4, 0);
          o.write_shift(4, 0);
          o.write_shift(4, 0);
          o.write_shift(4, 0);
          o.write_shift(4, file.start);
          o.write_shift(4, file.size);
          o.write_shift(4, 0);
        }
        for (i2 = 1; i2 < cfb2.FileIndex.length; ++i2) {
          file = cfb2.FileIndex[i2];
          if (file.size >= 4096) {
            o.l = file.start + 1 << 9;
            for (j = 0; j < file.size; ++j) o.write_shift(1, file.content[j]);
            for (; j & 511; ++j) o.write_shift(1, 0);
          }
        }
        for (i2 = 1; i2 < cfb2.FileIndex.length; ++i2) {
          file = cfb2.FileIndex[i2];
          if (file.size > 0 && file.size < 4096) {
            for (j = 0; j < file.size; ++j) o.write_shift(1, file.content[j]);
            for (; j & 63; ++j) o.write_shift(1, 0);
          }
        }
        while (o.l < o.length) o.write_shift(1, 0);
        return o;
      }
      function find(cfb2, path) {
        var UCFullPaths = cfb2.FullPaths.map(function(x) {
          return x.toUpperCase();
        });
        var UCPaths = UCFullPaths.map(function(x) {
          var y = x.split("/");
          return y[y.length - (x.slice(-1) == "/" ? 2 : 1)];
        });
        var k = false;
        if (path.charCodeAt(0) === 47) {
          k = true;
          path = UCFullPaths[0].slice(0, -1) + path;
        } else k = path.indexOf("/") !== -1;
        var UCPath = path.toUpperCase();
        var w = k === true ? UCFullPaths.indexOf(UCPath) : UCPaths.indexOf(UCPath);
        if (w !== -1) return cfb2.FileIndex[w];
        var m = !UCPath.match(chr1);
        UCPath = UCPath.replace(chr0, "");
        if (m) UCPath = UCPath.replace(chr1, "!");
        for (w = 0; w < UCFullPaths.length; ++w) {
          if ((m ? UCFullPaths[w].replace(chr1, "!") : UCFullPaths[w]).replace(chr0, "") == UCPath) return cfb2.FileIndex[w];
          if ((m ? UCPaths[w].replace(chr1, "!") : UCPaths[w]).replace(chr0, "") == UCPath) return cfb2.FileIndex[w];
        }
        return null;
      }
      var MSSZ = 64;
      var ENDOFCHAIN = -2;
      var HEADER_SIGNATURE = "d0cf11e0a1b11ae1";
      var HEADER_SIG = [208, 207, 17, 224, 161, 177, 26, 225];
      var HEADER_CLSID = "00000000000000000000000000000000";
      var consts = {
        /* 2.1 Compund File Sector Numbers and Types */
        MAXREGSECT: -6,
        DIFSECT: -4,
        FATSECT: -3,
        ENDOFCHAIN,
        FREESECT: -1,
        /* 2.2 Compound File Header */
        HEADER_SIGNATURE,
        HEADER_MINOR_VERSION: "3e00",
        MAXREGSID: -6,
        NOSTREAM: -1,
        HEADER_CLSID,
        /* 2.6.1 Compound File Directory Entry */
        EntryTypes: ["unknown", "storage", "stream", "lockbytes", "property", "root"]
      };
      function write_file(cfb2, filename2, options) {
        get_fs();
        var o = _write(cfb2, options);
        fs.writeFileSync(filename2, o);
      }
      function a2s(o) {
        var out = new Array(o.length);
        for (var i2 = 0; i2 < o.length; ++i2) out[i2] = String.fromCharCode(o[i2]);
        return out.join("");
      }
      function write(cfb2, options) {
        var o = _write(cfb2, options);
        switch (options && options.type || "buffer") {
          case "file":
            get_fs();
            fs.writeFileSync(options.filename, o);
            return o;
          case "binary":
            return typeof o == "string" ? o : a2s(o);
          case "base64":
            return Base64.encode(typeof o == "string" ? o : a2s(o));
          case "buffer":
            if (has_buf) return Buffer.isBuffer(o) ? o : Buffer_from(o);
          /* falls through */
          case "array":
            return typeof o == "string" ? s2a(o) : o;
        }
        return o;
      }
      var _zlib;
      function use_zlib(zlib) {
        try {
          var InflateRaw = zlib.InflateRaw;
          var InflRaw = new InflateRaw();
          InflRaw._processChunk(new Uint8Array([3, 0]), InflRaw._finishFlushFlag);
          if (InflRaw.bytesRead) _zlib = zlib;
          else throw new Error("zlib does not expose bytesRead");
        } catch (e) {
          console.error("cannot use native zlib: " + (e.message || e));
        }
      }
      function _inflateRawSync(payload, usz) {
        if (!_zlib) return _inflate(payload, usz);
        var InflateRaw = _zlib.InflateRaw;
        var InflRaw = new InflateRaw();
        var out = InflRaw._processChunk(payload.slice(payload.l), InflRaw._finishFlushFlag);
        payload.l += InflRaw.bytesRead;
        return out;
      }
      function _deflateRawSync(payload) {
        return _zlib ? _zlib.deflateRawSync(payload) : _deflate(payload);
      }
      var CLEN_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      var LEN_LN = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
      var DST_LN = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
      function bit_swap_8(n) {
        var t = (n << 1 | n << 11) & 139536 | (n << 5 | n << 15) & 558144;
        return (t >> 16 | t >> 8 | t) & 255;
      }
      var use_typed_arrays = typeof Uint8Array !== "undefined";
      var bitswap8 = use_typed_arrays ? new Uint8Array(1 << 8) : [];
      for (var q2 = 0; q2 < 1 << 8; ++q2) bitswap8[q2] = bit_swap_8(q2);
      function bit_swap_n(n, b) {
        var rev = bitswap8[n & 255];
        if (b <= 8) return rev >>> 8 - b;
        rev = rev << 8 | bitswap8[n >> 8 & 255];
        if (b <= 16) return rev >>> 16 - b;
        rev = rev << 8 | bitswap8[n >> 16 & 255];
        return rev >>> 24 - b;
      }
      function read_bits_2(buf, bl) {
        var w = bl & 7, h = bl >>> 3;
        return (buf[h] | (w <= 6 ? 0 : buf[h + 1] << 8)) >>> w & 3;
      }
      function read_bits_3(buf, bl) {
        var w = bl & 7, h = bl >>> 3;
        return (buf[h] | (w <= 5 ? 0 : buf[h + 1] << 8)) >>> w & 7;
      }
      function read_bits_4(buf, bl) {
        var w = bl & 7, h = bl >>> 3;
        return (buf[h] | (w <= 4 ? 0 : buf[h + 1] << 8)) >>> w & 15;
      }
      function read_bits_5(buf, bl) {
        var w = bl & 7, h = bl >>> 3;
        return (buf[h] | (w <= 3 ? 0 : buf[h + 1] << 8)) >>> w & 31;
      }
      function read_bits_7(buf, bl) {
        var w = bl & 7, h = bl >>> 3;
        return (buf[h] | (w <= 1 ? 0 : buf[h + 1] << 8)) >>> w & 127;
      }
      function read_bits_n(buf, bl, n) {
        var w = bl & 7, h = bl >>> 3, f = (1 << n) - 1;
        var v = buf[h] >>> w;
        if (n < 8 - w) return v & f;
        v |= buf[h + 1] << 8 - w;
        if (n < 16 - w) return v & f;
        v |= buf[h + 2] << 16 - w;
        if (n < 24 - w) return v & f;
        v |= buf[h + 3] << 24 - w;
        return v & f;
      }
      function realloc(b, sz) {
        var L = b.length, M = 2 * L > sz ? 2 * L : sz + 5, i2 = 0;
        if (L >= sz) return b;
        if (has_buf) {
          var o = new_unsafe_buf(M);
          if (b.copy) b.copy(o);
          else for (; i2 < b.length; ++i2) o[i2] = b[i2];
          return o;
        } else if (use_typed_arrays) {
          var a = new Uint8Array(M);
          if (a.set) a.set(b);
          else for (; i2 < b.length; ++i2) a[i2] = b[i2];
          return a;
        }
        b.length = M;
        return b;
      }
      function zero_fill_array(n) {
        var o = new Array(n);
        for (var i2 = 0; i2 < n; ++i2) o[i2] = 0;
        return o;
      }
      var _deflate = /* @__PURE__ */ (function() {
        var _deflateRaw = /* @__PURE__ */ (function() {
          return function deflateRaw2(data, out) {
            var boff = 0;
            while (boff < data.length) {
              var L = Math.min(65535, data.length - boff);
              var h = boff + L == data.length;
              out.write_shift(1, +h);
              out.write_shift(2, L);
              out.write_shift(2, ~L & 65535);
              while (L-- > 0) out[out.l++] = data[boff++];
            }
            return out.l;
          };
        })();
        return function(data) {
          var buf = new_buf(50 + Math.floor(data.length * 1.1));
          var off = _deflateRaw(data, buf);
          return buf.slice(0, off);
        };
      })();
      function build_tree2(clens, cmap, MAX) {
        var maxlen = 1, w = 0, i2 = 0, j = 0, ccode = 0, L = clens.length;
        var bl_count = use_typed_arrays ? new Uint16Array(32) : zero_fill_array(32);
        for (i2 = 0; i2 < 32; ++i2) bl_count[i2] = 0;
        for (i2 = L; i2 < MAX; ++i2) clens[i2] = 0;
        L = clens.length;
        var ctree = use_typed_arrays ? new Uint16Array(L) : zero_fill_array(L);
        for (i2 = 0; i2 < L; ++i2) {
          bl_count[w = clens[i2]]++;
          if (maxlen < w) maxlen = w;
          ctree[i2] = 0;
        }
        bl_count[0] = 0;
        for (i2 = 1; i2 <= maxlen; ++i2) bl_count[i2 + 16] = ccode = ccode + bl_count[i2 - 1] << 1;
        for (i2 = 0; i2 < L; ++i2) {
          ccode = clens[i2];
          if (ccode != 0) ctree[i2] = bl_count[ccode + 16]++;
        }
        var cleni = 0;
        for (i2 = 0; i2 < L; ++i2) {
          cleni = clens[i2];
          if (cleni != 0) {
            ccode = bit_swap_n(ctree[i2], maxlen) >> maxlen - cleni;
            for (j = (1 << maxlen + 4 - cleni) - 1; j >= 0; --j) cmap[ccode | j << cleni] = cleni & 15 | i2 << 4;
          }
        }
        return maxlen;
      }
      var fix_lmap = use_typed_arrays ? new Uint16Array(512) : zero_fill_array(512);
      var fix_dmap = use_typed_arrays ? new Uint16Array(32) : zero_fill_array(32);
      if (!use_typed_arrays) {
        for (var i = 0; i < 512; ++i) fix_lmap[i] = 0;
        for (i = 0; i < 32; ++i) fix_dmap[i] = 0;
      }
      (function() {
        var dlens = [];
        var i2 = 0;
        for (; i2 < 32; i2++) dlens.push(5);
        build_tree2(dlens, fix_dmap, 32);
        var clens = [];
        i2 = 0;
        for (; i2 <= 143; i2++) clens.push(8);
        for (; i2 <= 255; i2++) clens.push(9);
        for (; i2 <= 279; i2++) clens.push(7);
        for (; i2 <= 287; i2++) clens.push(8);
        build_tree2(clens, fix_lmap, 288);
      })();
      var dyn_lmap = use_typed_arrays ? new Uint16Array(32768) : zero_fill_array(32768);
      var dyn_dmap = use_typed_arrays ? new Uint16Array(32768) : zero_fill_array(32768);
      var dyn_cmap = use_typed_arrays ? new Uint16Array(128) : zero_fill_array(128);
      var dyn_len_1 = 1, dyn_len_2 = 1;
      function dyn(data, boff) {
        var _HLIT = read_bits_5(data, boff) + 257;
        boff += 5;
        var _HDIST = read_bits_5(data, boff) + 1;
        boff += 5;
        var _HCLEN = read_bits_4(data, boff) + 4;
        boff += 4;
        var w = 0;
        var clens = use_typed_arrays ? new Uint8Array(19) : zero_fill_array(19);
        var ctree = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var maxlen = 1;
        var bl_count = use_typed_arrays ? new Uint8Array(8) : zero_fill_array(8);
        var next_code = use_typed_arrays ? new Uint8Array(8) : zero_fill_array(8);
        var L = clens.length;
        for (var i2 = 0; i2 < _HCLEN; ++i2) {
          clens[CLEN_ORDER[i2]] = w = read_bits_3(data, boff);
          if (maxlen < w) maxlen = w;
          bl_count[w]++;
          boff += 3;
        }
        var ccode = 0;
        bl_count[0] = 0;
        for (i2 = 1; i2 <= maxlen; ++i2) next_code[i2] = ccode = ccode + bl_count[i2 - 1] << 1;
        for (i2 = 0; i2 < L; ++i2) if ((ccode = clens[i2]) != 0) ctree[i2] = next_code[ccode]++;
        var cleni = 0;
        for (i2 = 0; i2 < L; ++i2) {
          cleni = clens[i2];
          if (cleni != 0) {
            ccode = bitswap8[ctree[i2]] >> 8 - cleni;
            for (var j = (1 << 7 - cleni) - 1; j >= 0; --j) dyn_cmap[ccode | j << cleni] = cleni & 7 | i2 << 3;
          }
        }
        var hcodes = [];
        maxlen = 1;
        for (; hcodes.length < _HLIT + _HDIST; ) {
          ccode = dyn_cmap[read_bits_7(data, boff)];
          boff += ccode & 7;
          switch (ccode >>>= 3) {
            case 16:
              w = 3 + read_bits_2(data, boff);
              boff += 2;
              ccode = hcodes[hcodes.length - 1];
              while (w-- > 0) hcodes.push(ccode);
              break;
            case 17:
              w = 3 + read_bits_3(data, boff);
              boff += 3;
              while (w-- > 0) hcodes.push(0);
              break;
            case 18:
              w = 11 + read_bits_7(data, boff);
              boff += 7;
              while (w-- > 0) hcodes.push(0);
              break;
            default:
              hcodes.push(ccode);
              if (maxlen < ccode) maxlen = ccode;
              break;
          }
        }
        var h1 = hcodes.slice(0, _HLIT), h2 = hcodes.slice(_HLIT);
        for (i2 = _HLIT; i2 < 286; ++i2) h1[i2] = 0;
        for (i2 = _HDIST; i2 < 30; ++i2) h2[i2] = 0;
        dyn_len_1 = build_tree2(h1, dyn_lmap, 286);
        dyn_len_2 = build_tree2(h2, dyn_dmap, 30);
        return boff;
      }
      function inflate2(data, usz) {
        if (data[0] == 3 && !(data[1] & 3)) {
          return [new_raw_buf(usz), 2];
        }
        var boff = 0;
        var header = 0;
        var outbuf = new_unsafe_buf(usz ? usz : 1 << 18);
        var woff = 0;
        var OL = outbuf.length >>> 0;
        var max_len_1 = 0, max_len_2 = 0;
        while ((header & 1) == 0) {
          header = read_bits_3(data, boff);
          boff += 3;
          if (header >>> 1 == 0) {
            if (boff & 7) boff += 8 - (boff & 7);
            var sz = data[boff >>> 3] | data[(boff >>> 3) + 1] << 8;
            boff += 32;
            if (!usz && OL < woff + sz) {
              outbuf = realloc(outbuf, woff + sz);
              OL = outbuf.length;
            }
            if (typeof data.copy === "function") {
              data.copy(outbuf, woff, boff >>> 3, (boff >>> 3) + sz);
              woff += sz;
              boff += 8 * sz;
            } else while (sz-- > 0) {
              outbuf[woff++] = data[boff >>> 3];
              boff += 8;
            }
            continue;
          } else if (header >>> 1 == 1) {
            max_len_1 = 9;
            max_len_2 = 5;
          } else {
            boff = dyn(data, boff);
            max_len_1 = dyn_len_1;
            max_len_2 = dyn_len_2;
          }
          if (!usz && OL < woff + 32767) {
            outbuf = realloc(outbuf, woff + 32767);
            OL = outbuf.length;
          }
          for (; ; ) {
            var bits = read_bits_n(data, boff, max_len_1);
            var code = header >>> 1 == 1 ? fix_lmap[bits] : dyn_lmap[bits];
            boff += code & 15;
            code >>>= 4;
            if ((code >>> 8 & 255) === 0) outbuf[woff++] = code;
            else if (code == 256) break;
            else {
              code -= 257;
              var len_eb = code < 8 ? 0 : code - 4 >> 2;
              if (len_eb > 5) len_eb = 0;
              var tgt = woff + LEN_LN[code];
              if (len_eb > 0) {
                tgt += read_bits_n(data, boff, len_eb);
                boff += len_eb;
              }
              bits = read_bits_n(data, boff, max_len_2);
              code = header >>> 1 == 1 ? fix_dmap[bits] : dyn_dmap[bits];
              boff += code & 15;
              code >>>= 4;
              var dst_eb = code < 4 ? 0 : code - 2 >> 1;
              var dst = DST_LN[code];
              if (dst_eb > 0) {
                dst += read_bits_n(data, boff, dst_eb);
                boff += dst_eb;
              }
              if (!usz && OL < tgt) {
                outbuf = realloc(outbuf, tgt);
                OL = outbuf.length;
              }
              while (woff < tgt) {
                outbuf[woff] = outbuf[woff - dst];
                ++woff;
              }
            }
          }
        }
        return [usz ? outbuf : outbuf.slice(0, woff), boff + 7 >>> 3];
      }
      function _inflate(payload, usz) {
        var data = payload.slice(payload.l || 0);
        var out = inflate2(data, usz);
        payload.l += out[1];
        return out[0];
      }
      function warn_or_throw(wrn, msg) {
        if (wrn) {
          if (typeof console !== "undefined") console.error(msg);
        } else throw new Error(msg);
      }
      function parse_zip(file, options) {
        var blob = file;
        prep_blob(blob, 0);
        var FileIndex = [], FullPaths = [];
        var o = {
          FileIndex,
          FullPaths
        };
        init_cfb(o, {
          root: options.root
        });
        var i2 = blob.length - 4;
        while ((blob[i2] != 80 || blob[i2 + 1] != 75 || blob[i2 + 2] != 5 || blob[i2 + 3] != 6) && i2 >= 0) --i2;
        blob.l = i2 + 4;
        blob.l += 4;
        var fcnt = blob.read_shift(2);
        blob.l += 6;
        var start_cd = blob.read_shift(4);
        blob.l = start_cd;
        for (i2 = 0; i2 < fcnt; ++i2) {
          blob.l += 20;
          var csz = blob.read_shift(4);
          var usz = blob.read_shift(4);
          var namelen = blob.read_shift(2);
          var efsz = blob.read_shift(2);
          var fcsz = blob.read_shift(2);
          blob.l += 8;
          var offset = blob.read_shift(4);
          var EF = parse_extra_field(blob.slice(blob.l + namelen, blob.l + namelen + efsz));
          blob.l += namelen + efsz + fcsz;
          var L = blob.l;
          blob.l = offset + 4;
          parse_local_file(blob, csz, usz, o, EF);
          blob.l = L;
        }
        return o;
      }
      function parse_local_file(blob, csz, usz, o, EF) {
        blob.l += 2;
        var flags = blob.read_shift(2);
        var meth = blob.read_shift(2);
        var date = parse_dos_date(blob);
        if (flags & 8257) throw new Error("Unsupported ZIP encryption");
        var crc322 = blob.read_shift(4);
        var _csz = blob.read_shift(4);
        var _usz = blob.read_shift(4);
        var namelen = blob.read_shift(2);
        var efsz = blob.read_shift(2);
        var name = "";
        for (var i2 = 0; i2 < namelen; ++i2) name += String.fromCharCode(blob[blob.l++]);
        if (efsz) {
          var ef = parse_extra_field(blob.slice(blob.l, blob.l + efsz));
          if ((ef[21589] || {}).mt) date = ef[21589].mt;
          if (((EF || {})[21589] || {}).mt) date = EF[21589].mt;
        }
        blob.l += efsz;
        var data = blob.slice(blob.l, blob.l + _csz);
        switch (meth) {
          case 8:
            data = _inflateRawSync(blob, _usz);
            break;
          case 0:
            break;
          default:
            throw new Error("Unsupported ZIP Compression method " + meth);
        }
        var wrn = false;
        if (flags & 8) {
          crc322 = blob.read_shift(4);
          if (crc322 == 134695760) {
            crc322 = blob.read_shift(4);
            wrn = true;
          }
          _csz = blob.read_shift(4);
          _usz = blob.read_shift(4);
        }
        if (_csz != csz) warn_or_throw(wrn, "Bad compressed size: " + csz + " != " + _csz);
        if (_usz != usz) warn_or_throw(wrn, "Bad uncompressed size: " + usz + " != " + _usz);
        var _crc32 = CRC32.buf(data, 0);
        if (crc322 >> 0 != _crc32 >> 0) warn_or_throw(wrn, "Bad CRC32 checksum: " + crc322 + " != " + _crc32);
        cfb_add(o, name, data, {
          unsafe: true,
          mt: date
        });
      }
      function write_zip(cfb2, options) {
        var _opts = options || {};
        var out = [], cdirs = [];
        var o = new_buf(1);
        var method = _opts.compression ? 8 : 0, flags = 0;
        var i2 = 0, j = 0;
        var start_cd = 0, fcnt = 0;
        var root = cfb2.FullPaths[0], fp = root, fi = cfb2.FileIndex[0];
        var crcs = [];
        var sz_cd = 0;
        for (i2 = 1; i2 < cfb2.FullPaths.length; ++i2) {
          fp = cfb2.FullPaths[i2].slice(root.length);
          fi = cfb2.FileIndex[i2];
          if (!fi.size || !fi.content || fp == "Sh33tJ5") continue;
          var start = start_cd;
          var namebuf = new_buf(fp.length);
          for (j = 0; j < fp.length; ++j) namebuf.write_shift(1, fp.charCodeAt(j) & 127);
          namebuf = namebuf.slice(0, namebuf.l);
          crcs[fcnt] = CRC32.buf(fi.content, 0);
          var outbuf = fi.content;
          if (method == 8) outbuf = _deflateRawSync(outbuf);
          o = new_buf(30);
          o.write_shift(4, 67324752);
          o.write_shift(2, 20);
          o.write_shift(2, flags);
          o.write_shift(2, method);
          if (fi.mt) write_dos_date(o, fi.mt);
          else o.write_shift(4, 0);
          o.write_shift(-4, crcs[fcnt]);
          o.write_shift(4, outbuf.length);
          o.write_shift(4, fi.content.length);
          o.write_shift(2, namebuf.length);
          o.write_shift(2, 0);
          start_cd += o.length;
          out.push(o);
          start_cd += namebuf.length;
          out.push(namebuf);
          start_cd += outbuf.length;
          out.push(outbuf);
          o = new_buf(46);
          o.write_shift(4, 33639248);
          o.write_shift(2, 0);
          o.write_shift(2, 20);
          o.write_shift(2, flags);
          o.write_shift(2, method);
          o.write_shift(4, 0);
          o.write_shift(-4, crcs[fcnt]);
          o.write_shift(4, outbuf.length);
          o.write_shift(4, fi.content.length);
          o.write_shift(2, namebuf.length);
          o.write_shift(2, 0);
          o.write_shift(2, 0);
          o.write_shift(2, 0);
          o.write_shift(2, 0);
          o.write_shift(4, 0);
          o.write_shift(4, start);
          sz_cd += o.l;
          cdirs.push(o);
          sz_cd += namebuf.length;
          cdirs.push(namebuf);
          ++fcnt;
        }
        o = new_buf(22);
        o.write_shift(4, 101010256);
        o.write_shift(2, 0);
        o.write_shift(2, 0);
        o.write_shift(2, fcnt);
        o.write_shift(2, fcnt);
        o.write_shift(4, sz_cd);
        o.write_shift(4, start_cd);
        o.write_shift(2, 0);
        return bconcat([bconcat(out), bconcat(cdirs), o]);
      }
      var ContentTypeMap = {
        "htm": "text/html",
        "xml": "text/xml",
        "gif": "image/gif",
        "jpg": "image/jpeg",
        "png": "image/png",
        "mso": "application/x-mso",
        "thmx": "application/vnd.ms-officetheme",
        "sh33tj5": "application/octet-stream"
      };
      function get_content_type(fi, fp) {
        if (fi.ctype) return fi.ctype;
        var ext = fi.name || "", m = ext.match(/\.([^\.]+)$/);
        if (m && ContentTypeMap[m[1]]) return ContentTypeMap[m[1]];
        if (fp) {
          m = (ext = fp).match(/[\.\\]([^\.\\])+$/);
          if (m && ContentTypeMap[m[1]]) return ContentTypeMap[m[1]];
        }
        return "application/octet-stream";
      }
      function write_base64_76(bstr) {
        var data = Base64.encode(bstr);
        var o = [];
        for (var i2 = 0; i2 < data.length; i2 += 76) o.push(data.slice(i2, i2 + 76));
        return o.join("\r\n") + "\r\n";
      }
      function write_quoted_printable(text) {
        var encoded = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF=]/g, function(c) {
          var w = c.charCodeAt(0).toString(16).toUpperCase();
          return "=" + (w.length == 1 ? "0" + w : w);
        });
        encoded = encoded.replace(/ $/mg, "=20").replace(/\t$/mg, "=09");
        if (encoded.charAt(0) == "\n") encoded = "=0D" + encoded.slice(1);
        encoded = encoded.replace(/\r(?!\n)/mg, "=0D").replace(/\n\n/mg, "\n=0A").replace(/([^\r\n])\n/mg, "$1=0A");
        var o = [], split = encoded.split("\r\n");
        for (var si = 0; si < split.length; ++si) {
          var str = split[si];
          if (str.length == 0) {
            o.push("");
            continue;
          }
          for (var i2 = 0; i2 < str.length; ) {
            var end = 76;
            var tmp = str.slice(i2, i2 + end);
            if (tmp.charAt(end - 1) == "=") end--;
            else if (tmp.charAt(end - 2) == "=") end -= 2;
            else if (tmp.charAt(end - 3) == "=") end -= 3;
            tmp = str.slice(i2, i2 + end);
            i2 += end;
            if (i2 < str.length) tmp += "=";
            o.push(tmp);
          }
        }
        return o.join("\r\n");
      }
      function parse_quoted_printable(data) {
        var o = [];
        for (var di = 0; di < data.length; ++di) {
          var line = data[di];
          while (di <= data.length && line.charAt(line.length - 1) == "=") line = line.slice(0, line.length - 1) + data[++di];
          o.push(line);
        }
        for (var oi = 0; oi < o.length; ++oi) o[oi] = o[oi].replace(/=[0-9A-Fa-f]{2}/g, function($$) {
          return String.fromCharCode(parseInt($$.slice(1), 16));
        });
        return s2a(o.join("\r\n"));
      }
      function parse_mime(cfb2, data, root) {
        var fname = "", cte = "", ctype = "", fdata;
        var di = 0;
        for (; di < 10; ++di) {
          var line = data[di];
          if (!line || line.match(/^\s*$/)) break;
          var m = line.match(/^(.*?):\s*([^\s].*)$/);
          if (m) switch (m[1].toLowerCase()) {
            case "content-location":
              fname = m[2].trim();
              break;
            case "content-type":
              ctype = m[2].trim();
              break;
            case "content-transfer-encoding":
              cte = m[2].trim();
              break;
          }
        }
        ++di;
        switch (cte.toLowerCase()) {
          case "base64":
            fdata = s2a(Base64.decode(data.slice(di).join("")));
            break;
          case "quoted-printable":
            fdata = parse_quoted_printable(data.slice(di));
            break;
          default:
            throw new Error("Unsupported Content-Transfer-Encoding " + cte);
        }
        var file = cfb_add(cfb2, fname.slice(root.length), fdata, {
          unsafe: true
        });
        if (ctype) file.ctype = ctype;
      }
      function parse_mad(file, options) {
        if (a2s(file.slice(0, 13)).toLowerCase() != "mime-version:") throw new Error("Unsupported MAD header");
        var root = options && options.root || "";
        var data = (has_buf && Buffer.isBuffer(file) ? file.toString("binary") : a2s(file)).split("\r\n");
        var di = 0, row = "";
        for (di = 0; di < data.length; ++di) {
          row = data[di];
          if (!/^Content-Location:/i.test(row)) continue;
          row = row.slice(row.indexOf("file"));
          if (!root) root = row.slice(0, row.lastIndexOf("/") + 1);
          if (row.slice(0, root.length) == root) continue;
          while (root.length > 0) {
            root = root.slice(0, root.length - 1);
            root = root.slice(0, root.lastIndexOf("/") + 1);
            if (row.slice(0, root.length) == root) break;
          }
        }
        var mboundary = (data[1] || "").match(/boundary="(.*?)"/);
        if (!mboundary) throw new Error("MAD cannot find boundary");
        var boundary = "--" + (mboundary[1] || "");
        var FileIndex = [], FullPaths = [];
        var o = {
          FileIndex,
          FullPaths
        };
        init_cfb(o);
        var start_di, fcnt = 0;
        for (di = 0; di < data.length; ++di) {
          var line = data[di];
          if (line !== boundary && line !== boundary + "--") continue;
          if (fcnt++) parse_mime(o, data.slice(start_di, di), root);
          start_di = di;
        }
        return o;
      }
      function write_mad(cfb2, options) {
        var opts = options || {};
        var boundary = opts.boundary || "SheetJS";
        boundary = "------=" + boundary;
        var out = ["MIME-Version: 1.0", 'Content-Type: multipart/related; boundary="' + boundary.slice(2) + '"', "", "", ""];
        var root = cfb2.FullPaths[0], fp = root, fi = cfb2.FileIndex[0];
        for (var i2 = 1; i2 < cfb2.FullPaths.length; ++i2) {
          fp = cfb2.FullPaths[i2].slice(root.length);
          fi = cfb2.FileIndex[i2];
          if (!fi.size || !fi.content || fp == "Sh33tJ5") continue;
          fp = fp.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF]/g, function(c) {
            return "_x" + c.charCodeAt(0).toString(16) + "_";
          }).replace(/[\u0080-\uFFFF]/g, function(u) {
            return "_u" + u.charCodeAt(0).toString(16) + "_";
          });
          var ca = fi.content;
          var cstr = has_buf && Buffer.isBuffer(ca) ? ca.toString("binary") : a2s(ca);
          var dispcnt = 0, L = Math.min(1024, cstr.length), cc = 0;
          for (var csl = 0; csl <= L; ++csl) if ((cc = cstr.charCodeAt(csl)) >= 32 && cc < 128) ++dispcnt;
          var qp = dispcnt >= L * 4 / 5;
          out.push(boundary);
          out.push("Content-Location: " + (opts.root || "file:///C:/SheetJS/") + fp);
          out.push("Content-Transfer-Encoding: " + (qp ? "quoted-printable" : "base64"));
          out.push("Content-Type: " + get_content_type(fi, fp));
          out.push("");
          out.push(qp ? write_quoted_printable(cstr) : write_base64_76(cstr));
        }
        out.push(boundary + "--\r\n");
        return out.join("\r\n");
      }
      function cfb_new(opts) {
        var o = {};
        init_cfb(o, opts);
        return o;
      }
      function cfb_add(cfb2, name, content, opts) {
        var unsafe = opts && opts.unsafe;
        if (!unsafe) init_cfb(cfb2);
        var file = !unsafe && CFB.find(cfb2, name);
        if (!file) {
          var fpath = cfb2.FullPaths[0];
          if (name.slice(0, fpath.length) == fpath) fpath = name;
          else {
            if (fpath.slice(-1) != "/") fpath += "/";
            fpath = (fpath + name).replace("//", "/");
          }
          file = {
            name: filename(name),
            type: 2
          };
          cfb2.FileIndex.push(file);
          cfb2.FullPaths.push(fpath);
          if (!unsafe) CFB.utils.cfb_gc(cfb2);
        }
        file.content = content;
        file.size = content ? content.length : 0;
        if (opts) {
          if (opts.CLSID) file.clsid = opts.CLSID;
          if (opts.mt) file.mt = opts.mt;
          if (opts.ct) file.ct = opts.ct;
        }
        return file;
      }
      function cfb_del(cfb2, name) {
        init_cfb(cfb2);
        var file = CFB.find(cfb2, name);
        if (file) {
          for (var j = 0; j < cfb2.FileIndex.length; ++j) if (cfb2.FileIndex[j] == file) {
            cfb2.FileIndex.splice(j, 1);
            cfb2.FullPaths.splice(j, 1);
            return true;
          }
        }
        return false;
      }
      function cfb_mov(cfb2, old_name, new_name) {
        init_cfb(cfb2);
        var file = CFB.find(cfb2, old_name);
        if (file) {
          for (var j = 0; j < cfb2.FileIndex.length; ++j) if (cfb2.FileIndex[j] == file) {
            cfb2.FileIndex[j].name = filename(new_name);
            cfb2.FullPaths[j] = new_name;
            return true;
          }
        }
        return false;
      }
      function cfb_gc(cfb2) {
        rebuild_cfb(cfb2, true);
      }
      exports.find = find;
      exports.read = read;
      exports.parse = parse2;
      exports.write = write;
      exports.writeFile = write_file;
      exports.utils = {
        cfb_new,
        cfb_add,
        cfb_del,
        cfb_mov,
        cfb_gc,
        ReadShift,
        CheckField,
        prep_blob,
        bconcat,
        use_zlib,
        _deflateRaw: _deflate,
        _inflateRaw: _inflate,
        consts
      };
      return exports;
    })();
    if (typeof commonjsRequire !== "undefined" && true && typeof DO_NOT_EXPORT_CFB === "undefined") {
      module.exports = CFB;
    }
  });
  var common = createCommonjsModule(function(module, exports) {
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }
    };
    var fnUntyped = {
      arraySet: function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function(chunks) {
        return [].concat.apply([], chunks);
      }
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  });
  var Z_FIXED = 4;
  var Z_BINARY = 0;
  var Z_TEXT = 1;
  var Z_UNKNOWN = 2;
  function zero(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }
  var STORED_BLOCK = 0;
  var STATIC_TREES = 1;
  var DYN_TREES = 2;
  var MIN_MATCH = 3;
  var MAX_MATCH = 258;
  var LENGTH_CODES = 29;
  var LITERALS = 256;
  var L_CODES = LITERALS + 1 + LENGTH_CODES;
  var D_CODES = 30;
  var BL_CODES = 19;
  var HEAP_SIZE = 2 * L_CODES + 1;
  var MAX_BITS = 15;
  var Buf_size = 16;
  var MAX_BL_BITS = 7;
  var END_BLOCK = 256;
  var REP_3_6 = 16;
  var REPZ_3_10 = 17;
  var REPZ_11_138 = 18;
  var extra_lbits = (
    /* extra bits for each length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
  );
  var extra_dbits = (
    /* extra bits for each distance code */
    [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  );
  var extra_blbits = (
    /* extra bits for each bit length code */
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
  );
  var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  var DIST_CODE_LEN = 512;
  var static_ltree = new Array((L_CODES + 2) * 2);
  zero(static_ltree);
  var static_dtree = new Array(D_CODES * 2);
  zero(static_dtree);
  var _dist_code = new Array(DIST_CODE_LEN);
  zero(_dist_code);
  var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
  zero(_length_code);
  var base_length = new Array(LENGTH_CODES);
  zero(base_length);
  var base_dist = new Array(D_CODES);
  zero(base_dist);
  function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
    this.static_tree = static_tree;
    this.extra_bits = extra_bits;
    this.extra_base = extra_base;
    this.elems = elems;
    this.max_length = max_length;
    this.has_stree = static_tree && static_tree.length;
  }
  var static_l_desc;
  var static_d_desc;
  var static_bl_desc;
  function TreeDesc(dyn_tree, stat_desc) {
    this.dyn_tree = dyn_tree;
    this.max_code = 0;
    this.stat_desc = stat_desc;
  }
  function d_code(dist) {
    return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
  }
  function put_short(s, w) {
    s.pending_buf[s.pending++] = w & 255;
    s.pending_buf[s.pending++] = w >>> 8 & 255;
  }
  function send_bits(s, value, length) {
    if (s.bi_valid > Buf_size - length) {
      s.bi_buf |= value << s.bi_valid & 65535;
      put_short(s, s.bi_buf);
      s.bi_buf = value >> Buf_size - s.bi_valid;
      s.bi_valid += length - Buf_size;
    } else {
      s.bi_buf |= value << s.bi_valid & 65535;
      s.bi_valid += length;
    }
  }
  function send_code(s, c, tree) {
    send_bits(
      s,
      tree[c * 2],
      tree[c * 2 + 1]
      /*.Len*/
    );
  }
  function bi_reverse(code, len) {
    var res = 0;
    do {
      res |= code & 1;
      code >>>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >>> 1;
  }
  function bi_flush(s) {
    if (s.bi_valid === 16) {
      put_short(s, s.bi_buf);
      s.bi_buf = 0;
      s.bi_valid = 0;
    } else if (s.bi_valid >= 8) {
      s.pending_buf[s.pending++] = s.bi_buf & 255;
      s.bi_buf >>= 8;
      s.bi_valid -= 8;
    }
  }
  function gen_bitlen(s, desc) {
    var tree = desc.dyn_tree;
    var max_code = desc.max_code;
    var stree = desc.stat_desc.static_tree;
    var has_stree = desc.stat_desc.has_stree;
    var extra = desc.stat_desc.extra_bits;
    var base = desc.stat_desc.extra_base;
    var max_length = desc.stat_desc.max_length;
    var h;
    var n, m;
    var bits;
    var xbits;
    var f;
    var overflow = 0;
    for (bits = 0; bits <= MAX_BITS; bits++) {
      s.bl_count[bits] = 0;
    }
    tree[s.heap[s.heap_max] * 2 + 1] = 0;
    for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
      n = s.heap[h];
      bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n * 2 + 1] = bits;
      if (n > max_code) {
        continue;
      }
      s.bl_count[bits]++;
      xbits = 0;
      if (n >= base) {
        xbits = extra[n - base];
      }
      f = tree[n * 2];
      s.opt_len += f * (bits + xbits);
      if (has_stree) {
        s.static_len += f * (stree[n * 2 + 1] + xbits);
      }
    }
    if (overflow === 0) {
      return;
    }
    do {
      bits = max_length - 1;
      while (s.bl_count[bits] === 0) {
        bits--;
      }
      s.bl_count[bits]--;
      s.bl_count[bits + 1] += 2;
      s.bl_count[max_length]--;
      overflow -= 2;
    } while (overflow > 0);
    for (bits = max_length; bits !== 0; bits--) {
      n = s.bl_count[bits];
      while (n !== 0) {
        m = s.heap[--h];
        if (m > max_code) {
          continue;
        }
        if (tree[m * 2 + 1] !== bits) {
          s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
          tree[m * 2 + 1] = bits;
        }
        n--;
      }
    }
  }
  function gen_codes(tree, max_code, bl_count) {
    var next_code = new Array(MAX_BITS + 1);
    var code = 0;
    var bits;
    var n;
    for (bits = 1; bits <= MAX_BITS; bits++) {
      next_code[bits] = code = code + bl_count[bits - 1] << 1;
    }
    for (n = 0; n <= max_code; n++) {
      var len = tree[n * 2 + 1];
      if (len === 0) {
        continue;
      }
      tree[n * 2] = bi_reverse(next_code[len]++, len);
    }
  }
  function tr_static_init() {
    var n;
    var bits;
    var length;
    var code;
    var dist;
    var bl_count = new Array(MAX_BITS + 1);
    length = 0;
    for (code = 0; code < LENGTH_CODES - 1; code++) {
      base_length[code] = length;
      for (n = 0; n < 1 << extra_lbits[code]; n++) {
        _length_code[length++] = code;
      }
    }
    _length_code[length - 1] = code;
    dist = 0;
    for (code = 0; code < 16; code++) {
      base_dist[code] = dist;
      for (n = 0; n < 1 << extra_dbits[code]; n++) {
        _dist_code[dist++] = code;
      }
    }
    dist >>= 7;
    for (; code < D_CODES; code++) {
      base_dist[code] = dist << 7;
      for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
        _dist_code[256 + dist++] = code;
      }
    }
    for (bits = 0; bits <= MAX_BITS; bits++) {
      bl_count[bits] = 0;
    }
    n = 0;
    while (n <= 143) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    while (n <= 255) {
      static_ltree[n * 2 + 1] = 9;
      n++;
      bl_count[9]++;
    }
    while (n <= 279) {
      static_ltree[n * 2 + 1] = 7;
      n++;
      bl_count[7]++;
    }
    while (n <= 287) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    gen_codes(static_ltree, L_CODES + 1, bl_count);
    for (n = 0; n < D_CODES; n++) {
      static_dtree[n * 2 + 1] = 5;
      static_dtree[n * 2] = bi_reverse(n, 5);
    }
    static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
    static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
    static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
  }
  function init_block(s) {
    var n;
    for (n = 0; n < L_CODES; n++) {
      s.dyn_ltree[n * 2] = 0;
    }
    for (n = 0; n < D_CODES; n++) {
      s.dyn_dtree[n * 2] = 0;
    }
    for (n = 0; n < BL_CODES; n++) {
      s.bl_tree[n * 2] = 0;
    }
    s.dyn_ltree[END_BLOCK * 2] = 1;
    s.opt_len = s.static_len = 0;
    s.last_lit = s.matches = 0;
  }
  function bi_windup(s) {
    if (s.bi_valid > 8) {
      put_short(s, s.bi_buf);
    } else if (s.bi_valid > 0) {
      s.pending_buf[s.pending++] = s.bi_buf;
    }
    s.bi_buf = 0;
    s.bi_valid = 0;
  }
  function copy_block(s, buf, len, header) {
    bi_windup(s);
    if (header) {
      put_short(s, len);
      put_short(s, ~len);
    }
    common.arraySet(s.pending_buf, s.window, buf, len, s.pending);
    s.pending += len;
  }
  function smaller(tree, n, m, depth) {
    var _n2 = n * 2;
    var _m2 = m * 2;
    return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
  }
  function pqdownheap(s, tree, k) {
    var v = s.heap[k];
    var j = k << 1;
    while (j <= s.heap_len) {
      if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
        j++;
      }
      if (smaller(tree, v, s.heap[j], s.depth)) {
        break;
      }
      s.heap[k] = s.heap[j];
      k = j;
      j <<= 1;
    }
    s.heap[k] = v;
  }
  function compress_block(s, ltree, dtree) {
    var dist;
    var lc;
    var lx = 0;
    var code;
    var extra;
    if (s.last_lit !== 0) {
      do {
        dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
        lc = s.pending_buf[s.l_buf + lx];
        lx++;
        if (dist === 0) {
          send_code(s, lc, ltree);
        } else {
          code = _length_code[lc];
          send_code(s, code + LITERALS + 1, ltree);
          extra = extra_lbits[code];
          if (extra !== 0) {
            lc -= base_length[code];
            send_bits(s, lc, extra);
          }
          dist--;
          code = d_code(dist);
          send_code(s, code, dtree);
          extra = extra_dbits[code];
          if (extra !== 0) {
            dist -= base_dist[code];
            send_bits(s, dist, extra);
          }
        }
      } while (lx < s.last_lit);
    }
    send_code(s, END_BLOCK, ltree);
  }
  function build_tree(s, desc) {
    var tree = desc.dyn_tree;
    var stree = desc.stat_desc.static_tree;
    var has_stree = desc.stat_desc.has_stree;
    var elems = desc.stat_desc.elems;
    var n, m;
    var max_code = -1;
    var node;
    s.heap_len = 0;
    s.heap_max = HEAP_SIZE;
    for (n = 0; n < elems; n++) {
      if (tree[n * 2] !== 0) {
        s.heap[++s.heap_len] = max_code = n;
        s.depth[n] = 0;
      } else {
        tree[n * 2 + 1] = 0;
      }
    }
    while (s.heap_len < 2) {
      node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
      tree[node * 2] = 1;
      s.depth[node] = 0;
      s.opt_len--;
      if (has_stree) {
        s.static_len -= stree[node * 2 + 1];
      }
    }
    desc.max_code = max_code;
    for (n = s.heap_len >> 1; n >= 1; n--) {
      pqdownheap(s, tree, n);
    }
    node = elems;
    do {
      n = s.heap[
        1
        /*SMALLEST*/
      ];
      s.heap[
        1
        /*SMALLEST*/
      ] = s.heap[s.heap_len--];
      pqdownheap(
        s,
        tree,
        1
        /*SMALLEST*/
      );
      m = s.heap[
        1
        /*SMALLEST*/
      ];
      s.heap[--s.heap_max] = n;
      s.heap[--s.heap_max] = m;
      tree[node * 2] = tree[n * 2] + tree[m * 2];
      s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
      tree[n * 2 + 1] = tree[m * 2 + 1] = node;
      s.heap[
        1
        /*SMALLEST*/
      ] = node++;
      pqdownheap(
        s,
        tree,
        1
        /*SMALLEST*/
      );
    } while (s.heap_len >= 2);
    s.heap[--s.heap_max] = s.heap[
      1
      /*SMALLEST*/
    ];
    gen_bitlen(s, desc);
    gen_codes(tree, max_code, s.bl_count);
  }
  function scan_tree(s, tree, max_code) {
    var n;
    var prevlen = -1;
    var curlen;
    var nextlen = tree[0 * 2 + 1];
    var count = 0;
    var max_count = 7;
    var min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] = 65535;
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) {
        continue;
      } else if (count < min_count) {
        s.bl_tree[curlen * 2] += count;
      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          s.bl_tree[curlen * 2]++;
        }
        s.bl_tree[REP_3_6 * 2]++;
      } else if (count <= 10) {
        s.bl_tree[REPZ_3_10 * 2]++;
      } else {
        s.bl_tree[REPZ_11_138 * 2]++;
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function send_tree(s, tree, max_code) {
    var n;
    var prevlen = -1;
    var curlen;
    var nextlen = tree[0 * 2 + 1];
    var count = 0;
    var max_count = 7;
    var min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) {
        continue;
      } else if (count < min_count) {
        do {
          send_code(s, curlen, s.bl_tree);
        } while (--count !== 0);
      } else if (curlen !== 0) {
        if (curlen !== prevlen) {
          send_code(s, curlen, s.bl_tree);
          count--;
        }
        send_code(s, REP_3_6, s.bl_tree);
        send_bits(s, count - 3, 2);
      } else if (count <= 10) {
        send_code(s, REPZ_3_10, s.bl_tree);
        send_bits(s, count - 3, 3);
      } else {
        send_code(s, REPZ_11_138, s.bl_tree);
        send_bits(s, count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function build_bl_tree(s) {
    var max_blindex;
    scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
    scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
    build_tree(s, s.bl_desc);
    for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
      if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
        break;
      }
    }
    s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    return max_blindex;
  }
  function send_all_trees(s, lcodes, dcodes, blcodes) {
    var rank2;
    send_bits(s, lcodes - 257, 5);
    send_bits(s, dcodes - 1, 5);
    send_bits(s, blcodes - 4, 4);
    for (rank2 = 0; rank2 < blcodes; rank2++) {
      send_bits(
        s,
        s.bl_tree[bl_order[rank2] * 2 + 1],
        3
      );
    }
    send_tree(s, s.dyn_ltree, lcodes - 1);
    send_tree(s, s.dyn_dtree, dcodes - 1);
  }
  function detect_data_type(s) {
    var black_mask = 4093624447;
    var n;
    for (n = 0; n <= 31; n++, black_mask >>>= 1) {
      if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
        return Z_BINARY;
      }
    }
    if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
      return Z_TEXT;
    }
    for (n = 32; n < LITERALS; n++) {
      if (s.dyn_ltree[n * 2] !== 0) {
        return Z_TEXT;
      }
    }
    return Z_BINARY;
  }
  var static_init_done = false;
  function _tr_init(s) {
    if (!static_init_done) {
      tr_static_init();
      static_init_done = true;
    }
    s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
    s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
    s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
    s.bi_buf = 0;
    s.bi_valid = 0;
    init_block(s);
  }
  function _tr_stored_block(s, buf, stored_len, last) {
    send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
    copy_block(s, buf, stored_len, true);
  }
  function _tr_align(s) {
    send_bits(s, STATIC_TREES << 1, 3);
    send_code(s, END_BLOCK, static_ltree);
    bi_flush(s);
  }
  function _tr_flush_block(s, buf, stored_len, last) {
    var opt_lenb, static_lenb;
    var max_blindex = 0;
    if (s.level > 0) {
      if (s.strm.data_type === Z_UNKNOWN) {
        s.strm.data_type = detect_data_type(s);
      }
      build_tree(s, s.l_desc);
      build_tree(s, s.d_desc);
      max_blindex = build_bl_tree(s);
      opt_lenb = s.opt_len + 3 + 7 >>> 3;
      static_lenb = s.static_len + 3 + 7 >>> 3;
      if (static_lenb <= opt_lenb) {
        opt_lenb = static_lenb;
      }
    } else {
      opt_lenb = static_lenb = stored_len + 5;
    }
    if (stored_len + 4 <= opt_lenb && buf !== -1) {
      _tr_stored_block(s, buf, stored_len, last);
    } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
      send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
      compress_block(s, static_ltree, static_dtree);
    } else {
      send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
      send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
      compress_block(s, s.dyn_ltree, s.dyn_dtree);
    }
    init_block(s);
    if (last) {
      bi_windup(s);
    }
  }
  function _tr_tally(s, dist, lc) {
    s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
    s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
    s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
    s.last_lit++;
    if (dist === 0) {
      s.dyn_ltree[lc * 2]++;
    } else {
      s.matches++;
      dist--;
      s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
      s.dyn_dtree[d_code(dist) * 2]++;
    }
    return s.last_lit === s.lit_bufsize - 1;
  }
  var _tr_init_1 = _tr_init;
  var _tr_stored_block_1 = _tr_stored_block;
  var _tr_flush_block_1 = _tr_flush_block;
  var _tr_tally_1 = _tr_tally;
  var _tr_align_1 = _tr_align;
  var trees = {
    _tr_init: _tr_init_1,
    _tr_stored_block: _tr_stored_block_1,
    _tr_flush_block: _tr_flush_block_1,
    _tr_tally: _tr_tally_1,
    _tr_align: _tr_align_1
  };
  function adler32(adler, buf, len, pos) {
    var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
    while (len !== 0) {
      n = len > 2e3 ? 2e3 : len;
      len -= n;
      do {
        s1 = s1 + buf[pos++] | 0;
        s2 = s2 + s1 | 0;
      } while (--n);
      s1 %= 65521;
      s2 %= 65521;
    }
    return s1 | s2 << 16 | 0;
  }
  var adler32_1 = adler32;
  function makeTable() {
    var c, table = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      table[n] = c;
    }
    return table;
  }
  var crcTable = makeTable();
  function crc32(crc, buf, len, pos) {
    var t = crcTable, end = pos + len;
    crc ^= -1;
    for (var i = pos; i < end; i++) {
      crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
    }
    return crc ^ -1;
  }
  var crc32_1 = crc32;
  var messages = {
    2: "need dictionary",
    /* Z_NEED_DICT       2  */
    1: "stream end",
    /* Z_STREAM_END      1  */
    0: "",
    /* Z_OK              0  */
    "-1": "file error",
    /* Z_ERRNO         (-1) */
    "-2": "stream error",
    /* Z_STREAM_ERROR  (-2) */
    "-3": "data error",
    /* Z_DATA_ERROR    (-3) */
    "-4": "insufficient memory",
    /* Z_MEM_ERROR     (-4) */
    "-5": "buffer error",
    /* Z_BUF_ERROR     (-5) */
    "-6": "incompatible version"
    /* Z_VERSION_ERROR (-6) */
  };
  var Z_NO_FLUSH = 0;
  var Z_PARTIAL_FLUSH = 1;
  var Z_FULL_FLUSH = 3;
  var Z_FINISH = 4;
  var Z_BLOCK = 5;
  var Z_OK = 0;
  var Z_STREAM_END = 1;
  var Z_STREAM_ERROR = -2;
  var Z_DATA_ERROR = -3;
  var Z_BUF_ERROR = -5;
  var Z_DEFAULT_COMPRESSION = -1;
  var Z_FILTERED = 1;
  var Z_HUFFMAN_ONLY = 2;
  var Z_RLE = 3;
  var Z_FIXED$1 = 4;
  var Z_DEFAULT_STRATEGY = 0;
  var Z_UNKNOWN$1 = 2;
  var Z_DEFLATED = 8;
  var MAX_MEM_LEVEL = 9;
  var MAX_WBITS = 15;
  var DEF_MEM_LEVEL = 8;
  var LENGTH_CODES$1 = 29;
  var LITERALS$1 = 256;
  var L_CODES$1 = LITERALS$1 + 1 + LENGTH_CODES$1;
  var D_CODES$1 = 30;
  var BL_CODES$1 = 19;
  var HEAP_SIZE$1 = 2 * L_CODES$1 + 1;
  var MAX_BITS$1 = 15;
  var MIN_MATCH$1 = 3;
  var MAX_MATCH$1 = 258;
  var MIN_LOOKAHEAD = MAX_MATCH$1 + MIN_MATCH$1 + 1;
  var PRESET_DICT = 32;
  var INIT_STATE = 42;
  var EXTRA_STATE = 69;
  var NAME_STATE = 73;
  var COMMENT_STATE = 91;
  var HCRC_STATE = 103;
  var BUSY_STATE = 113;
  var FINISH_STATE = 666;
  var BS_NEED_MORE = 1;
  var BS_BLOCK_DONE = 2;
  var BS_FINISH_STARTED = 3;
  var BS_FINISH_DONE = 4;
  var OS_CODE = 3;
  function err(strm, errorCode) {
    strm.msg = messages[errorCode];
    return errorCode;
  }
  function rank(f) {
    return (f << 1) - (f > 4 ? 9 : 0);
  }
  function zero$1(buf) {
    var len = buf.length;
    while (--len >= 0) {
      buf[len] = 0;
    }
  }
  function flush_pending(strm) {
    var s = strm.state;
    var len = s.pending;
    if (len > strm.avail_out) {
      len = strm.avail_out;
    }
    if (len === 0) {
      return;
    }
    common.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
    strm.next_out += len;
    s.pending_out += len;
    strm.total_out += len;
    strm.avail_out -= len;
    s.pending -= len;
    if (s.pending === 0) {
      s.pending_out = 0;
    }
  }
  function flush_block_only(s, last) {
    trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
    s.block_start = s.strstart;
    flush_pending(s.strm);
  }
  function put_byte(s, b) {
    s.pending_buf[s.pending++] = b;
  }
  function putShortMSB(s, b) {
    s.pending_buf[s.pending++] = b >>> 8 & 255;
    s.pending_buf[s.pending++] = b & 255;
  }
  function read_buf(strm, buf, start, size) {
    var len = strm.avail_in;
    if (len > size) {
      len = size;
    }
    if (len === 0) {
      return 0;
    }
    strm.avail_in -= len;
    common.arraySet(buf, strm.input, strm.next_in, len, start);
    if (strm.state.wrap === 1) {
      strm.adler = adler32_1(strm.adler, buf, len, start);
    } else if (strm.state.wrap === 2) {
      strm.adler = crc32_1(strm.adler, buf, len, start);
    }
    strm.next_in += len;
    strm.total_in += len;
    return len;
  }
  function longest_match(s, cur_match) {
    var chain_length = s.max_chain_length;
    var scan = s.strstart;
    var match;
    var len;
    var best_len = s.prev_length;
    var nice_match = s.nice_match;
    var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
    var _win = s.window;
    var wmask = s.w_mask;
    var prev = s.prev;
    var strend = s.strstart + MAX_MATCH$1;
    var scan_end1 = _win[scan + best_len - 1];
    var scan_end = _win[scan + best_len];
    if (s.prev_length >= s.good_match) {
      chain_length >>= 2;
    }
    if (nice_match > s.lookahead) {
      nice_match = s.lookahead;
    }
    do {
      match = cur_match;
      if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
        continue;
      }
      scan += 2;
      match++;
      do {
      } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
      len = MAX_MATCH$1 - (strend - scan);
      scan = strend - MAX_MATCH$1;
      if (len > best_len) {
        s.match_start = cur_match;
        best_len = len;
        if (len >= nice_match) {
          break;
        }
        scan_end1 = _win[scan + best_len - 1];
        scan_end = _win[scan + best_len];
      }
    } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
    if (best_len <= s.lookahead) {
      return best_len;
    }
    return s.lookahead;
  }
  function fill_window(s) {
    var _w_size = s.w_size;
    var p, n, m, more, str;
    do {
      more = s.window_size - s.lookahead - s.strstart;
      if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
        common.arraySet(s.window, s.window, _w_size, _w_size, 0);
        s.match_start -= _w_size;
        s.strstart -= _w_size;
        s.block_start -= _w_size;
        n = s.hash_size;
        p = n;
        do {
          m = s.head[--p];
          s.head[p] = m >= _w_size ? m - _w_size : 0;
        } while (--n);
        n = _w_size;
        p = n;
        do {
          m = s.prev[--p];
          s.prev[p] = m >= _w_size ? m - _w_size : 0;
        } while (--n);
        more += _w_size;
      }
      if (s.strm.avail_in === 0) {
        break;
      }
      n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
      s.lookahead += n;
      if (s.lookahead + s.insert >= MIN_MATCH$1) {
        str = s.strstart - s.insert;
        s.ins_h = s.window[str];
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
        while (s.insert) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH$1 - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
          s.insert--;
          if (s.lookahead + s.insert < MIN_MATCH$1) {
            break;
          }
        }
      }
    } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
  }
  function deflate_stored(s, flush) {
    var max_block_size = 65535;
    if (max_block_size > s.pending_buf_size - 5) {
      max_block_size = s.pending_buf_size - 5;
    }
    for (; ; ) {
      if (s.lookahead <= 1) {
        fill_window(s);
        if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      s.strstart += s.lookahead;
      s.lookahead = 0;
      var max_start = s.block_start + max_block_size;
      if (s.strstart === 0 || s.strstart >= max_start) {
        s.lookahead = s.strstart - max_start;
        s.strstart = max_start;
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.strstart > s.block_start) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_NEED_MORE;
  }
  function deflate_fast(s, flush) {
    var hash_head;
    var bflush;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH$1) {
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
      }
      if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
      }
      if (s.match_length >= MIN_MATCH$1) {
        bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH$1);
        s.lookahead -= s.match_length;
        if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH$1) {
          s.match_length--;
          do {
            s.strstart++;
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          } while (--s.match_length !== 0);
          s.strstart++;
        } else {
          s.strstart += s.match_length;
          s.match_length = 0;
          s.ins_h = s.window[s.strstart];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
        }
      } else {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = s.strstart < MIN_MATCH$1 - 1 ? s.strstart : MIN_MATCH$1 - 1;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function deflate_slow(s, flush) {
    var hash_head;
    var bflush;
    var max_insert;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH$1) {
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = s.strstart;
      }
      s.prev_length = s.match_length;
      s.prev_match = s.match_start;
      s.match_length = MIN_MATCH$1 - 1;
      if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
        if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH$1 && s.strstart - s.match_start > 4096)) {
          s.match_length = MIN_MATCH$1 - 1;
        }
      }
      if (s.prev_length >= MIN_MATCH$1 && s.match_length <= s.prev_length) {
        max_insert = s.strstart + s.lookahead - MIN_MATCH$1;
        bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH$1);
        s.lookahead -= s.prev_length - 1;
        s.prev_length -= 2;
        do {
          if (++s.strstart <= max_insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
        } while (--s.prev_length !== 0);
        s.match_available = 0;
        s.match_length = MIN_MATCH$1 - 1;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      } else if (s.match_available) {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
        if (bflush) {
          flush_block_only(s, false);
        }
        s.strstart++;
        s.lookahead--;
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      } else {
        s.match_available = 1;
        s.strstart++;
        s.lookahead--;
      }
    }
    if (s.match_available) {
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
      s.match_available = 0;
    }
    s.insert = s.strstart < MIN_MATCH$1 - 1 ? s.strstart : MIN_MATCH$1 - 1;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function deflate_rle(s, flush) {
    var bflush;
    var prev;
    var scan, strend;
    var _win = s.window;
    for (; ; ) {
      if (s.lookahead <= MAX_MATCH$1) {
        fill_window(s);
        if (s.lookahead <= MAX_MATCH$1 && flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        if (s.lookahead === 0) {
          break;
        }
      }
      s.match_length = 0;
      if (s.lookahead >= MIN_MATCH$1 && s.strstart > 0) {
        scan = s.strstart - 1;
        prev = _win[scan];
        if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
          strend = s.strstart + MAX_MATCH$1;
          do {
          } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
          s.match_length = MAX_MATCH$1 - (strend - scan);
          if (s.match_length > s.lookahead) {
            s.match_length = s.lookahead;
          }
        }
      }
      if (s.match_length >= MIN_MATCH$1) {
        bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH$1);
        s.lookahead -= s.match_length;
        s.strstart += s.match_length;
        s.match_length = 0;
      } else {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function deflate_huff(s, flush) {
    var bflush;
    for (; ; ) {
      if (s.lookahead === 0) {
        fill_window(s);
        if (s.lookahead === 0) {
          if (flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          break;
        }
      }
      s.match_length = 0;
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
    }
    s.insert = 0;
    if (flush === Z_FINISH) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) {
        return BS_FINISH_STARTED;
      }
      return BS_FINISH_DONE;
    }
    if (s.last_lit) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    }
    return BS_BLOCK_DONE;
  }
  function Config(good_length, max_lazy, nice_length, max_chain, func) {
    this.good_length = good_length;
    this.max_lazy = max_lazy;
    this.nice_length = nice_length;
    this.max_chain = max_chain;
    this.func = func;
  }
  var configuration_table;
  configuration_table = [
    /*      good lazy nice chain */
    new Config(0, 0, 0, 0, deflate_stored),
    /* 0 store only */
    new Config(4, 4, 8, 4, deflate_fast),
    /* 1 max speed, no lazy matches */
    new Config(4, 5, 16, 8, deflate_fast),
    /* 2 */
    new Config(4, 6, 32, 32, deflate_fast),
    /* 3 */
    new Config(4, 4, 16, 16, deflate_slow),
    /* 4 lazy matches */
    new Config(8, 16, 32, 32, deflate_slow),
    /* 5 */
    new Config(8, 16, 128, 128, deflate_slow),
    /* 6 */
    new Config(8, 32, 128, 256, deflate_slow),
    /* 7 */
    new Config(32, 128, 258, 1024, deflate_slow),
    /* 8 */
    new Config(32, 258, 258, 4096, deflate_slow)
    /* 9 max compression */
  ];
  function lm_init(s) {
    s.window_size = 2 * s.w_size;
    zero$1(s.head);
    s.max_lazy_match = configuration_table[s.level].max_lazy;
    s.good_match = configuration_table[s.level].good_length;
    s.nice_match = configuration_table[s.level].nice_length;
    s.max_chain_length = configuration_table[s.level].max_chain;
    s.strstart = 0;
    s.block_start = 0;
    s.lookahead = 0;
    s.insert = 0;
    s.match_length = s.prev_length = MIN_MATCH$1 - 1;
    s.match_available = 0;
    s.ins_h = 0;
  }
  function DeflateState() {
    this.strm = null;
    this.status = 0;
    this.pending_buf = null;
    this.pending_buf_size = 0;
    this.pending_out = 0;
    this.pending = 0;
    this.wrap = 0;
    this.gzhead = null;
    this.gzindex = 0;
    this.method = Z_DEFLATED;
    this.last_flush = -1;
    this.w_size = 0;
    this.w_bits = 0;
    this.w_mask = 0;
    this.window = null;
    this.window_size = 0;
    this.prev = null;
    this.head = null;
    this.ins_h = 0;
    this.hash_size = 0;
    this.hash_bits = 0;
    this.hash_mask = 0;
    this.hash_shift = 0;
    this.block_start = 0;
    this.match_length = 0;
    this.prev_match = 0;
    this.match_available = 0;
    this.strstart = 0;
    this.match_start = 0;
    this.lookahead = 0;
    this.prev_length = 0;
    this.max_chain_length = 0;
    this.max_lazy_match = 0;
    this.level = 0;
    this.strategy = 0;
    this.good_match = 0;
    this.nice_match = 0;
    this.dyn_ltree = new common.Buf16(HEAP_SIZE$1 * 2);
    this.dyn_dtree = new common.Buf16((2 * D_CODES$1 + 1) * 2);
    this.bl_tree = new common.Buf16((2 * BL_CODES$1 + 1) * 2);
    zero$1(this.dyn_ltree);
    zero$1(this.dyn_dtree);
    zero$1(this.bl_tree);
    this.l_desc = null;
    this.d_desc = null;
    this.bl_desc = null;
    this.bl_count = new common.Buf16(MAX_BITS$1 + 1);
    this.heap = new common.Buf16(2 * L_CODES$1 + 1);
    zero$1(this.heap);
    this.heap_len = 0;
    this.heap_max = 0;
    this.depth = new common.Buf16(2 * L_CODES$1 + 1);
    zero$1(this.depth);
    this.l_buf = 0;
    this.lit_bufsize = 0;
    this.last_lit = 0;
    this.d_buf = 0;
    this.opt_len = 0;
    this.static_len = 0;
    this.matches = 0;
    this.insert = 0;
    this.bi_buf = 0;
    this.bi_valid = 0;
  }
  function deflateResetKeep(strm) {
    var s;
    if (!strm || !strm.state) {
      return err(strm, Z_STREAM_ERROR);
    }
    strm.total_in = strm.total_out = 0;
    strm.data_type = Z_UNKNOWN$1;
    s = strm.state;
    s.pending = 0;
    s.pending_out = 0;
    if (s.wrap < 0) {
      s.wrap = -s.wrap;
    }
    s.status = s.wrap ? INIT_STATE : BUSY_STATE;
    strm.adler = s.wrap === 2 ? 0 : 1;
    s.last_flush = Z_NO_FLUSH;
    trees._tr_init(s);
    return Z_OK;
  }
  function deflateReset(strm) {
    var ret = deflateResetKeep(strm);
    if (ret === Z_OK) {
      lm_init(strm.state);
    }
    return ret;
  }
  function deflateSetHeader(strm, head) {
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    if (strm.state.wrap !== 2) {
      return Z_STREAM_ERROR;
    }
    strm.state.gzhead = head;
    return Z_OK;
  }
  function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
    if (!strm) {
      return Z_STREAM_ERROR;
    }
    var wrap = 1;
    if (level === Z_DEFAULT_COMPRESSION) {
      level = 6;
    }
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else if (windowBits > 15) {
      wrap = 2;
      windowBits -= 16;
    }
    if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED$1) {
      return err(strm, Z_STREAM_ERROR);
    }
    if (windowBits === 8) {
      windowBits = 9;
    }
    var s = new DeflateState();
    strm.state = s;
    s.strm = strm;
    s.wrap = wrap;
    s.gzhead = null;
    s.w_bits = windowBits;
    s.w_size = 1 << s.w_bits;
    s.w_mask = s.w_size - 1;
    s.hash_bits = memLevel + 7;
    s.hash_size = 1 << s.hash_bits;
    s.hash_mask = s.hash_size - 1;
    s.hash_shift = ~~((s.hash_bits + MIN_MATCH$1 - 1) / MIN_MATCH$1);
    s.window = new common.Buf8(s.w_size * 2);
    s.head = new common.Buf16(s.hash_size);
    s.prev = new common.Buf16(s.w_size);
    s.lit_bufsize = 1 << memLevel + 6;
    s.pending_buf_size = s.lit_bufsize * 4;
    s.pending_buf = new common.Buf8(s.pending_buf_size);
    s.d_buf = 1 * s.lit_bufsize;
    s.l_buf = (1 + 2) * s.lit_bufsize;
    s.level = level;
    s.strategy = strategy;
    s.method = method;
    return deflateReset(strm);
  }
  function deflateInit(strm, level) {
    return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
  }
  function deflate(strm, flush) {
    var old_flush, s;
    var beg, val;
    if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
      return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
    }
    s = strm.state;
    if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
      return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
    }
    s.strm = strm;
    old_flush = s.last_flush;
    s.last_flush = flush;
    if (s.status === INIT_STATE) {
      if (s.wrap === 2) {
        strm.adler = 0;
        put_byte(s, 31);
        put_byte(s, 139);
        put_byte(s, 8);
        if (!s.gzhead) {
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, 0);
          put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
          put_byte(s, OS_CODE);
          s.status = BUSY_STATE;
        } else {
          put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
          put_byte(s, s.gzhead.time & 255);
          put_byte(s, s.gzhead.time >> 8 & 255);
          put_byte(s, s.gzhead.time >> 16 & 255);
          put_byte(s, s.gzhead.time >> 24 & 255);
          put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
          put_byte(s, s.gzhead.os & 255);
          if (s.gzhead.extra && s.gzhead.extra.length) {
            put_byte(s, s.gzhead.extra.length & 255);
            put_byte(s, s.gzhead.extra.length >> 8 & 255);
          }
          if (s.gzhead.hcrc) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
          }
          s.gzindex = 0;
          s.status = EXTRA_STATE;
        }
      } else {
        var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
        var level_flags = -1;
        if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
          level_flags = 0;
        } else if (s.level < 6) {
          level_flags = 1;
        } else if (s.level === 6) {
          level_flags = 2;
        } else {
          level_flags = 3;
        }
        header |= level_flags << 6;
        if (s.strstart !== 0) {
          header |= PRESET_DICT;
        }
        header += 31 - header % 31;
        s.status = BUSY_STATE;
        putShortMSB(s, header);
        if (s.strstart !== 0) {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 65535);
        }
        strm.adler = 1;
      }
    }
    if (s.status === EXTRA_STATE) {
      if (s.gzhead.extra) {
        beg = s.pending;
        while (s.gzindex < (s.gzhead.extra.length & 65535)) {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              break;
            }
          }
          put_byte(s, s.gzhead.extra[s.gzindex] & 255);
          s.gzindex++;
        }
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (s.gzindex === s.gzhead.extra.length) {
          s.gzindex = 0;
          s.status = NAME_STATE;
        }
      } else {
        s.status = NAME_STATE;
      }
    }
    if (s.status === NAME_STATE) {
      if (s.gzhead.name) {
        beg = s.pending;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          if (s.gzindex < s.gzhead.name.length) {
            val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.gzindex = 0;
          s.status = COMMENT_STATE;
        }
      } else {
        s.status = COMMENT_STATE;
      }
    }
    if (s.status === COMMENT_STATE) {
      if (s.gzhead.comment) {
        beg = s.pending;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            flush_pending(strm);
            beg = s.pending;
            if (s.pending === s.pending_buf_size) {
              val = 1;
              break;
            }
          }
          if (s.gzindex < s.gzhead.comment.length) {
            val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
          } else {
            val = 0;
          }
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        if (val === 0) {
          s.status = HCRC_STATE;
        }
      } else {
        s.status = HCRC_STATE;
      }
    }
    if (s.status === HCRC_STATE) {
      if (s.gzhead.hcrc) {
        if (s.pending + 2 > s.pending_buf_size) {
          flush_pending(strm);
        }
        if (s.pending + 2 <= s.pending_buf_size) {
          put_byte(s, strm.adler & 255);
          put_byte(s, strm.adler >> 8 & 255);
          strm.adler = 0;
          s.status = BUSY_STATE;
        }
      } else {
        s.status = BUSY_STATE;
      }
    }
    if (s.pending !== 0) {
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return Z_OK;
      }
    } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
      return err(strm, Z_BUF_ERROR);
    }
    if (s.status === FINISH_STATE && strm.avail_in !== 0) {
      return err(strm, Z_BUF_ERROR);
    }
    if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
      var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
      if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
        s.status = FINISH_STATE;
      }
      if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
        if (strm.avail_out === 0) {
          s.last_flush = -1;
        }
        return Z_OK;
      }
      if (bstate === BS_BLOCK_DONE) {
        if (flush === Z_PARTIAL_FLUSH) {
          trees._tr_align(s);
        } else if (flush !== Z_BLOCK) {
          trees._tr_stored_block(s, 0, 0, false);
          if (flush === Z_FULL_FLUSH) {
            zero$1(s.head);
            if (s.lookahead === 0) {
              s.strstart = 0;
              s.block_start = 0;
              s.insert = 0;
            }
          }
        }
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      }
    }
    if (flush !== Z_FINISH) {
      return Z_OK;
    }
    if (s.wrap <= 0) {
      return Z_STREAM_END;
    }
    if (s.wrap === 2) {
      put_byte(s, strm.adler & 255);
      put_byte(s, strm.adler >> 8 & 255);
      put_byte(s, strm.adler >> 16 & 255);
      put_byte(s, strm.adler >> 24 & 255);
      put_byte(s, strm.total_in & 255);
      put_byte(s, strm.total_in >> 8 & 255);
      put_byte(s, strm.total_in >> 16 & 255);
      put_byte(s, strm.total_in >> 24 & 255);
    } else {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 65535);
    }
    flush_pending(strm);
    if (s.wrap > 0) {
      s.wrap = -s.wrap;
    }
    return s.pending !== 0 ? Z_OK : Z_STREAM_END;
  }
  function deflateEnd(strm) {
    var status;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    status = strm.state.status;
    if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
      return err(strm, Z_STREAM_ERROR);
    }
    strm.state = null;
    return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
  }
  function deflateSetDictionary(strm, dictionary) {
    var dictLength = dictionary.length;
    var s;
    var str, n;
    var wrap;
    var avail;
    var next;
    var input;
    var tmpDict;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR;
    }
    s = strm.state;
    wrap = s.wrap;
    if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
      return Z_STREAM_ERROR;
    }
    if (wrap === 1) {
      strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
    }
    s.wrap = 0;
    if (dictLength >= s.w_size) {
      if (wrap === 0) {
        zero$1(s.head);
        s.strstart = 0;
        s.block_start = 0;
        s.insert = 0;
      }
      tmpDict = new common.Buf8(s.w_size);
      common.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
      dictionary = tmpDict;
      dictLength = s.w_size;
    }
    avail = strm.avail_in;
    next = strm.next_in;
    input = strm.input;
    strm.avail_in = dictLength;
    strm.next_in = 0;
    strm.input = dictionary;
    fill_window(s);
    while (s.lookahead >= MIN_MATCH$1) {
      str = s.strstart;
      n = s.lookahead - (MIN_MATCH$1 - 1);
      do {
        s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH$1 - 1]) & s.hash_mask;
        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
      } while (--n);
      s.strstart = str;
      s.lookahead = MIN_MATCH$1 - 1;
      fill_window(s);
    }
    s.strstart += s.lookahead;
    s.block_start = s.strstart;
    s.insert = s.lookahead;
    s.lookahead = 0;
    s.match_length = s.prev_length = MIN_MATCH$1 - 1;
    s.match_available = 0;
    strm.next_in = next;
    strm.input = input;
    strm.avail_in = avail;
    s.wrap = wrap;
    return Z_OK;
  }
  var deflateInit_1 = deflateInit;
  var deflateInit2_1 = deflateInit2;
  var deflateReset_1 = deflateReset;
  var deflateResetKeep_1 = deflateResetKeep;
  var deflateSetHeader_1 = deflateSetHeader;
  var deflate_2 = deflate;
  var deflateEnd_1 = deflateEnd;
  var deflateSetDictionary_1 = deflateSetDictionary;
  var deflateInfo = "pako deflate (from Nodeca project)";
  var deflate_1 = {
    deflateInit: deflateInit_1,
    deflateInit2: deflateInit2_1,
    deflateReset: deflateReset_1,
    deflateResetKeep: deflateResetKeep_1,
    deflateSetHeader: deflateSetHeader_1,
    deflate: deflate_2,
    deflateEnd: deflateEnd_1,
    deflateSetDictionary: deflateSetDictionary_1,
    deflateInfo
  };
  var STR_APPLY_OK = true;
  var STR_APPLY_UIA_OK = true;
  try {
    String.fromCharCode.apply(null, [0]);
  } catch (__) {
    STR_APPLY_OK = false;
  }
  try {
    String.fromCharCode.apply(null, new Uint8Array(1));
  } catch (__) {
    STR_APPLY_UIA_OK = false;
  }
  var _utf8len = new common.Buf8(256);
  for (q = 0; q < 256; q++) {
    _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
  }
  var q;
  _utf8len[254] = _utf8len[254] = 1;
  var string2buf = function(str) {
    var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
    for (m_pos = 0; m_pos < str_len; m_pos++) {
      c = str.charCodeAt(m_pos);
      if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
        c2 = str.charCodeAt(m_pos + 1);
        if ((c2 & 64512) === 56320) {
          c = 65536 + (c - 55296 << 10) + (c2 - 56320);
          m_pos++;
        }
      }
      buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
    }
    buf = new common.Buf8(buf_len);
    for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
      c = str.charCodeAt(m_pos);
      if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
        c2 = str.charCodeAt(m_pos + 1);
        if ((c2 & 64512) === 56320) {
          c = 65536 + (c - 55296 << 10) + (c2 - 56320);
          m_pos++;
        }
      }
      if (c < 128) {
        buf[i++] = c;
      } else if (c < 2048) {
        buf[i++] = 192 | c >>> 6;
        buf[i++] = 128 | c & 63;
      } else if (c < 65536) {
        buf[i++] = 224 | c >>> 12;
        buf[i++] = 128 | c >>> 6 & 63;
        buf[i++] = 128 | c & 63;
      } else {
        buf[i++] = 240 | c >>> 18;
        buf[i++] = 128 | c >>> 12 & 63;
        buf[i++] = 128 | c >>> 6 & 63;
        buf[i++] = 128 | c & 63;
      }
    }
    return buf;
  };
  function buf2binstring(buf, len) {
    if (len < 65534) {
      if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
        return String.fromCharCode.apply(null, common.shrinkBuf(buf, len));
      }
    }
    var result = "";
    for (var i = 0; i < len; i++) {
      result += String.fromCharCode(buf[i]);
    }
    return result;
  }
  var buf2binstring_1 = function(buf) {
    return buf2binstring(buf, buf.length);
  };
  var binstring2buf = function(str) {
    var buf = new common.Buf8(str.length);
    for (var i = 0, len = buf.length; i < len; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  };
  var buf2string = function(buf, max) {
    var i, out, c, c_len;
    var len = max || buf.length;
    var utf16buf = new Array(len * 2);
    for (out = 0, i = 0; i < len; ) {
      c = buf[i++];
      if (c < 128) {
        utf16buf[out++] = c;
        continue;
      }
      c_len = _utf8len[c];
      if (c_len > 4) {
        utf16buf[out++] = 65533;
        i += c_len - 1;
        continue;
      }
      c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
      while (c_len > 1 && i < len) {
        c = c << 6 | buf[i++] & 63;
        c_len--;
      }
      if (c_len > 1) {
        utf16buf[out++] = 65533;
        continue;
      }
      if (c < 65536) {
        utf16buf[out++] = c;
      } else {
        c -= 65536;
        utf16buf[out++] = 55296 | c >> 10 & 1023;
        utf16buf[out++] = 56320 | c & 1023;
      }
    }
    return buf2binstring(utf16buf, out);
  };
  var utf8border = function(buf, max) {
    var pos;
    max = max || buf.length;
    if (max > buf.length) {
      max = buf.length;
    }
    pos = max - 1;
    while (pos >= 0 && (buf[pos] & 192) === 128) {
      pos--;
    }
    if (pos < 0) {
      return max;
    }
    if (pos === 0) {
      return max;
    }
    return pos + _utf8len[buf[pos]] > max ? pos : max;
  };
  var strings = {
    string2buf,
    buf2binstring: buf2binstring_1,
    binstring2buf,
    buf2string,
    utf8border
  };
  function ZStream() {
    this.input = null;
    this.next_in = 0;
    this.avail_in = 0;
    this.total_in = 0;
    this.output = null;
    this.next_out = 0;
    this.avail_out = 0;
    this.total_out = 0;
    this.msg = "";
    this.state = null;
    this.data_type = 2;
    this.adler = 0;
  }
  var zstream = ZStream;
  var toString = Object.prototype.toString;
  var Z_NO_FLUSH$1 = 0;
  var Z_FINISH$1 = 4;
  var Z_OK$1 = 0;
  var Z_STREAM_END$1 = 1;
  var Z_SYNC_FLUSH = 2;
  var Z_DEFAULT_COMPRESSION$1 = -1;
  var Z_DEFAULT_STRATEGY$1 = 0;
  var Z_DEFLATED$1 = 8;
  function Deflate(options) {
    if (!(this instanceof Deflate)) return new Deflate(options);
    this.options = common.assign({
      level: Z_DEFAULT_COMPRESSION$1,
      method: Z_DEFLATED$1,
      chunkSize: 16384,
      windowBits: 15,
      memLevel: 8,
      strategy: Z_DEFAULT_STRATEGY$1,
      to: ""
    }, options || {});
    var opt = this.options;
    if (opt.raw && opt.windowBits > 0) {
      opt.windowBits = -opt.windowBits;
    } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
      opt.windowBits += 16;
    }
    this.err = 0;
    this.msg = "";
    this.ended = false;
    this.chunks = [];
    this.strm = new zstream();
    this.strm.avail_out = 0;
    var status = deflate_1.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy);
    if (status !== Z_OK$1) {
      throw new Error(messages[status]);
    }
    if (opt.header) {
      deflate_1.deflateSetHeader(this.strm, opt.header);
    }
    if (opt.dictionary) {
      var dict;
      if (typeof opt.dictionary === "string") {
        dict = strings.string2buf(opt.dictionary);
      } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
        dict = new Uint8Array(opt.dictionary);
      } else {
        dict = opt.dictionary;
      }
      status = deflate_1.deflateSetDictionary(this.strm, dict);
      if (status !== Z_OK$1) {
        throw new Error(messages[status]);
      }
      this._dict_set = true;
    }
  }
  Deflate.prototype.push = function(data, mode) {
    var strm = this.strm;
    var chunkSize = this.options.chunkSize;
    var status, _mode;
    if (this.ended) {
      return false;
    }
    _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH$1 : Z_NO_FLUSH$1;
    if (typeof data === "string") {
      strm.input = strings.string2buf(data);
    } else if (toString.call(data) === "[object ArrayBuffer]") {
      strm.input = new Uint8Array(data);
    } else {
      strm.input = data;
    }
    strm.next_in = 0;
    strm.avail_in = strm.input.length;
    do {
      if (strm.avail_out === 0) {
        strm.output = new common.Buf8(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }
      status = deflate_1.deflate(strm, _mode);
      if (status !== Z_STREAM_END$1 && status !== Z_OK$1) {
        this.onEnd(status);
        this.ended = true;
        return false;
      }
      if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH$1 || _mode === Z_SYNC_FLUSH)) {
        if (this.options.to === "string") {
          this.onData(strings.buf2binstring(common.shrinkBuf(strm.output, strm.next_out)));
        } else {
          this.onData(common.shrinkBuf(strm.output, strm.next_out));
        }
      }
    } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END$1);
    if (_mode === Z_FINISH$1) {
      status = deflate_1.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$1;
    }
    if (_mode === Z_SYNC_FLUSH) {
      this.onEnd(Z_OK$1);
      strm.avail_out = 0;
      return true;
    }
    return true;
  };
  Deflate.prototype.onData = function(chunk) {
    this.chunks.push(chunk);
  };
  Deflate.prototype.onEnd = function(status) {
    if (status === Z_OK$1) {
      if (this.options.to === "string") {
        this.result = this.chunks.join("");
      } else {
        this.result = common.flattenChunks(this.chunks);
      }
    }
    this.chunks = [];
    this.err = status;
    this.msg = this.strm.msg;
  };
  function deflate$1(input, options) {
    var deflator = new Deflate(options);
    deflator.push(input, true);
    if (deflator.err) {
      throw deflator.msg || messages[deflator.err];
    }
    return deflator.result;
  }
  function deflateRaw(input, options) {
    options = options || {};
    options.raw = true;
    return deflate$1(input, options);
  }
  function gzip(input, options) {
    options = options || {};
    options.gzip = true;
    return deflate$1(input, options);
  }
  var Deflate_1 = Deflate;
  var deflate_2$1 = deflate$1;
  var deflateRaw_1 = deflateRaw;
  var gzip_1 = gzip;
  var deflate_1$1 = {
    Deflate: Deflate_1,
    deflate: deflate_2$1,
    deflateRaw: deflateRaw_1,
    gzip: gzip_1
  };
  var BAD = 30;
  var TYPE = 12;
  var inffast = function inflate_fast(strm, start) {
    var state;
    var _in;
    var last;
    var _out;
    var beg;
    var end;
    var dmax;
    var wsize;
    var whave;
    var wnext;
    var s_window;
    var hold;
    var bits;
    var lcode;
    var dcode;
    var lmask;
    var dmask;
    var here;
    var op;
    var len;
    var dist;
    var from;
    var from_source;
    var input, output;
    state = strm.state;
    _in = strm.next_in;
    input = strm.input;
    last = _in + (strm.avail_in - 5);
    _out = strm.next_out;
    output = strm.output;
    beg = _out - (start - strm.avail_out);
    end = _out + (strm.avail_out - 257);
    dmax = state.dmax;
    wsize = state.wsize;
    whave = state.whave;
    wnext = state.wnext;
    s_window = state.window;
    hold = state.hold;
    bits = state.bits;
    lcode = state.lencode;
    dcode = state.distcode;
    lmask = (1 << state.lenbits) - 1;
    dmask = (1 << state.distbits) - 1;
    top: do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen: for (; ; ) {
        op = here >>> 24;
        hold >>>= op;
        bits -= op;
        op = here >>> 16 & 255;
        if (op === 0) {
          output[_out++] = here & 65535;
        } else if (op & 16) {
          len = here & 65535;
          op &= 15;
          if (op) {
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
            }
            len += hold & (1 << op) - 1;
            hold >>>= op;
            bits -= op;
          }
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = dcode[hold & dmask];
          dodist: for (; ; ) {
            op = here >>> 24;
            hold >>>= op;
            bits -= op;
            op = here >>> 16 & 255;
            if (op & 16) {
              dist = here & 65535;
              op &= 15;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
                if (bits < op) {
                  hold += input[_in++] << bits;
                  bits += 8;
                }
              }
              dist += hold & (1 << op) - 1;
              if (dist > dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break top;
              }
              hold >>>= op;
              bits -= op;
              op = _out - beg;
              if (dist > op) {
                op = dist - op;
                if (op > whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break top;
                  }
                }
                from = 0;
                from_source = s_window;
                if (wnext === 0) {
                  from += wsize - op;
                  if (op < len) {
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;
                    from_source = output;
                  }
                } else if (wnext < op) {
                  from += wsize + wnext - op;
                  op -= wnext;
                  if (op < len) {
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = 0;
                    if (wnext < len) {
                      op = wnext;
                      len -= op;
                      do {
                        output[_out++] = s_window[from++];
                      } while (--op);
                      from = _out - dist;
                      from_source = output;
                    }
                  }
                } else {
                  from += wnext - op;
                  if (op < len) {
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;
                    from_source = output;
                  }
                }
                while (len > 2) {
                  output[_out++] = from_source[from++];
                  output[_out++] = from_source[from++];
                  output[_out++] = from_source[from++];
                  len -= 3;
                }
                if (len) {
                  output[_out++] = from_source[from++];
                  if (len > 1) {
                    output[_out++] = from_source[from++];
                  }
                }
              } else {
                from = _out - dist;
                do {
                  output[_out++] = output[from++];
                  output[_out++] = output[from++];
                  output[_out++] = output[from++];
                  len -= 3;
                } while (len > 2);
                if (len) {
                  output[_out++] = output[from++];
                  if (len > 1) {
                    output[_out++] = output[from++];
                  }
                }
              }
            } else if ((op & 64) === 0) {
              here = dcode[(here & 65535) + /*here.val*/
              (hold & (1 << op) - 1)];
              continue dodist;
            } else {
              strm.msg = "invalid distance code";
              state.mode = BAD;
              break top;
            }
            break;
          }
        } else if ((op & 64) === 0) {
          here = lcode[(here & 65535) + /*here.val*/
          (hold & (1 << op) - 1)];
          continue dolen;
        } else if (op & 32) {
          state.mode = TYPE;
          break top;
        } else {
          strm.msg = "invalid literal/length code";
          state.mode = BAD;
          break top;
        }
        break;
      }
    } while (_in < last && _out < end);
    len = bits >> 3;
    _in -= len;
    bits -= len << 3;
    hold &= (1 << bits) - 1;
    strm.next_in = _in;
    strm.next_out = _out;
    strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
    strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
    state.hold = hold;
    state.bits = bits;
    return;
  };
  var MAXBITS = 15;
  var ENOUGH_LENS = 852;
  var ENOUGH_DISTS = 592;
  var CODES = 0;
  var LENS = 1;
  var DISTS = 2;
  var lbase = [
    /* Length codes 257..285 base */
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    13,
    15,
    17,
    19,
    23,
    27,
    31,
    35,
    43,
    51,
    59,
    67,
    83,
    99,
    115,
    131,
    163,
    195,
    227,
    258,
    0,
    0
  ];
  var lext = [
    /* Length codes 257..285 extra */
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    17,
    17,
    17,
    17,
    18,
    18,
    18,
    18,
    19,
    19,
    19,
    19,
    20,
    20,
    20,
    20,
    21,
    21,
    21,
    21,
    16,
    72,
    78
  ];
  var dbase = [
    /* Distance codes 0..29 base */
    1,
    2,
    3,
    4,
    5,
    7,
    9,
    13,
    17,
    25,
    33,
    49,
    65,
    97,
    129,
    193,
    257,
    385,
    513,
    769,
    1025,
    1537,
    2049,
    3073,
    4097,
    6145,
    8193,
    12289,
    16385,
    24577,
    0,
    0
  ];
  var dext = [
    /* Distance codes 0..29 extra */
    16,
    16,
    16,
    16,
    17,
    17,
    18,
    18,
    19,
    19,
    20,
    20,
    21,
    21,
    22,
    22,
    23,
    23,
    24,
    24,
    25,
    25,
    26,
    26,
    27,
    27,
    28,
    28,
    29,
    29,
    64,
    64
  ];
  var inftrees = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
    var bits = opts.bits;
    var len = 0;
    var sym = 0;
    var min = 0, max = 0;
    var root = 0;
    var curr = 0;
    var drop = 0;
    var left = 0;
    var used = 0;
    var huff = 0;
    var incr;
    var fill;
    var low;
    var mask;
    var next;
    var base = null;
    var base_index = 0;
    var end;
    var count = new common.Buf16(MAXBITS + 1);
    var offs = new common.Buf16(MAXBITS + 1);
    var extra = null;
    var extra_index = 0;
    var here_bits, here_op, here_val;
    for (len = 0; len <= MAXBITS; len++) {
      count[len] = 0;
    }
    for (sym = 0; sym < codes; sym++) {
      count[lens[lens_index + sym]]++;
    }
    root = bits;
    for (max = MAXBITS; max >= 1; max--) {
      if (count[max] !== 0) {
        break;
      }
    }
    if (root > max) {
      root = max;
    }
    if (max === 0) {
      table[table_index++] = 1 << 24 | 64 << 16 | 0;
      table[table_index++] = 1 << 24 | 64 << 16 | 0;
      opts.bits = 1;
      return 0;
    }
    for (min = 1; min < max; min++) {
      if (count[min] !== 0) {
        break;
      }
    }
    if (root < min) {
      root = min;
    }
    left = 1;
    for (len = 1; len <= MAXBITS; len++) {
      left <<= 1;
      left -= count[len];
      if (left < 0) {
        return -1;
      }
    }
    if (left > 0 && (type === CODES || max !== 1)) {
      return -1;
    }
    offs[1] = 0;
    for (len = 1; len < MAXBITS; len++) {
      offs[len + 1] = offs[len] + count[len];
    }
    for (sym = 0; sym < codes; sym++) {
      if (lens[lens_index + sym] !== 0) {
        work[offs[lens[lens_index + sym]]++] = sym;
      }
    }
    if (type === CODES) {
      base = extra = work;
      end = 19;
    } else if (type === LENS) {
      base = lbase;
      base_index -= 257;
      extra = lext;
      extra_index -= 257;
      end = 256;
    } else {
      base = dbase;
      extra = dext;
      end = -1;
    }
    huff = 0;
    sym = 0;
    len = min;
    next = table_index;
    curr = root;
    drop = 0;
    low = -1;
    used = 1 << root;
    mask = used - 1;
    if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
      return 1;
    }
    for (; ; ) {
      here_bits = len - drop;
      if (work[sym] < end) {
        here_op = 0;
        here_val = work[sym];
      } else if (work[sym] > end) {
        here_op = extra[extra_index + work[sym]];
        here_val = base[base_index + work[sym]];
      } else {
        here_op = 32 + 64;
        here_val = 0;
      }
      incr = 1 << len - drop;
      fill = 1 << curr;
      min = fill;
      do {
        fill -= incr;
        table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
      } while (fill !== 0);
      incr = 1 << len - 1;
      while (huff & incr) {
        incr >>= 1;
      }
      if (incr !== 0) {
        huff &= incr - 1;
        huff += incr;
      } else {
        huff = 0;
      }
      sym++;
      if (--count[len] === 0) {
        if (len === max) {
          break;
        }
        len = lens[lens_index + work[sym]];
      }
      if (len > root && (huff & mask) !== low) {
        if (drop === 0) {
          drop = root;
        }
        next += min;
        curr = len - drop;
        left = 1 << curr;
        while (curr + drop < max) {
          left -= count[curr + drop];
          if (left <= 0) {
            break;
          }
          curr++;
          left <<= 1;
        }
        used += 1 << curr;
        if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
          return 1;
        }
        low = huff & mask;
        table[low] = root << 24 | curr << 16 | next - table_index | 0;
      }
    }
    if (huff !== 0) {
      table[next + huff] = len - drop << 24 | 64 << 16 | 0;
    }
    opts.bits = root;
    return 0;
  };
  var CODES$1 = 0;
  var LENS$1 = 1;
  var DISTS$1 = 2;
  var Z_FINISH$2 = 4;
  var Z_BLOCK$1 = 5;
  var Z_TREES = 6;
  var Z_OK$2 = 0;
  var Z_STREAM_END$2 = 1;
  var Z_NEED_DICT = 2;
  var Z_STREAM_ERROR$1 = -2;
  var Z_DATA_ERROR$1 = -3;
  var Z_MEM_ERROR = -4;
  var Z_BUF_ERROR$1 = -5;
  var Z_DEFLATED$2 = 8;
  var HEAD = 1;
  var FLAGS = 2;
  var TIME = 3;
  var OS = 4;
  var EXLEN = 5;
  var EXTRA = 6;
  var NAME = 7;
  var COMMENT = 8;
  var HCRC = 9;
  var DICTID = 10;
  var DICT = 11;
  var TYPE$1 = 12;
  var TYPEDO = 13;
  var STORED = 14;
  var COPY_ = 15;
  var COPY = 16;
  var TABLE = 17;
  var LENLENS = 18;
  var CODELENS = 19;
  var LEN_ = 20;
  var LEN = 21;
  var LENEXT = 22;
  var DIST = 23;
  var DISTEXT = 24;
  var MATCH = 25;
  var LIT = 26;
  var CHECK = 27;
  var LENGTH = 28;
  var DONE = 29;
  var BAD$1 = 30;
  var MEM = 31;
  var SYNC = 32;
  var ENOUGH_LENS$1 = 852;
  var ENOUGH_DISTS$1 = 592;
  var MAX_WBITS$1 = 15;
  var DEF_WBITS = MAX_WBITS$1;
  function zswap32(q2) {
    return (q2 >>> 24 & 255) + (q2 >>> 8 & 65280) + ((q2 & 65280) << 8) + ((q2 & 255) << 24);
  }
  function InflateState() {
    this.mode = 0;
    this.last = false;
    this.wrap = 0;
    this.havedict = false;
    this.flags = 0;
    this.dmax = 0;
    this.check = 0;
    this.total = 0;
    this.head = null;
    this.wbits = 0;
    this.wsize = 0;
    this.whave = 0;
    this.wnext = 0;
    this.window = null;
    this.hold = 0;
    this.bits = 0;
    this.length = 0;
    this.offset = 0;
    this.extra = 0;
    this.lencode = null;
    this.distcode = null;
    this.lenbits = 0;
    this.distbits = 0;
    this.ncode = 0;
    this.nlen = 0;
    this.ndist = 0;
    this.have = 0;
    this.next = null;
    this.lens = new common.Buf16(320);
    this.work = new common.Buf16(288);
    this.lendyn = null;
    this.distdyn = null;
    this.sane = 0;
    this.back = 0;
    this.was = 0;
  }
  function inflateResetKeep(strm) {
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    strm.total_in = strm.total_out = state.total = 0;
    strm.msg = "";
    if (state.wrap) {
      strm.adler = state.wrap & 1;
    }
    state.mode = HEAD;
    state.last = 0;
    state.havedict = 0;
    state.dmax = 32768;
    state.head = null;
    state.hold = 0;
    state.bits = 0;
    state.lencode = state.lendyn = new common.Buf32(ENOUGH_LENS$1);
    state.distcode = state.distdyn = new common.Buf32(ENOUGH_DISTS$1);
    state.sane = 1;
    state.back = -1;
    return Z_OK$2;
  }
  function inflateReset(strm) {
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    state.wsize = 0;
    state.whave = 0;
    state.wnext = 0;
    return inflateResetKeep(strm);
  }
  function inflateReset2(strm, windowBits) {
    var wrap;
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else {
      wrap = (windowBits >> 4) + 1;
      if (windowBits < 48) {
        windowBits &= 15;
      }
    }
    if (windowBits && (windowBits < 8 || windowBits > 15)) {
      return Z_STREAM_ERROR$1;
    }
    if (state.window !== null && state.wbits !== windowBits) {
      state.window = null;
    }
    state.wrap = wrap;
    state.wbits = windowBits;
    return inflateReset(strm);
  }
  function inflateInit2(strm, windowBits) {
    var ret;
    var state;
    if (!strm) {
      return Z_STREAM_ERROR$1;
    }
    state = new InflateState();
    strm.state = state;
    state.window = null;
    ret = inflateReset2(strm, windowBits);
    if (ret !== Z_OK$2) {
      strm.state = null;
    }
    return ret;
  }
  function inflateInit(strm) {
    return inflateInit2(strm, DEF_WBITS);
  }
  var virgin = true;
  var lenfix;
  var distfix;
  function fixedtables(state) {
    if (virgin) {
      var sym;
      lenfix = new common.Buf32(512);
      distfix = new common.Buf32(32);
      sym = 0;
      while (sym < 144) {
        state.lens[sym++] = 8;
      }
      while (sym < 256) {
        state.lens[sym++] = 9;
      }
      while (sym < 280) {
        state.lens[sym++] = 7;
      }
      while (sym < 288) {
        state.lens[sym++] = 8;
      }
      inftrees(LENS$1, state.lens, 0, 288, lenfix, 0, state.work, {
        bits: 9
      });
      sym = 0;
      while (sym < 32) {
        state.lens[sym++] = 5;
      }
      inftrees(DISTS$1, state.lens, 0, 32, distfix, 0, state.work, {
        bits: 5
      });
      virgin = false;
    }
    state.lencode = lenfix;
    state.lenbits = 9;
    state.distcode = distfix;
    state.distbits = 5;
  }
  function updatewindow(strm, src, end, copy) {
    var dist;
    var state = strm.state;
    if (state.window === null) {
      state.wsize = 1 << state.wbits;
      state.wnext = 0;
      state.whave = 0;
      state.window = new common.Buf8(state.wsize);
    }
    if (copy >= state.wsize) {
      common.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
      state.wnext = 0;
      state.whave = state.wsize;
    } else {
      dist = state.wsize - state.wnext;
      if (dist > copy) {
        dist = copy;
      }
      common.arraySet(state.window, src, end - copy, dist, state.wnext);
      copy -= dist;
      if (copy) {
        common.arraySet(state.window, src, end - copy, copy, 0);
        state.wnext = copy;
        state.whave = state.wsize;
      } else {
        state.wnext += dist;
        if (state.wnext === state.wsize) {
          state.wnext = 0;
        }
        if (state.whave < state.wsize) {
          state.whave += dist;
        }
      }
    }
    return 0;
  }
  function inflate(strm, flush) {
    var state;
    var input, output;
    var next;
    var put;
    var have, left;
    var hold;
    var bits;
    var _in, _out;
    var copy;
    var from;
    var from_source;
    var here = 0;
    var here_bits, here_op, here_val;
    var last_bits, last_op, last_val;
    var len;
    var ret;
    var hbuf = new common.Buf8(4);
    var opts;
    var n;
    var order = (
      /* permutation of code lengths */
      [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
    );
    if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    if (state.mode === TYPE$1) {
      state.mode = TYPEDO;
    }
    put = strm.next_out;
    output = strm.output;
    left = strm.avail_out;
    next = strm.next_in;
    input = strm.input;
    have = strm.avail_in;
    hold = state.hold;
    bits = state.bits;
    _in = have;
    _out = left;
    ret = Z_OK$2;
    inf_leave:
      for (; ; ) {
        switch (state.mode) {
          case HEAD:
            if (state.wrap === 0) {
              state.mode = TYPEDO;
              break;
            }
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.wrap & 2 && hold === 35615) {
              state.check = 0;
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
              hold = 0;
              bits = 0;
              state.mode = FLAGS;
              break;
            }
            state.flags = 0;
            if (state.head) {
              state.head.done = false;
            }
            if (!(state.wrap & 1) || /* check if zlib header allowed */
            (((hold & 255) << /*BITS(8)*/
            8) + (hold >> 8)) % 31) {
              strm.msg = "incorrect header check";
              state.mode = BAD$1;
              break;
            }
            if ((hold & 15) !== /*BITS(4)*/
            Z_DEFLATED$2) {
              strm.msg = "unknown compression method";
              state.mode = BAD$1;
              break;
            }
            hold >>>= 4;
            bits -= 4;
            len = (hold & 15) + /*BITS(4)*/
            8;
            if (state.wbits === 0) {
              state.wbits = len;
            } else if (len > state.wbits) {
              strm.msg = "invalid window size";
              state.mode = BAD$1;
              break;
            }
            state.dmax = 1 << len;
            strm.adler = state.check = 1;
            state.mode = hold & 512 ? DICTID : TYPE$1;
            hold = 0;
            bits = 0;
            break;
          case FLAGS:
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.flags = hold;
            if ((state.flags & 255) !== Z_DEFLATED$2) {
              strm.msg = "unknown compression method";
              state.mode = BAD$1;
              break;
            }
            if (state.flags & 57344) {
              strm.msg = "unknown header flags set";
              state.mode = BAD$1;
              break;
            }
            if (state.head) {
              state.head.text = hold >> 8 & 1;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = TIME;
          /* falls through */
          case TIME:
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.head) {
              state.head.time = hold;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              hbuf[2] = hold >>> 16 & 255;
              hbuf[3] = hold >>> 24 & 255;
              state.check = crc32_1(state.check, hbuf, 4, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = OS;
          /* falls through */
          case OS:
            while (bits < 16) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (state.head) {
              state.head.xflags = hold & 255;
              state.head.os = hold >> 8;
            }
            if (state.flags & 512) {
              hbuf[0] = hold & 255;
              hbuf[1] = hold >>> 8 & 255;
              state.check = crc32_1(state.check, hbuf, 2, 0);
            }
            hold = 0;
            bits = 0;
            state.mode = EXLEN;
          /* falls through */
          case EXLEN:
            if (state.flags & 1024) {
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.length = hold;
              if (state.head) {
                state.head.extra_len = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32_1(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
            } else if (state.head) {
              state.head.extra = null;
            }
            state.mode = EXTRA;
          /* falls through */
          case EXTRA:
            if (state.flags & 1024) {
              copy = state.length;
              if (copy > have) {
                copy = have;
              }
              if (copy) {
                if (state.head) {
                  len = state.head.extra_len - state.length;
                  if (!state.head.extra) {
                    state.head.extra = new Array(state.head.extra_len);
                  }
                  common.arraySet(
                    state.head.extra,
                    input,
                    next,
                    // extra field is limited to 65536 bytes
                    // - no need for additional size check
                    copy,
                    /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                    len
                  );
                }
                if (state.flags & 512) {
                  state.check = crc32_1(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                state.length -= copy;
              }
              if (state.length) {
                break inf_leave;
              }
            }
            state.length = 0;
            state.mode = NAME;
          /* falls through */
          case NAME:
            if (state.flags & 2048) {
              if (have === 0) {
                break inf_leave;
              }
              copy = 0;
              do {
                len = input[next + copy++];
                if (state.head && len && state.length < 65536) {
                  state.head.name += String.fromCharCode(len);
                }
              } while (len && copy < have);
              if (state.flags & 512) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              if (len) {
                break inf_leave;
              }
            } else if (state.head) {
              state.head.name = null;
            }
            state.length = 0;
            state.mode = COMMENT;
          /* falls through */
          case COMMENT:
            if (state.flags & 4096) {
              if (have === 0) {
                break inf_leave;
              }
              copy = 0;
              do {
                len = input[next + copy++];
                if (state.head && len && state.length < 65536) {
                  state.head.comment += String.fromCharCode(len);
                }
              } while (len && copy < have);
              if (state.flags & 512) {
                state.check = crc32_1(state.check, input, copy, next);
              }
              have -= copy;
              next += copy;
              if (len) {
                break inf_leave;
              }
            } else if (state.head) {
              state.head.comment = null;
            }
            state.mode = HCRC;
          /* falls through */
          case HCRC:
            if (state.flags & 512) {
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (hold !== (state.check & 65535)) {
                strm.msg = "header crc mismatch";
                state.mode = BAD$1;
                break;
              }
              hold = 0;
              bits = 0;
            }
            if (state.head) {
              state.head.hcrc = state.flags >> 9 & 1;
              state.head.done = true;
            }
            strm.adler = state.check = 0;
            state.mode = TYPE$1;
            break;
          case DICTID:
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            strm.adler = state.check = zswap32(hold);
            hold = 0;
            bits = 0;
            state.mode = DICT;
          /* falls through */
          case DICT:
            if (state.havedict === 0) {
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              return Z_NEED_DICT;
            }
            strm.adler = state.check = 1;
            state.mode = TYPE$1;
          /* falls through */
          case TYPE$1:
            if (flush === Z_BLOCK$1 || flush === Z_TREES) {
              break inf_leave;
            }
          /* falls through */
          case TYPEDO:
            if (state.last) {
              hold >>>= bits & 7;
              bits -= bits & 7;
              state.mode = CHECK;
              break;
            }
            while (bits < 3) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.last = hold & 1;
            hold >>>= 1;
            bits -= 1;
            switch (hold & 3) {
              /*BITS(2)*/
              case 0:
                state.mode = STORED;
                break;
              case 1:
                fixedtables(state);
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  hold >>>= 2;
                  bits -= 2;
                  break inf_leave;
                }
                break;
              case 2:
                state.mode = TABLE;
                break;
              case 3:
                strm.msg = "invalid block type";
                state.mode = BAD$1;
            }
            hold >>>= 2;
            bits -= 2;
            break;
          case STORED:
            hold >>>= bits & 7;
            bits -= bits & 7;
            while (bits < 32) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
              strm.msg = "invalid stored block lengths";
              state.mode = BAD$1;
              break;
            }
            state.length = hold & 65535;
            hold = 0;
            bits = 0;
            state.mode = COPY_;
            if (flush === Z_TREES) {
              break inf_leave;
            }
          /* falls through */
          case COPY_:
            state.mode = COPY;
          /* falls through */
          case COPY:
            copy = state.length;
            if (copy) {
              if (copy > have) {
                copy = have;
              }
              if (copy > left) {
                copy = left;
              }
              if (copy === 0) {
                break inf_leave;
              }
              common.arraySet(output, input, next, copy, put);
              have -= copy;
              next += copy;
              left -= copy;
              put += copy;
              state.length -= copy;
              break;
            }
            state.mode = TYPE$1;
            break;
          case TABLE:
            while (bits < 14) {
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            state.nlen = (hold & 31) + /*BITS(5)*/
            257;
            hold >>>= 5;
            bits -= 5;
            state.ndist = (hold & 31) + /*BITS(5)*/
            1;
            hold >>>= 5;
            bits -= 5;
            state.ncode = (hold & 15) + /*BITS(4)*/
            4;
            hold >>>= 4;
            bits -= 4;
            if (state.nlen > 286 || state.ndist > 30) {
              strm.msg = "too many length or distance symbols";
              state.mode = BAD$1;
              break;
            }
            state.have = 0;
            state.mode = LENLENS;
          /* falls through */
          case LENLENS:
            while (state.have < state.ncode) {
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.lens[order[state.have++]] = hold & 7;
              hold >>>= 3;
              bits -= 3;
            }
            while (state.have < 19) {
              state.lens[order[state.have++]] = 0;
            }
            state.lencode = state.lendyn;
            state.lenbits = 7;
            opts = {
              bits: state.lenbits
            };
            ret = inftrees(CODES$1, state.lens, 0, 19, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;
            if (ret) {
              strm.msg = "invalid code lengths set";
              state.mode = BAD$1;
              break;
            }
            state.have = 0;
            state.mode = CODELENS;
          /* falls through */
          case CODELENS:
            while (state.have < state.nlen + state.ndist) {
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_val < 16) {
                hold >>>= here_bits;
                bits -= here_bits;
                state.lens[state.have++] = here_val;
              } else {
                if (here_val === 16) {
                  n = here_bits + 2;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  if (state.have === 0) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD$1;
                    break;
                  }
                  len = state.lens[state.have - 1];
                  copy = 3 + (hold & 3);
                  hold >>>= 2;
                  bits -= 2;
                } else if (here_val === 17) {
                  n = here_bits + 3;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  len = 0;
                  copy = 3 + (hold & 7);
                  hold >>>= 3;
                  bits -= 3;
                } else {
                  n = here_bits + 7;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= here_bits;
                  bits -= here_bits;
                  len = 0;
                  copy = 11 + (hold & 127);
                  hold >>>= 7;
                  bits -= 7;
                }
                if (state.have + copy > state.nlen + state.ndist) {
                  strm.msg = "invalid bit length repeat";
                  state.mode = BAD$1;
                  break;
                }
                while (copy--) {
                  state.lens[state.have++] = len;
                }
              }
            }
            if (state.mode === BAD$1) {
              break;
            }
            if (state.lens[256] === 0) {
              strm.msg = "invalid code -- missing end-of-block";
              state.mode = BAD$1;
              break;
            }
            state.lenbits = 9;
            opts = {
              bits: state.lenbits
            };
            ret = inftrees(LENS$1, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
            state.lenbits = opts.bits;
            if (ret) {
              strm.msg = "invalid literal/lengths set";
              state.mode = BAD$1;
              break;
            }
            state.distbits = 6;
            state.distcode = state.distdyn;
            opts = {
              bits: state.distbits
            };
            ret = inftrees(DISTS$1, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
            state.distbits = opts.bits;
            if (ret) {
              strm.msg = "invalid distances set";
              state.mode = BAD$1;
              break;
            }
            state.mode = LEN_;
            if (flush === Z_TREES) {
              break inf_leave;
            }
          /* falls through */
          case LEN_:
            state.mode = LEN;
          /* falls through */
          case LEN:
            if (have >= 6 && left >= 258) {
              strm.next_out = put;
              strm.avail_out = left;
              strm.next_in = next;
              strm.avail_in = have;
              state.hold = hold;
              state.bits = bits;
              inffast(strm, _out);
              put = strm.next_out;
              output = strm.output;
              left = strm.avail_out;
              next = strm.next_in;
              input = strm.input;
              have = strm.avail_in;
              hold = state.hold;
              bits = state.bits;
              if (state.mode === TYPE$1) {
                state.back = -1;
              }
              break;
            }
            state.back = 0;
            for (; ; ) {
              here = state.lencode[hold & (1 << state.lenbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if (here_op && (here_op & 240) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (; ; ) {
                here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> /*BITS(last.bits + last.op)*/
                last_bits)];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (last_bits + here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= last_bits;
              bits -= last_bits;
              state.back += last_bits;
            }
            hold >>>= here_bits;
            bits -= here_bits;
            state.back += here_bits;
            state.length = here_val;
            if (here_op === 0) {
              state.mode = LIT;
              break;
            }
            if (here_op & 32) {
              state.back = -1;
              state.mode = TYPE$1;
              break;
            }
            if (here_op & 64) {
              strm.msg = "invalid literal/length code";
              state.mode = BAD$1;
              break;
            }
            state.extra = here_op & 15;
            state.mode = LENEXT;
          /* falls through */
          case LENEXT:
            if (state.extra) {
              n = state.extra;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.length += hold & (1 << state.extra) - 1;
              hold >>>= state.extra;
              bits -= state.extra;
              state.back += state.extra;
            }
            state.was = state.length;
            state.mode = DIST;
          /* falls through */
          case DIST:
            for (; ; ) {
              here = state.distcode[hold & (1 << state.distbits) - 1];
              here_bits = here >>> 24;
              here_op = here >>> 16 & 255;
              here_val = here & 65535;
              if (here_bits <= bits) {
                break;
              }
              if (have === 0) {
                break inf_leave;
              }
              have--;
              hold += input[next++] << bits;
              bits += 8;
            }
            if ((here_op & 240) === 0) {
              last_bits = here_bits;
              last_op = here_op;
              last_val = here_val;
              for (; ; ) {
                here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> /*BITS(last.bits + last.op)*/
                last_bits)];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (last_bits + here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= last_bits;
              bits -= last_bits;
              state.back += last_bits;
            }
            hold >>>= here_bits;
            bits -= here_bits;
            state.back += here_bits;
            if (here_op & 64) {
              strm.msg = "invalid distance code";
              state.mode = BAD$1;
              break;
            }
            state.offset = here_val;
            state.extra = here_op & 15;
            state.mode = DISTEXT;
          /* falls through */
          case DISTEXT:
            if (state.extra) {
              n = state.extra;
              while (bits < n) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.offset += hold & (1 << state.extra) - 1;
              hold >>>= state.extra;
              bits -= state.extra;
              state.back += state.extra;
            }
            if (state.offset > state.dmax) {
              strm.msg = "invalid distance too far back";
              state.mode = BAD$1;
              break;
            }
            state.mode = MATCH;
          /* falls through */
          case MATCH:
            if (left === 0) {
              break inf_leave;
            }
            copy = _out - left;
            if (state.offset > copy) {
              copy = state.offset - copy;
              if (copy > state.whave) {
                if (state.sane) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD$1;
                  break;
                }
              }
              if (copy > state.wnext) {
                copy -= state.wnext;
                from = state.wsize - copy;
              } else {
                from = state.wnext - copy;
              }
              if (copy > state.length) {
                copy = state.length;
              }
              from_source = state.window;
            } else {
              from_source = output;
              from = put - state.offset;
              copy = state.length;
            }
            if (copy > left) {
              copy = left;
            }
            left -= copy;
            state.length -= copy;
            do {
              output[put++] = from_source[from++];
            } while (--copy);
            if (state.length === 0) {
              state.mode = LEN;
            }
            break;
          case LIT:
            if (left === 0) {
              break inf_leave;
            }
            output[put++] = state.length;
            left--;
            state.mode = LEN;
            break;
          case CHECK:
            if (state.wrap) {
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold |= input[next++] << bits;
                bits += 8;
              }
              _out -= left;
              strm.total_out += _out;
              state.total += _out;
              if (_out) {
                strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
              }
              _out = left;
              if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                strm.msg = "incorrect data check";
                state.mode = BAD$1;
                break;
              }
              hold = 0;
              bits = 0;
            }
            state.mode = LENGTH;
          /* falls through */
          case LENGTH:
            if (state.wrap && state.flags) {
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (hold !== (state.total & 4294967295)) {
                strm.msg = "incorrect length check";
                state.mode = BAD$1;
                break;
              }
              hold = 0;
              bits = 0;
            }
            state.mode = DONE;
          /* falls through */
          case DONE:
            ret = Z_STREAM_END$2;
            break inf_leave;
          case BAD$1:
            ret = Z_DATA_ERROR$1;
            break inf_leave;
          case MEM:
            return Z_MEM_ERROR;
          case SYNC:
          /* falls through */
          default:
            return Z_STREAM_ERROR$1;
        }
      }
    strm.next_out = put;
    strm.avail_out = left;
    strm.next_in = next;
    strm.avail_in = have;
    state.hold = hold;
    state.bits = bits;
    if (state.wsize || _out !== strm.avail_out && state.mode < BAD$1 && (state.mode < CHECK || flush !== Z_FINISH$2)) {
      if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
    }
    _in -= strm.avail_in;
    _out -= strm.avail_out;
    strm.total_in += _in;
    strm.total_out += _out;
    state.total += _out;
    if (state.wrap && _out) {
      strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
    }
    strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE$1 ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
    if ((_in === 0 && _out === 0 || flush === Z_FINISH$2) && ret === Z_OK$2) {
      ret = Z_BUF_ERROR$1;
    }
    return ret;
  }
  function inflateEnd(strm) {
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    var state = strm.state;
    if (state.window) {
      state.window = null;
    }
    strm.state = null;
    return Z_OK$2;
  }
  function inflateGetHeader(strm, head) {
    var state;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    if ((state.wrap & 2) === 0) {
      return Z_STREAM_ERROR$1;
    }
    state.head = head;
    head.done = false;
    return Z_OK$2;
  }
  function inflateSetDictionary(strm, dictionary) {
    var dictLength = dictionary.length;
    var state;
    var dictid;
    var ret;
    if (!strm || !strm.state) {
      return Z_STREAM_ERROR$1;
    }
    state = strm.state;
    if (state.wrap !== 0 && state.mode !== DICT) {
      return Z_STREAM_ERROR$1;
    }
    if (state.mode === DICT) {
      dictid = 1;
      dictid = adler32_1(dictid, dictionary, dictLength, 0);
      if (dictid !== state.check) {
        return Z_DATA_ERROR$1;
      }
    }
    ret = updatewindow(strm, dictionary, dictLength, dictLength);
    if (ret) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
    state.havedict = 1;
    return Z_OK$2;
  }
  var inflateReset_1 = inflateReset;
  var inflateReset2_1 = inflateReset2;
  var inflateResetKeep_1 = inflateResetKeep;
  var inflateInit_1 = inflateInit;
  var inflateInit2_1 = inflateInit2;
  var inflate_2 = inflate;
  var inflateEnd_1 = inflateEnd;
  var inflateGetHeader_1 = inflateGetHeader;
  var inflateSetDictionary_1 = inflateSetDictionary;
  var inflateInfo = "pako inflate (from Nodeca project)";
  var inflate_1 = {
    inflateReset: inflateReset_1,
    inflateReset2: inflateReset2_1,
    inflateResetKeep: inflateResetKeep_1,
    inflateInit: inflateInit_1,
    inflateInit2: inflateInit2_1,
    inflate: inflate_2,
    inflateEnd: inflateEnd_1,
    inflateGetHeader: inflateGetHeader_1,
    inflateSetDictionary: inflateSetDictionary_1,
    inflateInfo
  };
  var constants = {
    /* Allowed flush values; see deflate() and inflate() below for details */
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_TREES: 6,
    /* Return codes for the compression/decompression functions. Negative values
    * are errors, positive values are used for special but normal events.
    */
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_ERRNO: -1,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    //Z_MEM_ERROR:     -4,
    Z_BUF_ERROR: -5,
    //Z_VERSION_ERROR: -6,
    /* compression levels */
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    /* Possible values of the data_type field (though see inflate()) */
    Z_BINARY: 0,
    Z_TEXT: 1,
    //Z_ASCII:                1, // = Z_TEXT (deprecated)
    Z_UNKNOWN: 2,
    /* The deflate compression method */
    Z_DEFLATED: 8
    //Z_NULL:                 null // Use -1 or null inline, depending on var type
  };
  function GZheader() {
    this.text = 0;
    this.time = 0;
    this.xflags = 0;
    this.os = 0;
    this.extra = null;
    this.extra_len = 0;
    this.name = "";
    this.comment = "";
    this.hcrc = 0;
    this.done = false;
  }
  var gzheader = GZheader;
  var toString$1 = Object.prototype.toString;
  function Inflate(options) {
    if (!(this instanceof Inflate)) return new Inflate(options);
    this.options = common.assign({
      chunkSize: 16384,
      windowBits: 0,
      to: ""
    }, options || {});
    var opt = this.options;
    if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
      opt.windowBits = -opt.windowBits;
      if (opt.windowBits === 0) {
        opt.windowBits = -15;
      }
    }
    if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
      opt.windowBits += 32;
    }
    if (opt.windowBits > 15 && opt.windowBits < 48) {
      if ((opt.windowBits & 15) === 0) {
        opt.windowBits |= 15;
      }
    }
    this.err = 0;
    this.msg = "";
    this.ended = false;
    this.chunks = [];
    this.strm = new zstream();
    this.strm.avail_out = 0;
    var status = inflate_1.inflateInit2(this.strm, opt.windowBits);
    if (status !== constants.Z_OK) {
      throw new Error(messages[status]);
    }
    this.header = new gzheader();
    inflate_1.inflateGetHeader(this.strm, this.header);
    if (opt.dictionary) {
      if (typeof opt.dictionary === "string") {
        opt.dictionary = strings.string2buf(opt.dictionary);
      } else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") {
        opt.dictionary = new Uint8Array(opt.dictionary);
      }
      if (opt.raw) {
        status = inflate_1.inflateSetDictionary(this.strm, opt.dictionary);
        if (status !== constants.Z_OK) {
          throw new Error(messages[status]);
        }
      }
    }
  }
  Inflate.prototype.push = function(data, mode) {
    var strm = this.strm;
    var chunkSize = this.options.chunkSize;
    var dictionary = this.options.dictionary;
    var status, _mode;
    var next_out_utf8, tail, utf8str;
    var allowBufError = false;
    if (this.ended) {
      return false;
    }
    _mode = mode === ~~mode ? mode : mode === true ? constants.Z_FINISH : constants.Z_NO_FLUSH;
    if (typeof data === "string") {
      strm.input = strings.binstring2buf(data);
    } else if (toString$1.call(data) === "[object ArrayBuffer]") {
      strm.input = new Uint8Array(data);
    } else {
      strm.input = data;
    }
    strm.next_in = 0;
    strm.avail_in = strm.input.length;
    do {
      if (strm.avail_out === 0) {
        strm.output = new common.Buf8(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }
      status = inflate_1.inflate(strm, constants.Z_NO_FLUSH);
      if (status === constants.Z_NEED_DICT && dictionary) {
        status = inflate_1.inflateSetDictionary(this.strm, dictionary);
      }
      if (status === constants.Z_BUF_ERROR && allowBufError === true) {
        status = constants.Z_OK;
        allowBufError = false;
      }
      if (status !== constants.Z_STREAM_END && status !== constants.Z_OK) {
        this.onEnd(status);
        this.ended = true;
        return false;
      }
      if (strm.next_out) {
        if (strm.avail_out === 0 || status === constants.Z_STREAM_END || strm.avail_in === 0 && (_mode === constants.Z_FINISH || _mode === constants.Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
            tail = strm.next_out - next_out_utf8;
            utf8str = strings.buf2string(strm.output, next_out_utf8);
            strm.next_out = tail;
            strm.avail_out = chunkSize - tail;
            if (tail) {
              common.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
            }
            this.onData(utf8str);
          } else {
            this.onData(common.shrinkBuf(strm.output, strm.next_out));
          }
        }
      }
      if (strm.avail_in === 0 && strm.avail_out === 0) {
        allowBufError = true;
      }
    } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== constants.Z_STREAM_END);
    if (status === constants.Z_STREAM_END) {
      _mode = constants.Z_FINISH;
    }
    if (_mode === constants.Z_FINISH) {
      status = inflate_1.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === constants.Z_OK;
    }
    if (_mode === constants.Z_SYNC_FLUSH) {
      this.onEnd(constants.Z_OK);
      strm.avail_out = 0;
      return true;
    }
    return true;
  };
  Inflate.prototype.onData = function(chunk) {
    this.chunks.push(chunk);
  };
  Inflate.prototype.onEnd = function(status) {
    if (status === constants.Z_OK) {
      if (this.options.to === "string") {
        this.result = this.chunks.join("");
      } else {
        this.result = common.flattenChunks(this.chunks);
      }
    }
    this.chunks = [];
    this.err = status;
    this.msg = this.strm.msg;
  };
  function inflate$1(input, options) {
    var inflator = new Inflate(options);
    inflator.push(input, true);
    if (inflator.err) {
      throw inflator.msg || messages[inflator.err];
    }
    return inflator.result;
  }
  function inflateRaw(input, options) {
    options = options || {};
    options.raw = true;
    return inflate$1(input, options);
  }
  var Inflate_1 = Inflate;
  var inflate_2$1 = inflate$1;
  var inflateRaw_1 = inflateRaw;
  var ungzip = inflate$1;
  var inflate_1$1 = {
    Inflate: Inflate_1,
    inflate: inflate_2$1,
    inflateRaw: inflateRaw_1,
    ungzip
  };
  var assign = common.assign;
  var pako = {};
  assign(pako, deflate_1$1, inflate_1$1, constants);
  var pako_1 = pako;
  var HWPDocument = function HWPDocument2(header, info, sections) {
    _classCallCheck(this, HWPDocument2);
    _defineProperty(this, "header", void 0);
    _defineProperty(this, "info", void 0);
    _defineProperty(this, "sections", void 0);
    this.header = header;
    this.info = info;
    this.sections = sections;
  };
  var HWPHeader = function HWPHeader2(version, signature) {
    _classCallCheck(this, HWPHeader2);
    _defineProperty(this, "version", void 0);
    _defineProperty(this, "signature", void 0);
    this.version = version;
    this.signature = signature;
  };
  var HWPVersion = /* @__PURE__ */ (function() {
    function HWPVersion2(major, minor, build, revision) {
      _classCallCheck(this, HWPVersion2);
      _defineProperty(this, "major", void 0);
      _defineProperty(this, "minor", void 0);
      _defineProperty(this, "build", void 0);
      _defineProperty(this, "revision", void 0);
      this.major = major;
      this.minor = minor;
      this.build = build;
      this.revision = revision;
    }
    _createClass(HWPVersion2, [{
      key: "isCompatible",
      value: function isCompatible(target) {
        return this.major === target.major && this.minor <= target.minor;
      }
    }, {
      key: "gte",
      value: function gte(target) {
        if (this.major > target.major) {
          return true;
        }
        if (this.major < target.major) {
          return false;
        }
        if (this.minor > target.minor) {
          return true;
        }
        if (this.minor < target.minor) {
          return false;
        }
        if (this.build > target.build) {
          return true;
        }
        if (this.build < target.build) {
          return false;
        }
        if (this.revision >= target.revision) {
          return true;
        }
        return false;
      }
    }, {
      key: "toString",
      value: function toString2() {
        return "".concat(this.major, ".").concat(this.minor, ".").concat(this.build, ".").concat(this.revision);
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        return this.toString();
      }
    }]);
    return HWPVersion2;
  })();
  var FillType;
  (function(FillType2) {
    FillType2[FillType2["None"] = 0] = "None";
    FillType2[FillType2["Single"] = 1] = "Single";
    FillType2[FillType2["Image"] = 2] = "Image";
    FillType2[FillType2["Gradation"] = 4] = "Gradation";
  })(FillType || (FillType = {}));
  var FillType$1 = FillType;
  var HWPTAG_BEGIN = 16;
  var DocInfoTagID;
  (function(DocInfoTagID2) {
    DocInfoTagID2[DocInfoTagID2["HWPTAG_DOCUMENT_PROPERTIES"] = HWPTAG_BEGIN] = "HWPTAG_DOCUMENT_PROPERTIES";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_ID_MAPPINGS"] = HWPTAG_BEGIN + 1] = "HWPTAG_ID_MAPPINGS";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_BIN_DATA"] = HWPTAG_BEGIN + 2] = "HWPTAG_BIN_DATA";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_FACE_NAME"] = HWPTAG_BEGIN + 3] = "HWPTAG_FACE_NAME";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_BORDER_FILL"] = HWPTAG_BEGIN + 4] = "HWPTAG_BORDER_FILL";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_CHAR_SHAPE"] = HWPTAG_BEGIN + 5] = "HWPTAG_CHAR_SHAPE";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_TAB_DEF"] = HWPTAG_BEGIN + 6] = "HWPTAG_TAB_DEF";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_NUMBERING"] = HWPTAG_BEGIN + 7] = "HWPTAG_NUMBERING";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_BULLET"] = HWPTAG_BEGIN + 8] = "HWPTAG_BULLET";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_PARA_SHAPE"] = HWPTAG_BEGIN + 9] = "HWPTAG_PARA_SHAPE";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_STYLE"] = HWPTAG_BEGIN + 10] = "HWPTAG_STYLE";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_DOC_DATA"] = HWPTAG_BEGIN + 11] = "HWPTAG_DOC_DATA";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_DISTRIBUTE_DOC_DATA"] = HWPTAG_BEGIN + 12] = "HWPTAG_DISTRIBUTE_DOC_DATA";
    DocInfoTagID2[DocInfoTagID2["RESERVED"] = HWPTAG_BEGIN + 13] = "RESERVED";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_COMPATIBLE_DOCUMENT"] = HWPTAG_BEGIN + 14] = "HWPTAG_COMPATIBLE_DOCUMENT";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_LAYOUT_COMPATIBILITY"] = HWPTAG_BEGIN + 15] = "HWPTAG_LAYOUT_COMPATIBILITY";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_TRACKCHANGE"] = HWPTAG_BEGIN + 16] = "HWPTAG_TRACKCHANGE";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_MEMO_SHAPE"] = HWPTAG_BEGIN + 76] = "HWPTAG_MEMO_SHAPE";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_FORBIDDEN_CHAR"] = HWPTAG_BEGIN + 78] = "HWPTAG_FORBIDDEN_CHAR";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_TRACK_CHANGE"] = HWPTAG_BEGIN + 80] = "HWPTAG_TRACK_CHANGE";
    DocInfoTagID2[DocInfoTagID2["HWPTAG_TRACK_CHANGE_AUTHOR"] = HWPTAG_BEGIN + 81] = "HWPTAG_TRACK_CHANGE_AUTHOR";
  })(DocInfoTagID || (DocInfoTagID = {}));
  var SectionTagID;
  (function(SectionTagID2) {
    SectionTagID2[SectionTagID2["HWPTAG_PARA_HEADER"] = HWPTAG_BEGIN + 50] = "HWPTAG_PARA_HEADER";
    SectionTagID2[SectionTagID2["HWPTAG_PARA_TEXT"] = HWPTAG_BEGIN + 51] = "HWPTAG_PARA_TEXT";
    SectionTagID2[SectionTagID2["HWPTAG_PARA_CHAR_SHAPE"] = HWPTAG_BEGIN + 52] = "HWPTAG_PARA_CHAR_SHAPE";
    SectionTagID2[SectionTagID2["HWPTAG_PARA_LINE_SEG"] = HWPTAG_BEGIN + 53] = "HWPTAG_PARA_LINE_SEG";
    SectionTagID2[SectionTagID2["HWPTAG_PARA_RANGE_TAG"] = HWPTAG_BEGIN + 54] = "HWPTAG_PARA_RANGE_TAG";
    SectionTagID2[SectionTagID2["HWPTAG_CTRL_HEADER"] = HWPTAG_BEGIN + 55] = "HWPTAG_CTRL_HEADER";
    SectionTagID2[SectionTagID2["HWPTAG_LIST_HEADER"] = HWPTAG_BEGIN + 56] = "HWPTAG_LIST_HEADER";
    SectionTagID2[SectionTagID2["HWPTAG_PAGE_DEF"] = HWPTAG_BEGIN + 57] = "HWPTAG_PAGE_DEF";
    SectionTagID2[SectionTagID2["HWPTAG_FOOTNOTE_SHAPE"] = HWPTAG_BEGIN + 58] = "HWPTAG_FOOTNOTE_SHAPE";
    SectionTagID2[SectionTagID2["HWPTAG_PAGE_BORDER_FILL"] = HWPTAG_BEGIN + 59] = "HWPTAG_PAGE_BORDER_FILL";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT"] = HWPTAG_BEGIN + 60] = "HWPTAG_SHAPE_COMPONENT";
    SectionTagID2[SectionTagID2["HWPTAG_TABLE"] = HWPTAG_BEGIN + 61] = "HWPTAG_TABLE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_LINE"] = HWPTAG_BEGIN + 62] = "HWPTAG_SHAPE_COMPONENT_LINE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_RECTANGLE"] = HWPTAG_BEGIN + 63] = "HWPTAG_SHAPE_COMPONENT_RECTANGLE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_ELLIPSE"] = HWPTAG_BEGIN + 64] = "HWPTAG_SHAPE_COMPONENT_ELLIPSE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_ARC"] = HWPTAG_BEGIN + 65] = "HWPTAG_SHAPE_COMPONENT_ARC";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_POLYGON"] = HWPTAG_BEGIN + 66] = "HWPTAG_SHAPE_COMPONENT_POLYGON";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_CURVE"] = HWPTAG_BEGIN + 67] = "HWPTAG_SHAPE_COMPONENT_CURVE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_OLE"] = HWPTAG_BEGIN + 68] = "HWPTAG_SHAPE_COMPONENT_OLE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_PICTURE"] = HWPTAG_BEGIN + 69] = "HWPTAG_SHAPE_COMPONENT_PICTURE";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_CONTAINER"] = HWPTAG_BEGIN + 70] = "HWPTAG_SHAPE_COMPONENT_CONTAINER";
    SectionTagID2[SectionTagID2["HWPTAG_CTRL_DATA"] = HWPTAG_BEGIN + 71] = "HWPTAG_CTRL_DATA";
    SectionTagID2[SectionTagID2["HWPTAG_EQEDIT"] = HWPTAG_BEGIN + 72] = "HWPTAG_EQEDIT";
    SectionTagID2[SectionTagID2["RESERVED"] = HWPTAG_BEGIN + 73] = "RESERVED";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_TEXTART"] = HWPTAG_BEGIN + 74] = "HWPTAG_SHAPE_COMPONENT_TEXTART";
    SectionTagID2[SectionTagID2["HWPTAG_FORM_OBJECT"] = HWPTAG_BEGIN + 75] = "HWPTAG_FORM_OBJECT";
    SectionTagID2[SectionTagID2["HWPTAG_MEMO_SHAPE"] = HWPTAG_BEGIN + 76] = "HWPTAG_MEMO_SHAPE";
    SectionTagID2[SectionTagID2["HWPTAG_MEMO_LIST"] = HWPTAG_BEGIN + 77] = "HWPTAG_MEMO_LIST";
    SectionTagID2[SectionTagID2["HWPTAG_CHART_DATA"] = HWPTAG_BEGIN + 79] = "HWPTAG_CHART_DATA";
    SectionTagID2[SectionTagID2["HWPTAG_VIDEO_DATA"] = HWPTAG_BEGIN + 82] = "HWPTAG_VIDEO_DATA";
    SectionTagID2[SectionTagID2["HWPTAG_SHAPE_COMPONENT_UNKNOWN"] = HWPTAG_BEGIN + 99] = "HWPTAG_SHAPE_COMPONENT_UNKNOWN";
  })(SectionTagID || (SectionTagID = {}));
  var BinData = function BinData2(extension, payload) {
    _classCallCheck(this, BinData2);
    _defineProperty(this, "extension", void 0);
    _defineProperty(this, "payload", void 0);
    this.extension = extension;
    this.payload = payload;
  };
  var ByteReader = /* @__PURE__ */ (function() {
    function ByteReader2(buffer) {
      _classCallCheck(this, ByteReader2);
      _defineProperty(this, "view", void 0);
      _defineProperty(this, "offsetByte", 0);
      this.view = new DataView(buffer);
    }
    _createClass(ByteReader2, [{
      key: "readUInt32",
      value: function readUInt32() {
        var result = this.view.getUint32(this.offsetByte, true);
        this.offsetByte += 4;
        return result;
      }
    }, {
      key: "readInt32",
      value: function readInt32() {
        var result = this.view.getInt32(this.offsetByte, true);
        this.offsetByte += 4;
        return result;
      }
    }, {
      key: "readInt16",
      value: function readInt16() {
        var result = this.view.getUint16(this.offsetByte, true);
        this.offsetByte += 2;
        return result;
      }
    }, {
      key: "readUInt16",
      value: function readUInt16() {
        var result = this.view.getUint16(this.offsetByte, true);
        this.offsetByte += 2;
        return result;
      }
    }, {
      key: "readInt8",
      value: function readInt8() {
        var result = this.view.getInt8(this.offsetByte);
        this.offsetByte += 1;
        return result;
      }
    }, {
      key: "readUInt8",
      value: function readUInt8() {
        var result = this.view.getUint8(this.offsetByte);
        this.offsetByte += 1;
        return result;
      }
    }, {
      key: "readRecord",
      value: function readRecord() {
        var value = this.readUInt32();
        var tagID = value & 1023;
        var level = value >> 10 & 1023;
        var size = value >> 20 & 4095;
        if (size === 4095) {
          return [tagID, level, this.readUInt32()];
        }
        return [tagID, level, size];
      }
    }, {
      key: "read",
      value: function read(_byte) {
        var result = this.view.buffer.slice(this.offsetByte, this.offsetByte + _byte);
        this.offsetByte += _byte;
        return result;
      }
    }, {
      key: "readString",
      value: function readString() {
        var length = this.readUInt16();
        var result = [];
        for (var i = 0; i < length; i += 1) {
          result.push(String.fromCharCode(this.readUInt16()));
        }
        return result.join("");
      }
    }, {
      key: "remainByte",
      value: function remainByte() {
        return this.view.byteLength - this.offsetByte;
      }
    }, {
      key: "skipByte",
      value: function skipByte(offset) {
        this.offsetByte += offset;
      }
    }, {
      key: "isEOF",
      value: function isEOF() {
        return this.view.byteLength <= this.offsetByte;
      }
    }]);
    return ByteReader2;
  })();
  function getBitValue(mask, start, end) {
    var target = mask >> start;
    var temp = 0;
    for (var index = 0; index <= end - start; index += 1) {
      temp <<= 1;
      temp += 1;
    }
    return target & temp;
  }
  function getRGB(colorRef) {
    return [getBitValue(colorRef, 0, 7), getBitValue(colorRef, 8, 15), getBitValue(colorRef, 16, 23)];
  }
  function getFlag(bits, position) {
    var mask = 1 << position;
    return (bits & mask) === mask;
  }
  var CharShape = function CharShape2(fontId, fontScale, fontSpacing, fontRatio, fontLocation, fontBaseSize, attr, shadow, shadow2, color, underLineColor, shadeColor, shadowColor) {
    _classCallCheck(this, CharShape2);
    _defineProperty(this, "fontId", void 0);
    _defineProperty(this, "fontScale", void 0);
    _defineProperty(this, "fontSpacing", void 0);
    _defineProperty(this, "fontRatio", void 0);
    _defineProperty(this, "fontLocation", void 0);
    _defineProperty(this, "fontBaseSize", void 0);
    _defineProperty(this, "attr", void 0);
    _defineProperty(this, "shadow", void 0);
    _defineProperty(this, "shadow2", void 0);
    _defineProperty(this, "color", void 0);
    _defineProperty(this, "underLineColor", void 0);
    _defineProperty(this, "shadeColor", void 0);
    _defineProperty(this, "shadowColor", void 0);
    _defineProperty(this, "fontBackgroundId", null);
    _defineProperty(this, "strikeColor", null);
    this.fontId = fontId;
    this.fontScale = fontScale;
    this.fontSpacing = fontSpacing;
    this.fontRatio = fontRatio;
    this.fontLocation = fontLocation;
    this.fontBaseSize = fontBaseSize / 100;
    this.attr = attr;
    this.shadow = getRGB(shadow);
    this.shadow2 = getRGB(shadow2);
    this.color = getRGB(color);
    this.underLineColor = getRGB(underLineColor);
    this.shadeColor = getRGB(shadeColor);
    this.shadowColor = getRGB(shadowColor);
  };
  var StartingIndex = function StartingIndex2() {
    _classCallCheck(this, StartingIndex2);
    _defineProperty(this, "page", 0);
    _defineProperty(this, "footnote", 0);
    _defineProperty(this, "endnote", 0);
    _defineProperty(this, "picture", 0);
    _defineProperty(this, "table", 0);
    _defineProperty(this, "equation", 0);
  };
  var CaratLocation = function CaratLocation2() {
    _classCallCheck(this, CaratLocation2);
    _defineProperty(this, "listId", 0);
    _defineProperty(this, "paragraphId", 0);
    _defineProperty(this, "charIndex", 0);
  };
  var DocInfo = /* @__PURE__ */ (function() {
    function DocInfo2() {
      _classCallCheck(this, DocInfo2);
      _defineProperty(this, "sectionSize", 0);
      _defineProperty(this, "charShapes", []);
      _defineProperty(this, "fontFaces", []);
      _defineProperty(this, "binData", []);
      _defineProperty(this, "borderFills", []);
      _defineProperty(this, "paragraphShapes", []);
      _defineProperty(this, "startingIndex", new StartingIndex());
      _defineProperty(this, "caratLocation", new CaratLocation());
    }
    _createClass(DocInfo2, [{
      key: "getCharShpe",
      value: function getCharShpe(index) {
        return this.charShapes[index];
      }
    }]);
    return DocInfo2;
  })();
  var FontFace = /* @__PURE__ */ (function() {
    function FontFace2() {
      _classCallCheck(this, FontFace2);
      _defineProperty(this, "name", "");
      _defineProperty(this, "alternative", "");
      _defineProperty(this, "default", "");
      _defineProperty(this, "panose", null);
    }
    _createClass(FontFace2, [{
      key: "getFontFamily",
      value: function getFontFamily() {
        var result = ["".concat(this.name)];
        if (this.alternative) {
          result.push('"'.concat(this.alternative, '"'));
        }
        if (this["default"]) {
          result.push('"'.concat(this["default"], '"'));
        }
        if (this.panose) {
          var panoseFontFamily = this.panose.getFontFamily();
          result.push(panoseFontFamily);
        }
        return result.join(",");
      }
    }]);
    return FontFace2;
  })();
  var ParagraphShape = function ParagraphShape2() {
    _classCallCheck(this, ParagraphShape2);
    _defineProperty(this, "align", 0);
  };
  var BorderFill = (
    // TODO: (@hahnlee) getter & setter 만들기
    // TODO: (@hahnlee) 그라데이션도 처리하기
    function BorderFill2(attribute, style) {
      _classCallCheck(this, BorderFill2);
      _defineProperty(this, "attribute", void 0);
      _defineProperty(this, "style", void 0);
      _defineProperty(this, "backgroundColor", null);
      this.attribute = attribute;
      this.style = style;
    }
  );
  var Panose = /* @__PURE__ */ (function() {
    function Panose2() {
      _classCallCheck(this, Panose2);
      _defineProperty(this, "family", 0);
      _defineProperty(this, "serifStyle", 0);
      _defineProperty(this, "weight", 0);
      _defineProperty(this, "proportion", 0);
      _defineProperty(this, "contrast", 0);
      _defineProperty(this, "strokeVariation", 0);
      _defineProperty(this, "armStyle", 0);
      _defineProperty(this, "letterForm", 0);
      _defineProperty(this, "midline", 0);
      _defineProperty(this, "xHeight", 0);
    }
    _createClass(Panose2, [{
      key: "getFontFamily",
      value: function getFontFamily() {
        if (this.family === 3) {
          return "cursive";
        }
        if (this.family === 2) {
          if (this.serifStyle > 1 && this.serifStyle < 11) {
            return "sans";
          }
          if (this.serifStyle > 10 && this.serifStyle < 14) {
            return "sans-serf";
          }
        }
        return "";
      }
    }]);
    return Panose2;
  })();
  var emptyArrayBuffer = new ArrayBuffer(0);
  var HWPRecord = function HWPRecord2(tagID, size, parentTagID) {
    var payload = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : emptyArrayBuffer;
    _classCallCheck(this, HWPRecord2);
    _defineProperty(this, "children", []);
    _defineProperty(this, "payload", void 0);
    _defineProperty(this, "tagID", void 0);
    _defineProperty(this, "size", void 0);
    _defineProperty(this, "parentTagID", void 0);
    this.tagID = tagID;
    this.size = size;
    this.parentTagID = parentTagID;
    this.payload = payload;
  };
  function parseRecordTree(data) {
    var reader = new ByteReader(data.buffer);
    var root = new HWPRecord(0, 0, 0);
    while (!reader.isEOF()) {
      var _reader$readRecord = reader.readRecord(), _reader$readRecord2 = _slicedToArray(_reader$readRecord, 3), tagID = _reader$readRecord2[0], level = _reader$readRecord2[1], size = _reader$readRecord2[2];
      var parent = root;
      var payload = reader.read(size);
      for (var i = 0; i < level; i += 1) {
        parent = parent.children.slice(-1).pop();
      }
      parent.children.push(new HWPRecord(tagID, size, parent.tagID, payload));
    }
    return root;
  }
  var DocInfoParser = /* @__PURE__ */ (function() {
    function DocInfoParser2(data, container) {
      var _this = this;
      _classCallCheck(this, DocInfoParser2);
      _defineProperty(this, "record", void 0);
      _defineProperty(this, "result", new DocInfo());
      _defineProperty(this, "container", void 0);
      _defineProperty(this, "visit", function(record) {
        switch (record.tagID) {
          case DocInfoTagID.HWPTAG_DOCUMENT_PROPERTIES: {
            _this.visitDocumentPropertes(record);
            break;
          }
          case DocInfoTagID.HWPTAG_CHAR_SHAPE: {
            _this.visitCharShape(record);
            break;
          }
          case DocInfoTagID.HWPTAG_FACE_NAME: {
            _this.visitFaceName(record);
            break;
          }
          case DocInfoTagID.HWPTAG_BIN_DATA: {
            _this.visitBinData(record);
            break;
          }
          case DocInfoTagID.HWPTAG_BORDER_FILL: {
            _this.visitBorderFill(record);
            break;
          }
          case DocInfoTagID.HWPTAG_PARA_SHAPE: {
            _this.visitParagraphShape(record);
            break;
          }
        }
        record.children.forEach(_this.visit);
      });
      this.record = parseRecordTree(data);
      this.container = container;
    }
    _createClass(DocInfoParser2, [{
      key: "visitDocumentPropertes",
      value: function visitDocumentPropertes(record) {
        var reader = new ByteReader(record.payload);
        this.result.sectionSize = reader.readUInt16();
        this.result.startingIndex.page = reader.readUInt16();
        this.result.startingIndex.footnote = reader.readUInt16();
        this.result.startingIndex.endnote = reader.readUInt16();
        this.result.startingIndex.picture = reader.readUInt16();
        this.result.startingIndex.table = reader.readUInt16();
        this.result.startingIndex.equation = reader.readUInt16();
        this.result.caratLocation.listId = reader.readUInt32();
        this.result.caratLocation.paragraphId = reader.readUInt32();
        this.result.caratLocation.charIndex = reader.readUInt32();
      }
    }, {
      key: "visitCharShape",
      value: function visitCharShape(record) {
        var reader = new ByteReader(record.payload);
        var charShape = new CharShape([reader.readUInt16(), reader.readUInt16(), reader.readUInt16(), reader.readUInt16(), reader.readUInt16(), reader.readUInt16(), reader.readUInt16()], [reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8()], [reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8()], [reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8(), reader.readUInt8()], [reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8(), reader.readInt8()], reader.readInt32(), reader.readUInt32(), reader.readUInt8(), reader.readUInt8(), reader.readUInt32(), reader.readUInt32(), reader.readUInt32(), reader.readUInt32());
        if (record.size > 68) {
          charShape.fontBackgroundId = reader.readUInt16();
        }
        if (record.size > 70) {
          charShape.underLineColor = getRGB(reader.readInt32());
        }
        this.result.charShapes.push(charShape);
      }
    }, {
      key: "visitFaceName",
      value: function visitFaceName(record) {
        var reader = new ByteReader(record.payload);
        var attribute = reader.readUInt8();
        var hasAlternative = getFlag(attribute, 7);
        var hasAttribute = getFlag(attribute, 6);
        var hasDefault = getFlag(attribute, 5);
        var fontFace = new FontFace();
        fontFace.name = reader.readString();
        if (hasAlternative) {
          reader.skipByte(1);
          fontFace.alternative = reader.readString();
        }
        if (hasAttribute) {
          var panose = new Panose();
          panose.family = reader.readInt8();
          panose.serifStyle = reader.readInt8();
          panose.weight = reader.readInt8();
          panose.proportion = reader.readInt8();
          panose.contrast = reader.readInt8();
          panose.strokeVariation = reader.readInt8();
          panose.armStyle = reader.readInt8();
          panose.letterForm = reader.readInt8();
          panose.midline = reader.readInt8();
          panose.xHeight = reader.readInt8();
          fontFace.panose = panose;
        }
        if (hasDefault) {
          fontFace["default"] = reader.readString();
        }
        this.result.fontFaces.push(fontFace);
      }
    }, {
      key: "visitBinData",
      value: function visitBinData(record) {
        var reader = new ByteReader(record.payload);
        reader.readUInt16();
        var id = reader.readUInt16();
        var extension = reader.readString();
        var path = "Root Entry/BinData/BIN".concat("".concat(id.toString(16).toUpperCase()).padStart(4, "0"), ".").concat(extension);
        var payload = cfb.find(this.container, path).content;
        this.result.binData.push(new BinData(extension, pako_1.inflate(payload, {
          windowBits: -15
        })));
      }
    }, {
      key: "visitBorderFill",
      value: function visitBorderFill(record) {
        var reader = new ByteReader(record.payload);
        var borderFill = new BorderFill(reader.readUInt16(), {
          left: {
            type: reader.readUInt8(),
            width: reader.readUInt8(),
            color: getRGB(reader.readUInt32())
          },
          right: {
            type: reader.readUInt8(),
            width: reader.readUInt8(),
            color: getRGB(reader.readUInt32())
          },
          top: {
            type: reader.readUInt8(),
            width: reader.readUInt8(),
            color: getRGB(reader.readUInt32())
          },
          bottom: {
            type: reader.readUInt8(),
            width: reader.readUInt8(),
            color: getRGB(reader.readUInt32())
          }
        });
        reader.skipByte(6);
        if (reader.readUInt32() === FillType$1.Single) {
          borderFill.backgroundColor = getRGB(reader.readUInt32());
        }
        this.result.borderFills.push(borderFill);
      }
    }, {
      key: "visitParagraphShape",
      value: function visitParagraphShape(record) {
        var reader = new ByteReader(record.payload);
        var attribute = reader.readUInt32();
        var shape = new ParagraphShape();
        shape.align = getBitValue(attribute, 2, 4);
        this.result.paragraphShapes.push(shape);
      }
    }, {
      key: "parse",
      value: function parse2() {
        this.record.children.forEach(this.visit);
        return this.result;
      }
    }]);
    return DocInfoParser2;
  })();
  function makeCtrlID(first, second, third, fourth) {
    var firstCode = first.charCodeAt(0);
    var secondCode = second.charCodeAt(0);
    var thirdCode = third.charCodeAt(0);
    var fourthCode = fourth.charCodeAt(0);
    return firstCode << 24 | secondCode << 16 | thirdCode << 8 | fourthCode;
  }
  var CommonCtrlID;
  (function(CommonCtrlID2) {
    CommonCtrlID2[CommonCtrlID2["Table"] = makeCtrlID("t", "b", "l", " ")] = "Table";
    CommonCtrlID2[CommonCtrlID2["Line"] = makeCtrlID("$", "l", "i", "n")] = "Line";
    CommonCtrlID2[CommonCtrlID2["Rectangle"] = makeCtrlID("$", "r", "e", "c")] = "Rectangle";
    CommonCtrlID2[CommonCtrlID2["Ellipse"] = makeCtrlID("$", "e", "l", "l")] = "Ellipse";
    CommonCtrlID2[CommonCtrlID2["Arc"] = makeCtrlID("$", "a", "r", "c")] = "Arc";
    CommonCtrlID2[CommonCtrlID2["Polygon"] = makeCtrlID("$", "p", "o", "l")] = "Polygon";
    CommonCtrlID2[CommonCtrlID2["Curve"] = makeCtrlID("$", "c", "u", "r")] = "Curve";
    CommonCtrlID2[CommonCtrlID2["Equation"] = makeCtrlID("e", "q", "e", "d")] = "Equation";
    CommonCtrlID2[CommonCtrlID2["Picture"] = makeCtrlID("$", "p", "i", "c")] = "Picture";
    CommonCtrlID2[CommonCtrlID2["OLE"] = makeCtrlID("$", "o", "l", "e")] = "OLE";
    CommonCtrlID2[CommonCtrlID2["Connected"] = makeCtrlID("$", "c", "o", "n")] = "Connected";
    CommonCtrlID2[CommonCtrlID2["GenShapeObject"] = makeCtrlID("g", "s", "o", " ")] = "GenShapeObject";
  })(CommonCtrlID || (CommonCtrlID = {}));
  var OtherCtrlID;
  (function(OtherCtrlID2) {
    OtherCtrlID2[OtherCtrlID2["Section"] = makeCtrlID("s", "e", "c", "d")] = "Section";
    OtherCtrlID2[OtherCtrlID2["Column"] = makeCtrlID("c", "o", "l", "d")] = "Column";
    OtherCtrlID2[OtherCtrlID2["Header"] = makeCtrlID("h", "e", "a", "d")] = "Header";
    OtherCtrlID2[OtherCtrlID2["Footer"] = makeCtrlID("f", "o", "o", "t")] = "Footer";
    OtherCtrlID2[OtherCtrlID2["Footnote"] = makeCtrlID("f", "n", " ", " ")] = "Footnote";
    OtherCtrlID2[OtherCtrlID2["Endnote"] = makeCtrlID("e", "n", " ", " ")] = "Endnote";
    OtherCtrlID2[OtherCtrlID2["AutoNumber"] = makeCtrlID("a", "t", "n", "o")] = "AutoNumber";
    OtherCtrlID2[OtherCtrlID2["NewNumber"] = makeCtrlID("n", "w", "n", "o")] = "NewNumber";
    OtherCtrlID2[OtherCtrlID2["PageHide"] = makeCtrlID("p", "g", "h", "d")] = "PageHide";
    OtherCtrlID2[OtherCtrlID2["PageCT"] = makeCtrlID("p", "g", "c", "t")] = "PageCT";
    OtherCtrlID2[OtherCtrlID2["PageNumberPosition"] = makeCtrlID("p", "g", "n", "p")] = "PageNumberPosition";
    OtherCtrlID2[OtherCtrlID2["Indexmark"] = makeCtrlID("i", "d", "x", "m")] = "Indexmark";
    OtherCtrlID2[OtherCtrlID2["Bookmark"] = makeCtrlID("b", "o", "k", "m")] = "Bookmark";
    OtherCtrlID2[OtherCtrlID2["Overlapping"] = makeCtrlID("t", "c", "p", "s")] = "Overlapping";
    OtherCtrlID2[OtherCtrlID2["Comment"] = makeCtrlID("t", "d", "u", "t")] = "Comment";
    OtherCtrlID2[OtherCtrlID2["HiddenComment"] = makeCtrlID("t", "c", "m", "t")] = "HiddenComment";
  })(OtherCtrlID || (OtherCtrlID = {}));
  var FieldCtrlID;
  (function(FieldCtrlID2) {
    FieldCtrlID2[FieldCtrlID2["Unknown"] = makeCtrlID("%", "u", "n", "k")] = "Unknown";
    FieldCtrlID2[FieldCtrlID2["Date"] = makeCtrlID("$", "d", "t", "e")] = "Date";
    FieldCtrlID2[FieldCtrlID2["DocDate"] = makeCtrlID("%", "d", "d", "t")] = "DocDate";
    FieldCtrlID2[FieldCtrlID2["Path"] = makeCtrlID("%", "p", "a", "t")] = "Path";
    FieldCtrlID2[FieldCtrlID2["Bookmark"] = makeCtrlID("%", "b", "m", "k")] = "Bookmark";
    FieldCtrlID2[FieldCtrlID2["MailMerge"] = makeCtrlID("%", "m", "m", "g")] = "MailMerge";
    FieldCtrlID2[FieldCtrlID2["CrossRef"] = makeCtrlID("%", "x", "r", "f")] = "CrossRef";
    FieldCtrlID2[FieldCtrlID2["Formula"] = makeCtrlID("%", "f", "m", "u")] = "Formula";
    FieldCtrlID2[FieldCtrlID2["ClickHere"] = makeCtrlID("%", "c", "l", "k")] = "ClickHere";
    FieldCtrlID2[FieldCtrlID2["Summary"] = makeCtrlID("$", "s", "m", "r")] = "Summary";
    FieldCtrlID2[FieldCtrlID2["UserInfo"] = makeCtrlID("%", "u", "s", "r")] = "UserInfo";
    FieldCtrlID2[FieldCtrlID2["HyperLink"] = makeCtrlID("%", "h", "l", "k")] = "HyperLink";
    FieldCtrlID2[FieldCtrlID2["RevisionSign"] = makeCtrlID("%", "s", "i", "g")] = "RevisionSign";
    FieldCtrlID2[FieldCtrlID2["RevisionDelete"] = makeCtrlID("%", "%", "*", "d")] = "RevisionDelete";
    FieldCtrlID2[FieldCtrlID2["RevisionAttach"] = makeCtrlID("%", "%", "*", "a")] = "RevisionAttach";
    FieldCtrlID2[FieldCtrlID2["RevisionClipping"] = makeCtrlID("%", "%", "*", "C")] = "RevisionClipping";
    FieldCtrlID2[FieldCtrlID2["RevisionSawtooth"] = makeCtrlID("%", "%", "*", "S")] = "RevisionSawtooth";
    FieldCtrlID2[FieldCtrlID2["RevisionThinking"] = makeCtrlID("%", "%", "*", "T")] = "RevisionThinking";
    FieldCtrlID2[FieldCtrlID2["RevisionPraise"] = makeCtrlID("%", "%", "*", "P")] = "RevisionPraise";
    FieldCtrlID2[FieldCtrlID2["RevisionLine"] = makeCtrlID("%", "%", "*", "L")] = "RevisionLine";
    FieldCtrlID2[FieldCtrlID2["RevisionSimpleChange"] = makeCtrlID("%", "%", "*", "c")] = "RevisionSimpleChange";
    FieldCtrlID2[FieldCtrlID2["RevisionHyperLink"] = makeCtrlID("%", "%", "*", "h")] = "RevisionHyperLink";
    FieldCtrlID2[FieldCtrlID2["RevisionLineAttach"] = makeCtrlID("%", "%", "*", "A")] = "RevisionLineAttach";
    FieldCtrlID2[FieldCtrlID2["RevisionLineLink"] = makeCtrlID("%", "%", "*", "i")] = "RevisionLineLink";
    FieldCtrlID2[FieldCtrlID2["RevisionLineRansfer"] = makeCtrlID("%", "%", "*", "t")] = "RevisionLineRansfer";
    FieldCtrlID2[FieldCtrlID2["RevisionRightMove"] = makeCtrlID("%", "%", "*", "r")] = "RevisionRightMove";
    FieldCtrlID2[FieldCtrlID2["RevisionLeftMove"] = makeCtrlID("%", "%", "*", "l")] = "RevisionLeftMove";
    FieldCtrlID2[FieldCtrlID2["RevisionTransfer"] = makeCtrlID("%", "%", "*", "n")] = "RevisionTransfer";
    FieldCtrlID2[FieldCtrlID2["RevisionSimpleInsert"] = makeCtrlID("%", "%", "*", "e")] = "RevisionSimpleInsert";
    FieldCtrlID2[FieldCtrlID2["RevisionSplit"] = makeCtrlID("%", "s", "p", "l")] = "RevisionSplit";
    FieldCtrlID2[FieldCtrlID2["RevisionChange"] = makeCtrlID("%", "%", "m", "r")] = "RevisionChange";
    FieldCtrlID2[FieldCtrlID2["Memo"] = makeCtrlID("%", "%", "m", "e")] = "Memo";
    FieldCtrlID2[FieldCtrlID2["PrivateInfoSecurity"] = makeCtrlID("%", "c", "p", "r")] = "PrivateInfoSecurity";
    FieldCtrlID2[FieldCtrlID2["TableOfContents"] = makeCtrlID("%", "t", "o", "c")] = "TableOfContents";
  })(FieldCtrlID || (FieldCtrlID = {}));
  var CommonAttribute = function CommonAttribute2() {
    _classCallCheck(this, CommonAttribute2);
    _defineProperty(this, "vertRelTo", 0);
  };
  var CommonControl = /* @__PURE__ */ (function() {
    function CommonControl2() {
      _classCallCheck(this, CommonControl2);
      _defineProperty(this, "id", 0);
      _defineProperty(this, "attribute", new CommonAttribute());
      _defineProperty(this, "verticalOffset", 0);
      _defineProperty(this, "horizontalOffset", 0);
      _defineProperty(this, "width", 0);
      _defineProperty(this, "height", 0);
      _defineProperty(this, "zIndex", 0);
      _defineProperty(this, "margin", [0, 0, 0, 0]);
      _defineProperty(this, "uid", 0);
      _defineProperty(this, "split", 0);
    }
    _createClass(CommonControl2, [{
      key: "setAttribute",
      value: function setAttribute(mask) {
        this.attribute.vertRelTo = getBitValue(mask, 3, 4);
      }
    }]);
    return CommonControl2;
  })();
  var ShapeControl = /* @__PURE__ */ (function(_CommonControl) {
    _inherits(ShapeControl2, _CommonControl);
    var _super = _createSuper(ShapeControl2);
    function ShapeControl2() {
      var _this;
      _classCallCheck(this, ShapeControl2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "type", 0);
      _defineProperty(_assertThisInitialized(_this), "info", null);
      _defineProperty(_assertThisInitialized(_this), "content", []);
      return _this;
    }
    return ShapeControl2;
  })(CommonControl);
  var TableControl = /* @__PURE__ */ (function(_CommonControl) {
    _inherits(TableControl2, _CommonControl);
    var _super = _createSuper(TableControl2);
    function TableControl2() {
      var _this;
      _classCallCheck(this, TableControl2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "tableAttribute", 0);
      _defineProperty(_assertThisInitialized(_this), "rowCount", 0);
      _defineProperty(_assertThisInitialized(_this), "columnCount", 0);
      _defineProperty(_assertThisInitialized(_this), "borderFillID", 0);
      _defineProperty(_assertThisInitialized(_this), "content", []);
      return _this;
    }
    _createClass(TableControl2, [{
      key: "addRow",
      value: function addRow(row, list) {
        if (!this.content[row]) {
          this.content[row] = [];
        }
        this.content[row].push(list);
      }
    }]);
    return TableControl2;
  })(CommonControl);
  var Section = function Section2() {
    _classCallCheck(this, Section2);
    _defineProperty(this, "width", 0);
    _defineProperty(this, "height", 0);
    _defineProperty(this, "paddingLeft", 0);
    _defineProperty(this, "paddingRight", 0);
    _defineProperty(this, "paddingTop", 0);
    _defineProperty(this, "paddingBottom", 0);
    _defineProperty(this, "headerPadding", 0);
    _defineProperty(this, "footerPadding", 0);
    _defineProperty(this, "content", []);
    _defineProperty(this, "orientation", 0);
    _defineProperty(this, "bookBindingMethod", 0);
  };
  var Paragraph = /* @__PURE__ */ (function() {
    function Paragraph2() {
      _classCallCheck(this, Paragraph2);
      _defineProperty(this, "content", []);
      _defineProperty(this, "shapeBuffer", []);
      _defineProperty(this, "controls", []);
      _defineProperty(this, "lineSegments", []);
      _defineProperty(this, "shapeIndex", 0);
      _defineProperty(this, "aligns", 0);
      _defineProperty(this, "textSize", 0);
    }
    _createClass(Paragraph2, [{
      key: "getShapeEndPos",
      value: function getShapeEndPos(index) {
        if (index === this.shapeBuffer.length - 1) {
          return this.content.length - 1;
        }
        return this.shapeBuffer[index + 1].pos - 1;
      }
    }, {
      key: "getNextSize",
      value: function getNextSize(index) {
        var next = this.lineSegments[index + 1];
        if (!next) {
          return this.textSize;
        }
        return next.start;
      }
    }]);
    return Paragraph2;
  })();
  var ParagraphList = function ParagraphList2(attribute, items) {
    _classCallCheck(this, ParagraphList2);
    _defineProperty(this, "attribute", void 0);
    _defineProperty(this, "items", []);
    this.attribute = attribute;
    this.items = items;
  };
  var CharType;
  (function(CharType2) {
    CharType2[CharType2["Char"] = 0] = "Char";
    CharType2[CharType2["Inline"] = 1] = "Inline";
    CharType2[CharType2["Extened"] = 2] = "Extened";
  })(CharType || (CharType = {}));
  var HWPChar = function HWPChar2(type, value) {
    _classCallCheck(this, HWPChar2);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "value", void 0);
    this.type = type;
    this.value = value;
  };
  var ShapePointer = function ShapePointer2(pos, shapeIndex) {
    _classCallCheck(this, ShapePointer2);
    _defineProperty(this, "pos", 0);
    _defineProperty(this, "shapeIndex", 0);
    this.pos = pos;
    this.shapeIndex = shapeIndex;
  };
  var LineSegment = function LineSegment2() {
    _classCallCheck(this, LineSegment2);
    _defineProperty(this, "start", 0);
    _defineProperty(this, "y", 0);
    _defineProperty(this, "height", 0);
    _defineProperty(this, "textHeight", 0);
    _defineProperty(this, "baseLineGap", 0);
    _defineProperty(this, "lineSpacing", 0);
    _defineProperty(this, "startByte", 0);
    _defineProperty(this, "width", 0);
  };
  var RecordReader = /* @__PURE__ */ (function() {
    function RecordReader2(records) {
      _classCallCheck(this, RecordReader2);
      _defineProperty(this, "cursor", void 0);
      _defineProperty(this, "records", void 0);
      this.records = records;
      this.cursor = 0;
    }
    _createClass(RecordReader2, [{
      key: "hasNext",
      value: function hasNext() {
        return this.cursor < this.records.length;
      }
    }, {
      key: "current",
      value: function current() {
        return this.records[this.cursor];
      }
    }, {
      key: "read",
      value: function read() {
        var result = this.records[this.cursor];
        this.cursor += 1;
        return result;
      }
    }]);
    return RecordReader2;
  })();
  function isTable(control) {
    return control.id === CommonCtrlID.Table;
  }
  function isShape(control) {
    return control.id === CommonCtrlID.GenShapeObject;
  }
  function isPicture(control) {
    return control.type === CommonCtrlID.Picture;
  }
  var ColumnType;
  (function(ColumnType2) {
    ColumnType2[ColumnType2["Normal"] = 0] = "Normal";
    ColumnType2[ColumnType2["Parallel"] = 1] = "Parallel";
    ColumnType2[ColumnType2["Justify"] = 2] = "Justify";
  })(ColumnType || (ColumnType = {}));
  var ColumnDirection;
  (function(ColumnDirection2) {
    ColumnDirection2[ColumnDirection2["Left"] = 0] = "Left";
    ColumnDirection2[ColumnDirection2["Right"] = 1] = "Right";
    ColumnDirection2[ColumnDirection2["Justify"] = 2] = "Justify";
  })(ColumnDirection || (ColumnDirection = {}));
  var ColumnControl = function ColumnControl2() {
    _classCallCheck(this, ColumnControl2);
    _defineProperty(this, "id", 0);
    _defineProperty(this, "type", ColumnType.Normal);
    _defineProperty(this, "count", 0);
    _defineProperty(this, "direction", ColumnDirection.Left);
    _defineProperty(this, "isSameWidth", true);
    _defineProperty(this, "gap", 0);
    _defineProperty(this, "widths", []);
    _defineProperty(this, "borderStyle", 0);
    _defineProperty(this, "borderWidth", 0);
    _defineProperty(this, "borderColor", 0);
  };
  var SectionParser = /* @__PURE__ */ (function() {
    function SectionParser2(data) {
      _classCallCheck(this, SectionParser2);
      _defineProperty(this, "record", void 0);
      _defineProperty(this, "result", void 0);
      _defineProperty(this, "content", []);
      this.record = parseRecordTree(data);
      this.result = new Section();
    }
    _createClass(SectionParser2, [{
      key: "visitPageDef",
      value: function visitPageDef(record) {
        var reader = new ByteReader(record.payload);
        this.result.width = reader.readUInt32();
        this.result.height = reader.readUInt32();
        this.result.paddingLeft = reader.readUInt32();
        this.result.paddingRight = reader.readUInt32();
        this.result.paddingTop = reader.readUInt32();
        this.result.paddingBottom = reader.readUInt32();
        this.result.headerPadding = reader.readUInt32();
        this.result.footerPadding = reader.readUInt32();
        var property = reader.readUInt32();
        this.result.orientation = getBitValue(property, 0, 0);
        this.result.bookBindingMethod = getBitValue(property, 1, 2);
      }
      // TODO: (@hahnlee) mapper 패턴 사용하기
    }, {
      key: "visitParaText",
      value: function visitParaText(record, paragraph) {
        var reader = new ByteReader(record.payload);
        var readByte = 0;
        while (readByte < record.size) {
          var charCode = reader.readUInt16();
          switch (charCode) {
            // Char
            case 0:
            case 10:
            case 13: {
              paragraph.content.push(new HWPChar(CharType.Char, charCode));
              paragraph.textSize += 1;
              readByte += 2;
              break;
            }
            // Inline
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 19:
            case 20: {
              paragraph.content.push(new HWPChar(CharType.Inline, charCode));
              paragraph.textSize += 8;
              reader.skipByte(14);
              readByte += 16;
              break;
            }
            // Extened
            case 1:
            case 2:
            case 3:
            case 11:
            case 12:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 21:
            case 22:
            case 23: {
              paragraph.content.push(new HWPChar(CharType.Extened, charCode));
              reader.skipByte(14);
              paragraph.textSize += 8;
              readByte += 16;
              break;
            }
            default: {
              paragraph.content.push(new HWPChar(CharType.Char, String.fromCharCode(charCode)));
              paragraph.textSize += 1;
              readByte += 2;
            }
          }
        }
      }
    }, {
      key: "visitCharShape",
      value: function visitCharShape(record, paragraph) {
        var reader = new ByteReader(record.payload);
        var shapePointer = new ShapePointer(reader.readUInt32(), reader.readUInt32());
        paragraph.shapeBuffer.push(shapePointer);
      }
    }, {
      key: "visitCommonControl",
      value: function visitCommonControl(reader, control) {
        control.setAttribute(reader.readUInt32());
        control.verticalOffset = reader.readUInt32();
        control.horizontalOffset = reader.readUInt32();
        control.width = reader.readUInt32();
        control.height = reader.readUInt32();
        control.zIndex = reader.readUInt32();
        control.margin = [reader.readInt16(), reader.readInt16(), reader.readInt16(), reader.readInt16()];
        control.uid = reader.readUInt32();
        control.split = reader.readInt32();
      }
    }, {
      key: "visitTableControl",
      value: function visitTableControl(reader) {
        var tableControl = new TableControl();
        tableControl.id = CommonCtrlID.Table;
        this.visitCommonControl(reader, tableControl);
        return tableControl;
      }
    }, {
      key: "getControl",
      value: function getControl(reader) {
        var ctrlID = reader.readUInt32();
        if (ctrlID === CommonCtrlID.Table) {
          return this.visitTableControl(reader);
        }
        if (ctrlID === CommonCtrlID.GenShapeObject) {
          var shape = new ShapeControl();
          shape.id = ctrlID;
          this.visitCommonControl(reader, shape);
          return shape;
        }
        if (ctrlID === OtherCtrlID.Column) {
          var column = new ColumnControl();
          var attribute = reader.readUInt16();
          column.type = getBitValue(attribute, 0, 1);
          column.count = getBitValue(attribute, 2, 9);
          column.direction = getBitValue(attribute, 10, 11);
          column.isSameWidth = getFlag(attribute, 12);
          column.id = ctrlID;
          column.gap = reader.readUInt16();
          if (!column.isSameWidth) {
            var widths = [];
            for (var i = 0; i < column.count; i += 1) {
              widths.push(reader.readUInt16());
            }
            column.widths = widths;
          }
          reader.readUInt16();
          column.borderStyle = reader.readUInt8();
          column.borderWidth = reader.readUInt8();
          column.borderColor = reader.readUInt32();
          return column;
        }
        return {
          id: ctrlID
        };
      }
    }, {
      key: "visitControlHeader",
      value: function visitControlHeader(record, paragraph) {
        var reader = new ByteReader(record.payload);
        var control = this.getControl(reader);
        var childrenReader = new RecordReader(record.children);
        while (childrenReader.hasNext()) {
          this.visit(childrenReader, paragraph, control);
        }
        paragraph.controls.push(control);
      }
    }, {
      key: "visitCellListHeader",
      value: function visitCellListHeader(reader) {
        var option = {
          column: reader.readUInt16(),
          row: reader.readUInt16(),
          colSpan: reader.readUInt16(),
          rowSpan: reader.readUInt16(),
          width: reader.readUInt32(),
          height: reader.readUInt32(),
          padding: [reader.readUInt16(), reader.readUInt16(), reader.readUInt16(), reader.readUInt16()]
        };
        if (!reader.isEOF()) {
          option.borderFillID = reader.readUInt16() - 1;
        }
        return option;
      }
    }, {
      key: "visitListHeader",
      value: function visitListHeader(record, reader, control) {
        if (!control) {
          throw new Error("Except: control, Recived: ".concat(control));
        }
        var byteReader = new ByteReader(record.payload);
        var paragraphs = record.size === 30 ? byteReader.readInt16() : byteReader.readInt32();
        byteReader.readUInt32();
        var items = [];
        for (var i = 0; i < paragraphs; i += 1) {
          var next = reader.read();
          this.visitParagraphHeader(next, items, control);
        }
        if (record.parentTagID === SectionTagID.HWPTAG_CTRL_HEADER) {
          if (isTable(control)) {
            var options = this.visitCellListHeader(byteReader);
            var list = new ParagraphList(options, items);
            control.addRow(options.row, list);
          }
        }
        if (record.parentTagID === SectionTagID.HWPTAG_SHAPE_COMPONENT) {
          if (isShape(control)) {
            control.content.push(new ParagraphList(null, items));
          }
        }
      }
    }, {
      key: "visitTable",
      value: function visitTable(record, control) {
        var reader = new ByteReader(record.payload);
        if (!control) {
          throw new Error("Expect control");
        }
        if (control.id !== CommonCtrlID.Table) {
          throw new Error("Expect: ".concat(CommonCtrlID.Table, ", Recived: ").concat(control.id));
        }
        control.tableAttribute = reader.readUInt32();
        control.rowCount = reader.readUInt16();
        control.columnCount = reader.readUInt16();
        reader.skipByte(10 + 2 * control.rowCount);
        control.borderFillID = reader.readUInt16();
      }
    }, {
      key: "visitShapeComponent",
      value: function visitShapeComponent(record, paragraph, control) {
        var childrenReader = new RecordReader(record.children);
        while (childrenReader.hasNext()) {
          this.visit(childrenReader, paragraph, control);
        }
      }
    }, {
      key: "visitPicture",
      value: function visitPicture(record, control) {
        if (!isShape(control)) {
          throw new Error("Control type not matched");
        }
        var reader = new ByteReader(record.payload);
        reader.skipByte(4 * 17 + 3);
        control.type = CommonCtrlID.Picture;
        control.info = {
          binID: reader.readUInt16() - 1
        };
      }
    }, {
      key: "visitLineSegment",
      value: function visitLineSegment(record, paragraph) {
        var reader = new ByteReader(record.payload);
        while (!reader.isEOF()) {
          var lineSegment = new LineSegment();
          lineSegment.start = reader.readUInt32();
          lineSegment.y = reader.readInt32();
          lineSegment.height = reader.readInt32();
          lineSegment.textHeight = reader.readInt32();
          lineSegment.baseLineGap = reader.readInt32();
          lineSegment.lineSpacing = reader.readInt32();
          lineSegment.startByte = reader.readInt32();
          lineSegment.width = reader.readInt32();
          reader.readUInt32();
          paragraph.lineSegments.push(lineSegment);
        }
      }
    }, {
      key: "visit",
      value: function visit(reader, paragraph, control) {
        var record = reader.read();
        switch (record.tagID) {
          case SectionTagID.HWPTAG_LIST_HEADER: {
            this.visitListHeader(record, reader, control);
            break;
          }
          case SectionTagID.HWPTAG_PAGE_DEF: {
            this.visitPageDef(record);
            break;
          }
          case SectionTagID.HWPTAG_PARA_TEXT: {
            this.visitParaText(record, paragraph);
            break;
          }
          case SectionTagID.HWPTAG_PARA_CHAR_SHAPE: {
            this.visitCharShape(record, paragraph);
            break;
          }
          case SectionTagID.HWPTAG_CTRL_HEADER: {
            this.visitControlHeader(record, paragraph);
            break;
          }
          case SectionTagID.HWPTAG_TABLE: {
            this.visitTable(record, control);
            break;
          }
          case SectionTagID.HWPTAG_SHAPE_COMPONENT: {
            this.visitShapeComponent(record, paragraph, control);
            break;
          }
          case SectionTagID.HWPTAG_SHAPE_COMPONENT_PICTURE: {
            this.visitPicture(record, control);
            break;
          }
          case SectionTagID.HWPTAG_PARA_LINE_SEG: {
            this.visitLineSegment(record, paragraph);
            break;
          }
        }
      }
    }, {
      key: "visitParagraphHeader",
      value: function visitParagraphHeader(record, content, control) {
        var result = new Paragraph();
        var reader = new ByteReader(record.payload);
        reader.skipByte(8);
        result.shapeIndex = reader.readUInt16();
        var childrenRecordReader = new RecordReader(record.children);
        while (childrenRecordReader.hasNext()) {
          this.visit(childrenRecordReader, result, control);
        }
        content.push(result);
      }
    }, {
      key: "traverse",
      value: function traverse(record) {
        var reader = new RecordReader(record.children);
        while (reader.hasNext()) {
          this.visitParagraphHeader(reader.read(), this.content);
        }
      }
    }, {
      key: "parse",
      value: function parse2() {
        this.traverse(this.record);
        this.result.content = this.content;
        return this.result;
      }
    }]);
    return SectionParser2;
  })();
  var FILE_HEADER_BYTES = 256;
  var SUPPORTED_VERSION = new HWPVersion(5, 1, 0, 0);
  var SIGNATURE = "HWP Document File";
  function parseFileHeader(container) {
    var fileHeader = cfb.find(container, "FileHeader");
    if (!fileHeader) {
      throw new Error("Cannot find FileHeader");
    }
    var content = fileHeader.content;
    if (content.length !== FILE_HEADER_BYTES) {
      throw new Error("FileHeader must be ".concat(FILE_HEADER_BYTES, " bytes, Received: ").concat(content.length));
    }
    var signature = String.fromCharCode.apply(String, _toConsumableArray(Array.from(content.slice(0, 17))));
    if (SIGNATURE !== signature) {
      throw new Error("hwp file's signature should be ".concat(SIGNATURE, ". Received version: ").concat(signature));
    }
    var _Array$from$reverse = Array.from(content.slice(32, 36)).reverse(), _Array$from$reverse2 = _slicedToArray(_Array$from$reverse, 4), major = _Array$from$reverse2[0], minor = _Array$from$reverse2[1], build = _Array$from$reverse2[2], revision = _Array$from$reverse2[3];
    var version = new HWPVersion(major, minor, build, revision);
    if (!version.isCompatible(SUPPORTED_VERSION)) {
      throw new Error("hwp.js only support ".concat(SUPPORTED_VERSION, " format. Received version: ").concat(version));
    }
    return new HWPHeader(version, signature);
  }
  function parseDocInfo(container) {
    var docInfoEntry = cfb.find(container, "DocInfo");
    if (!docInfoEntry) {
      throw new Error("DocInfo not exist");
    }
    var content = docInfoEntry.content;
    var decodedContent = pako_1.inflate(content, {
      windowBits: -15
    });
    return new DocInfoParser(decodedContent, container).parse();
  }
  function parseSection(container, sectionNumber) {
    var section = cfb.find(container, "Root Entry/BodyText/Section".concat(sectionNumber));
    if (!section) {
      throw new Error("Section not exist");
    }
    var content = section.content;
    var decodedContent = pako_1.inflate(content, {
      windowBits: -15
    });
    return new SectionParser(decodedContent).parse();
  }
  function parse(input, options) {
    var container = cfb.read(input, options);
    var header = parseFileHeader(container);
    var docInfo = parseDocInfo(container);
    var sections = [];
    for (var i = 0; i < docInfo.sectionSize; i += 1) {
      sections.push(parseSection(container, i));
    }
    return new HWPDocument(header, docInfo, sections);
  }
  function splitTable(table, overflowColumns, currentHeight, contentHeight) {
    var targetHeight = currentHeight;
    var tableHeight = 0;
    var splitRowIndex = -1;
    var overflow = overflowColumns;
    var columns = [];
    var rowHeights = [];
    for (var i = 0; i < table.length; i += 1) {
      var row = table[i];
      var rowHeight = Math.min.apply(Math, _toConsumableArray(row.map(function(column2) {
        return column2.attribute.height;
      })));
      rowHeights.push(rowHeight);
      tableHeight += rowHeight;
      if (targetHeight >= tableHeight) {
        columns.push(row);
      } else {
        splitRowIndex = i;
        break;
      }
    }
    for (var _i = 0; _i < overflow.length; _i += 1) {
      var firstRow = columns[0];
      var column = overflow[_i];
      if (column) {
        firstRow.splice(column.attribute.column, 0, column);
      }
    }
    overflow = [];
    columns.forEach(function(row2, rowIndex) {
      row2.forEach(function(column2) {
        if (column2.attribute.height > targetHeight) {
          var columnHeight = column2.attribute.height;
          var columnRowSpan = column2.attribute.rowSpan;
          var nextRowSpan = columnRowSpan - (splitRowIndex - rowIndex - 2);
          column2.attribute.height = targetHeight;
          column2.attribute.rowSpan = nextRowSpan;
          overflow[column2.attribute.column] = new ParagraphList(_objectSpread2(_objectSpread2({}, column2.attribute), {}, {
            row: 0,
            height: columnHeight - targetHeight,
            rowSpan: columnRowSpan - nextRowSpan
          }), []);
        }
      });
      targetHeight -= rowHeights[rowIndex];
    });
    if (splitRowIndex < 0) {
      return [columns];
    }
    var next = splitTable(table.slice(splitRowIndex), overflow, contentHeight, contentHeight);
    return [columns].concat(_toConsumableArray(next));
  }
  var PageBuilder = /* @__PURE__ */ (function() {
    function PageBuilder2(section) {
      var _this = this;
      _classCallCheck(this, PageBuilder2);
      _defineProperty(this, "section", void 0);
      _defineProperty(this, "currentSection", void 0);
      _defineProperty(this, "currentParagraph", new Paragraph());
      _defineProperty(this, "readIndex", 0);
      _defineProperty(this, "contentHeight", 0);
      _defineProperty(this, "currentHeight", 0);
      _defineProperty(this, "controlIndex", 0);
      _defineProperty(this, "startChatIndex", 0);
      _defineProperty(this, "endCharIndex", 0);
      _defineProperty(this, "shapeBufferIndex", 0);
      _defineProperty(this, "latestY", 0);
      _defineProperty(this, "result", []);
      _defineProperty(this, "visitParagraph", function(paragraph) {
        _this.readIndex = 0;
        _this.controlIndex = 0;
        _this.startChatIndex = 0;
        _this.endCharIndex = 0;
        _this.shapeBufferIndex = 0;
        _this.currentParagraph = new Paragraph();
        paragraph.lineSegments.forEach(function(lineSegment, index) {
          _this.visitLine(lineSegment, index, paragraph);
        });
        _this.exitParagraph(paragraph);
      });
      this.section = section;
      this.currentSection = this.createSection();
      this.contentHeight = section.height - section.headerPadding - section.footerPadding - section.paddingTop - section.paddingBottom;
    }
    _createClass(PageBuilder2, [{
      key: "createSection",
      value: function createSection() {
        var session = new Section();
        session.width = this.section.width;
        session.height = this.section.height;
        session.paddingTop = this.section.paddingTop;
        session.paddingRight = this.section.paddingRight;
        session.paddingBottom = this.section.paddingBottom;
        session.paddingLeft = this.section.paddingLeft;
        session.headerPadding = this.section.headerPadding;
        session.footerPadding = this.section.footerPadding;
        return session;
      }
    }, {
      key: "getLine",
      value: function getLine(lineSegment, index, paragraph) {
        var start = lineSegment.start;
        var nextSize = paragraph.getNextSize(index);
        var line = [];
        var read = start;
        while (read < nextSize) {
          var _char = paragraph.content[this.readIndex];
          if (_char.type === CharType.Char) {
            read += 1;
          } else {
            read += 8;
          }
          line.push(_char);
          this.readIndex += 1;
        }
        return line;
      }
    }, {
      key: "checkoutShpeBuffer",
      value: function checkoutShpeBuffer(paragraph) {
        var endIndex = paragraph.getShapeEndPos(this.shapeBufferIndex);
        var startIndex = 0;
        while (this.endCharIndex <= endIndex && this.shapeBufferIndex < paragraph.shapeBuffer.length - 1) {
          endIndex = paragraph.getShapeEndPos(this.shapeBufferIndex);
          var _shapeBuffer = paragraph.shapeBuffer[this.shapeBufferIndex];
          this.currentParagraph.shapeBuffer.push({
            shapeIndex: _shapeBuffer.shapeIndex,
            pos: startIndex
          });
          startIndex += endIndex - this.startChatIndex - startIndex;
          this.shapeBufferIndex += 1;
        }
        var shapeBuffer = paragraph.shapeBuffer[this.shapeBufferIndex];
        this.currentParagraph.shapeBuffer.push({
          shapeIndex: shapeBuffer.shapeIndex,
          pos: startIndex
        });
      }
    }, {
      key: "exitParagraph",
      value: function exitParagraph(paragraph) {
        this.checkoutShpeBuffer(paragraph);
        this.currentSection.content.push(this.currentParagraph);
      }
    }, {
      key: "exitPage",
      value: function exitPage(paragraph) {
        this.exitParagraph(paragraph);
        this.result.push(this.currentSection);
        this.currentSection = this.createSection();
        this.currentParagraph = new Paragraph();
        this.currentParagraph.shapeIndex = paragraph.shapeIndex;
        this.currentHeight = 0;
      }
    }, {
      key: "createTable",
      value: function createTable(list, width) {
        var height = list.reduce(function(result, current) {
          var columnHeight = Math.min.apply(Math, _toConsumableArray(current.map(function(c) {
            return c.attribute.height;
          })));
          return result + columnHeight;
        }, 0);
        var control = new TableControl();
        control.id = CommonCtrlID.Table;
        control.width = width;
        control.height = height;
        control.content = list;
        control.rowCount = list.length;
        return control;
      }
    }, {
      key: "visitLine",
      value: function visitLine(lineSegment, index, paragraph) {
        var _this2 = this;
        var line = this.getLine(lineSegment, index, paragraph);
        if (lineSegment.y === 0 || lineSegment.y < this.latestY) {
          this.exitPage(paragraph);
          this.startChatIndex = this.endCharIndex;
          this.currentHeight = 0;
        }
        this.latestY = lineSegment.y;
        this.currentHeight += lineSegment.height + lineSegment.lineSpacing;
        line.forEach(function(content) {
          if (content.type !== CharType.Extened) {
            _this2.currentParagraph.content.push(content);
            _this2.endCharIndex += 1;
            return;
          }
          var control = paragraph.controls[_this2.controlIndex];
          _this2.controlIndex += 1;
          if (!isTable(control)) {
            _this2.currentParagraph.content.push(content);
            _this2.currentParagraph.controls.push(control);
            _this2.endCharIndex += 1;
            return;
          }
          _this2.currentHeight -= lineSegment.height + lineSegment.lineSpacing;
          var tables = splitTable(control.content, [], _this2.contentHeight - _this2.currentHeight, _this2.contentHeight).map(function(table) {
            return _this2.createTable(table, control.width);
          });
          tables.forEach(function(table, tableIndex) {
            _this2.currentParagraph.content.push(content);
            _this2.currentParagraph.controls.push(table);
            if (tables.length > 1 && tableIndex !== tables.length - 1) {
              _this2.exitPage(paragraph);
              _this2.startChatIndex = _this2.endCharIndex;
            }
          });
          _this2.currentHeight += tables[tables.length - 1].height;
          _this2.endCharIndex += 1;
        });
      }
    }, {
      key: "build",
      value: function build() {
        this.section.content.forEach(this.visitParagraph);
        this.result.shift();
        this.result.push(this.currentSection);
        return this.result;
      }
    }]);
    return PageBuilder2;
  })();
  function parsePage(doc) {
    var sections = [];
    doc.sections.forEach(function(section) {
      sections = sections.concat(new PageBuilder(section).build());
    });
    doc.sections = sections;
    return doc;
  }
  var hideFromPrintClass = "hwpjs-pe-no-print";
  var preservePrintClass = "hwpjs-pe-preserve-print";
  var preserveAncestorClass = "hwpjs-pe-preserve-ancestor";
  var bodyElementName = "BODY";
  function walkTree(element, callback) {
    var currentElement = element;
    callback(currentElement, true);
    currentElement = currentElement.parentElement;
    while (currentElement && currentElement.nodeName !== bodyElementName) {
      callback(currentElement, false);
      currentElement = currentElement.parentElement;
    }
  }
  function walkSiblings(element, callback) {
    var sibling = element.previousElementSibling;
    while (sibling) {
      callback(sibling, false);
      sibling = sibling.previousElementSibling;
    }
    sibling = element.nextElementSibling;
    while (sibling) {
      callback(sibling, false);
      sibling = sibling.nextElementSibling;
    }
  }
  function printFrame(elements) {
    var printStyle = "\n    @page {\n      margin: 0;\n    }\n\n    @media print {\n      html, body {\n        width: 100%;\n        height: 100%;\n        background-color: #FFF;\n      }\n\n      .".concat(hideFromPrintClass, " {\n        display: none !important;\n      }\n\n      .").concat(preserveAncestorClass, " {\n        display: block !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        border: none !important;\n        box-shadow: none !important;\n        overflow: visible !important;\n      }\n\n      .").concat(preserveAncestorClass, " > *  {\n        box-shadow: none !important;\n        overflow: visible !important;\n      }\n\n      .").concat(preservePrintClass, " {\n        box-shadow: none !important;\n        height: 100% !important;\n        margin: 0 !important;\n      }\n\n      * {\n        -webkit-print-color-adjust: exact !important;\n        color-adjust: exact !important;\n      }\n    }\n  ");
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyle;
    document.head.appendChild(styleSheet);
    var hide = function hide2(element) {
      if (!element.classList.contains(preservePrintClass)) {
        element.classList.add(hideFromPrintClass);
      }
    };
    var preserve = function preserve2(element, isStartingElement) {
      element.classList.remove(hideFromPrintClass);
      element.classList.add(preservePrintClass);
      if (!isStartingElement) {
        element.classList.add(preserveAncestorClass);
      }
    };
    var clean = function clean2(element) {
      element.classList.remove(hideFromPrintClass);
      element.classList.remove(preservePrintClass);
      element.classList.remove(preserveAncestorClass);
    };
    elements.forEach(function(i) {
      walkTree(i, function(element, isStartingElement) {
        preserve(element, isStartingElement);
        walkSiblings(element, hide);
      });
    });
    window.print();
    elements.forEach(function(i) {
      walkTree(i, function(element) {
        clean(element);
        walkSiblings(element, clean);
      });
    });
    styleSheet.remove();
  }
  var Header = /* @__PURE__ */ (function() {
    function Header2(view, content, pages) {
      var _this = this;
      _classCallCheck(this, Header2);
      _defineProperty(this, "pages", void 0);
      _defineProperty(this, "observer", void 0);
      _defineProperty(this, "container", void 0);
      _defineProperty(this, "content", void 0);
      _defineProperty(this, "modal", null);
      _defineProperty(this, "pageNumber", null);
      _defineProperty(this, "infoButton", null);
      _defineProperty(this, "printButton", null);
      _defineProperty(this, "handleModalClick", function(event) {
        if (event.currentTarget !== event.target) return;
        if (_this.modal) {
          _this.modal.style.display = "none";
        }
      });
      _defineProperty(this, "handleInfoButtionClick", function() {
        if (_this.modal) {
          _this.modal.style.display = "flex";
        }
      });
      _defineProperty(this, "handlePrintButtionClick", function() {
        printFrame(_this.pages);
      });
      this.content = content;
      this.pages = pages;
      this.container = this.drawContainer(view);
      this.modal = this.drawModal(view);
      this.observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            if (entry.isIntersecting && entry.target.parentElement) {
              var page = entry.target.getAttribute("data-page-number");
              var pageNumber = Number(page) + 1;
              _this.updatePageNumber(pageNumber);
            }
          }
        });
      }, {
        root: this.content,
        rootMargin: "0px"
      });
      this.pages.forEach(function(page) {
        _this.observer.observe(page.querySelector(".hwpjs-observer"));
      });
      this.draw();
      if (!document.getElementById("hwpjs-header-css")) {
        var buttonStyle = "\n      .hwpjs-header-control {\n        transition: background .2s;\n      }\n      .hwpjs-header-control:hover {\n        background: #DDD;\n      }\n      .hwpjs-header-control:active {\n        background: #AAA;\n      }\n      ";
        var styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.id = "hwpjs-header-css";
        styleSheet.innerText = buttonStyle;
        document.head.appendChild(styleSheet);
      }
    }
    _createClass(Header2, [{
      key: "updatePageNumber",
      value: function updatePageNumber(pageNumber) {
        if (this.pageNumber) {
          this.pageNumber.textContent = pageNumber.toString();
        }
      }
    }, {
      key: "distory",
      value: function distory() {
        var _this2 = this, _this$modal, _this$infoButton, _this$printButton;
        this.pages.forEach(function(page) {
          _this2.observer.unobserve(page);
        });
        (_this$modal = this.modal) === null || _this$modal === void 0 ? void 0 : _this$modal.removeEventListener("click", this.handleModalClick);
        this.modal = null;
        (_this$infoButton = this.infoButton) === null || _this$infoButton === void 0 ? void 0 : _this$infoButton.removeEventListener("click", this.handleInfoButtionClick);
        this.infoButton = null;
        (_this$printButton = this.printButton) === null || _this$printButton === void 0 ? void 0 : _this$printButton.removeEventListener("click", this.handleInfoButtionClick);
        this.printButton = null;
        this.pageNumber = null;
      }
    }, {
      key: "drawContainer",
      value: function drawContainer(container) {
        var header = document.createElement("div");
        header.style.position = "absolute";
        header.style.zIndex = "1";
        header.style.top = "0";
        header.style.right = "0";
        header.style.left = "0";
        header.style.boxShadow = "0 1px 3px rgba(204, 204, 204, 1)";
        header.style.backgroundColor = "rgb(249, 249, 250)";
        header.style.height = "32px";
        var content = document.createElement("div");
        content.style.display = "flex";
        content.style.alignItems = "center";
        content.style.height = "100%";
        content.style.margin = "0 auto";
        content.style.maxWidth = "1000px";
        content.style.width = "100%";
        content.style.padding = "0 24px";
        header.appendChild(content);
        container.appendChild(header);
        return content;
      }
    }, {
      key: "drawModal",
      value: function drawModal(view) {
        var modal = document.createElement("div");
        modal.style.position = "absolute";
        modal.style.zIndex = "2";
        modal.style.top = "0";
        modal.style.right = "0";
        modal.style.bottom = "0";
        modal.style.left = "0";
        modal.style.background = "rgba(0, 0, 0, 0.7)";
        modal.style.display = "none";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.cursor = "pointer";
        var content = document.createElement("div");
        content.style.background = "#FFF";
        content.style.borderRadius = "5px";
        content.style.padding = "0 24px";
        content.style.cursor = "initial";
        content.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";
        var title = document.createElement("h1");
        var link = document.createElement("a");
        link.href = "https://github.com/hahnlee/hwp.js";
        link.textContent = "hwp.js";
        link.target = "_blink";
        link.rel = "noopener noreferrer";
        title.appendChild(link);
        var description = document.createElement("p");
        description.textContent = "\uBCF8 \uC81C\uD488\uC740 \uD55C\uAE00\uACFC\uCEF4\uD4E8\uD130\uC758 \uD55C/\uAE00 \uBB38\uC11C \uD30C\uC77C(.hwp) \uACF5\uAC1C \uBB38\uC11C\uB97C \uCC38\uACE0\uD558\uC5EC \uAC1C\uBC1C\uD558\uC600\uC2B5\uB2C8\uB2E4.";
        var copyright = document.createElement("p");
        copyright.textContent = "Copyright 2020 Han Lee <hanlee.dev@gmail.com> and other contributors.";
        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(copyright);
        modal.appendChild(content);
        view.appendChild(modal);
        modal.addEventListener("click", this.handleModalClick);
        return modal;
      }
    }, {
      key: "drawPageNumber",
      value: function drawPageNumber() {
        this.pageNumber = document.createElement("span");
        this.pageNumber.textContent = "1";
        var totalPages = document.createElement("span");
        totalPages.textContent = "/".concat(this.pages.length, "\uCABD");
        this.container.appendChild(this.pageNumber);
        this.container.appendChild(totalPages);
      }
    }, {
      key: "drawInfoIcon",
      value: function drawInfoIcon() {
        var buttion = document.createElement("div");
        buttion.style.marginLeft = "10px";
        buttion.style.cursor = "pointer";
        buttion.style.height = "100%";
        buttion.style.padding = "5px";
        buttion.classList.add("hwpjs-header-control");
        buttion.innerHTML = '<svg width="393" height="394" viewBox="0 0 393 394" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden" style="height: 100%;width: auto;"><defs><clipPath id="hwpjs-header-info"><rect x="463" y="144" width="393" height="394"/></clipPath></defs><g clip-path="url(#--hwpjs-header-info)" transform="translate(-463 -144)"><path d="M640.245 292.076 640.245 471.79 678.755 471.79 678.755 292.076ZM640.245 209.21 640.245 247.602 678.755 247.602 678.755 209.21ZM463 144 856 144 856 537 463 537Z" fill-rule="evenodd"/></g></svg>';
        buttion.addEventListener("click", this.handleInfoButtionClick);
        this.container.appendChild(buttion);
        this.infoButton = buttion;
      }
    }, {
      key: "drawPrintIcon",
      value: function drawPrintIcon() {
        var buttion = document.createElement("div");
        buttion.style.cursor = "pointer";
        buttion.style.height = "100%";
        buttion.style.padding = "5px";
        buttion.classList.add("hwpjs-header-control");
        buttion.innerHTML = '<svg width="284" height="253" viewBox="0 0 284 253" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden" style="height: 100%;width: auto;"><defs><clipPath id="hwpjs-header-print"><rect x="498" y="82" width="284" height="253"/></clipPath></defs><g clip-path="url(#--hwpjs-header-print)" transform="translate(-498 -82)"><rect x="559" y="93" width="162" height="231" stroke="#000000" stroke-width="20" stroke-miterlimit="8" fill="none"/><path d="M756.613 155.95C751.961 155.95 748.189 159.719 748.189 164.368 748.189 169.018 751.961 172.787 756.613 172.787 761.266 172.787 765.038 169.018 765.038 164.368 765.038 159.719 761.266 155.95 756.613 155.95ZM499 140 781 140 781 228.612 781 275 720.698 275 720.698 228.612 559.302 228.612 559.302 275 499 275 499 228.612Z" fill-rule="evenodd"/><path d="M588 286 647.556 286" stroke="#000000" stroke-width="20" stroke-miterlimit="8" fill="none" fill-rule="evenodd"/><path d="M588 254 670.667 254" stroke="#000000" stroke-width="20" stroke-miterlimit="8" fill="none" fill-rule="evenodd"/></g></svg>';
        buttion.style.marginLeft = "auto";
        buttion.addEventListener("click", this.handlePrintButtionClick);
        this.container.appendChild(buttion);
        this.printButton = buttion;
      }
    }, {
      key: "draw",
      value: function draw() {
        this.drawPageNumber();
        this.drawPrintIcon();
        this.drawInfoIcon();
      }
    }]);
    return Header2;
  })();
  var BORDER_WIDTH = ["0.1mm", "0.12mm", "0.15mm", "0.2mm", "0.25mm", "0.3mm", "0.4mm", "0.5mm", "0.6mm", "0.7mm", "1.0mm", "1.5mm", "2.0mm", "3.0mm", "4.0mm", "5.0mm"];
  var BORDER_STYLE = {
    0: "none",
    1: "solid",
    2: "dashed",
    3: "dotted",
    8: "double"
  };
  var TEXT_ALIGN = {
    0: "justify",
    1: "left",
    2: "right",
    3: "center"
  };
  var HWPViewer = /* @__PURE__ */ (function() {
    function HWPViewer2(container, data) {
      var option = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        type: "binary"
      };
      _classCallCheck(this, HWPViewer2);
      _defineProperty(this, "hwpDocument", new HWPDocument(new HWPHeader(new HWPVersion(5, 0, 0, 0), "HWP Document File"), new DocInfo(), []));
      _defineProperty(this, "container", void 0);
      _defineProperty(this, "viewer", window.document.createElement("div"));
      _defineProperty(this, "pages", []);
      _defineProperty(this, "header", null);
      this.container = container;
      this.hwpDocument = parsePage(parse(data, option));
      this.draw();
    }
    _createClass(HWPViewer2, [{
      key: "distory",
      value: function distory() {
        var _this$header, _this$viewer$parentEl;
        this.pages = [];
        (_this$header = this.header) === null || _this$header === void 0 ? void 0 : _this$header.distory();
        (_this$viewer$parentEl = this.viewer.parentElement) === null || _this$viewer$parentEl === void 0 ? void 0 : _this$viewer$parentEl.removeChild(this.viewer);
      }
    }, {
      key: "createPage",
      value: function createPage(section, index) {
        var page = document.createElement("div");
        page.style.boxShadow = "0 1px 3px 1px rgba(60,64,67,.15)";
        page.style.backgroundColor = "#FFF";
        page.style.margin = "0 auto";
        page.style.position = "relative";
        page.style.pageBreakAfter = "always";
        page.style.width = "".concat(section.width / 7200, "in");
        page.style.height = "".concat(section.height / 7200, "in");
        page.style.paddingTop = "".concat((section.paddingTop + section.headerPadding) / 7200, "in");
        page.style.paddingRight = "".concat(section.paddingRight / 7200, "in");
        page.style.paddingBottom = "".concat(section.paddingBottom / 7200, "in");
        page.style.paddingLeft = "".concat(section.paddingLeft / 7200, "in");
        page.setAttribute("data-page-number", index.toString());
        var observer = document.createElement("div");
        observer.style.height = "2px";
        observer.style.position = "absolute";
        observer.style.width = "100%";
        observer.style.top = "50%";
        observer.style.left = "0";
        observer.classList.add("hwpjs-observer");
        observer.setAttribute("data-page-number", index.toString());
        page.appendChild(observer);
        this.pages.push(page);
        return page;
      }
    }, {
      key: "getRGBStyle",
      value: function getRGBStyle(rgb) {
        var _rgb = _slicedToArray(rgb, 3), red = _rgb[0], green = _rgb[1], blue = _rgb[2];
        return "rgb(".concat(red, ", ").concat(green, ", ").concat(blue, ")");
      }
    }, {
      key: "drawViewer",
      value: function drawViewer() {
        this.viewer.style.backgroundColor = "#E8EAED";
        this.viewer.style.position = "relative";
        this.viewer.style.overflow = "hidden";
        this.viewer.style.width = "100%";
        this.viewer.style.height = "100%";
      }
    }, {
      key: "drawBorderFill",
      value: function drawBorderFill(target, borderFillID) {
        if (borderFillID === void 0) {
          return;
        }
        var borderFill = this.hwpDocument.info.borderFills[borderFillID];
        target.style.borderTopColor = this.getRGBStyle(borderFill.style.top.color);
        target.style.borderRightColor = this.getRGBStyle(borderFill.style.right.color);
        target.style.borderBottomColor = this.getRGBStyle(borderFill.style.bottom.color);
        target.style.borderLeftColor = this.getRGBStyle(borderFill.style.left.color);
        target.style.borderTopWidth = BORDER_WIDTH[borderFill.style.top.width];
        target.style.borderRightWidth = BORDER_WIDTH[borderFill.style.right.width];
        target.style.borderBottomWidth = BORDER_WIDTH[borderFill.style.bottom.width];
        target.style.borderLeftWidth = BORDER_WIDTH[borderFill.style.left.width];
        target.style.borderTopStyle = BORDER_STYLE[borderFill.style.top.type];
        target.style.borderRightStyle = BORDER_STYLE[borderFill.style.right.type];
        target.style.borderBottomStyle = BORDER_STYLE[borderFill.style.bottom.type];
        target.style.borderLeftStyle = BORDER_STYLE[borderFill.style.left.type];
        if (borderFill.backgroundColor) {
          target.style.backgroundColor = this.getRGBStyle(borderFill.backgroundColor);
        }
      }
    }, {
      key: "drawColumn",
      value: function drawColumn(container, paragraphList) {
        var _this = this;
        var column = document.createElement("td");
        var _paragraphList$attrib = paragraphList.attribute, width = _paragraphList$attrib.width, height = _paragraphList$attrib.height, colSpan = _paragraphList$attrib.colSpan, rowSpan = _paragraphList$attrib.rowSpan, borderFillID = _paragraphList$attrib.borderFillID;
        column.style.width = "".concat(width / 100, "pt");
        column.style.height = "".concat(height / 100, "pt");
        column.colSpan = colSpan;
        column.rowSpan = rowSpan;
        this.drawBorderFill(column, borderFillID);
        paragraphList.items.forEach(function(paragraph) {
          _this.drawParagraph(column, paragraph);
        });
        container.appendChild(column);
      }
    }, {
      key: "drawTable",
      value: function drawTable(container, control) {
        var _this2 = this;
        var table = document.createElement("table");
        table.style.display = "inline-table";
        table.style.borderCollapse = "collapse";
        table.style.width = "".concat(control.width / 100, "pt");
        table.style.height = "".concat(control.height / 100, "pt");
        var tbody = document.createElement("tbody");
        var _loop = function _loop2(i2) {
          var tr = document.createElement("tr");
          control.content[i2].forEach(function(paragraphList) {
            _this2.drawColumn(tr, paragraphList);
          });
          tbody.appendChild(tr);
        };
        for (var i = 0; i < control.rowCount; i += 1) {
          _loop(i);
        }
        table.appendChild(tbody);
        container.appendChild(table);
      }
    }, {
      key: "drawShape",
      value: function drawShape(container, control) {
        var _this3 = this;
        var shapeGroup = document.createElement("div");
        shapeGroup.style.width = "".concat(control.width / 100, "pt");
        shapeGroup.style.height = "".concat(control.height / 100, "pt");
        if (control.attribute.vertRelTo === 0) {
          shapeGroup.style.position = "absolute";
          shapeGroup.style.top = "".concat(control.verticalOffset / 100, "pt");
          shapeGroup.style.left = "".concat(control.horizontalOffset / 100, "pt");
        } else {
          shapeGroup.style.marginTop = "".concat(control.verticalOffset / 100, "pt");
          shapeGroup.style.marginLeft = "".concat(control.horizontalOffset / 100, "pt");
        }
        shapeGroup.style.zIndex = "".concat(control.zIndex);
        shapeGroup.style.verticalAlign = "middle";
        shapeGroup.style.display = "inline-block";
        if (isPicture(control)) {
          var image = this.hwpDocument.info.binData[control.info.binID];
          var blob = new Blob([image.payload], {
            type: "images/".concat(image.extension)
          });
          var imageURL = window.URL.createObjectURL(blob);
          shapeGroup.style.backgroundImage = 'url("'.concat(imageURL, '")');
          shapeGroup.style.backgroundRepeat = "no-repeat";
          shapeGroup.style.backgroundPosition = "center";
          shapeGroup.style.backgroundSize = "contain";
        }
        control.content.forEach(function(paragraphList) {
          paragraphList.items.forEach(function(paragraph) {
            _this3.drawParagraph(shapeGroup, paragraph);
          });
        });
        container.appendChild(shapeGroup);
      }
    }, {
      key: "drawControl",
      value: function drawControl(container, control) {
        if (isTable(control)) {
          this.drawTable(container, control);
          return;
        }
        if (isShape(control)) {
          this.drawShape(container, control);
        }
      }
    }, {
      key: "drawText",
      value: function drawText(container, paragraph, shapePointer, endPos) {
        var _this4 = this;
        var range = paragraph.content.slice(shapePointer.pos, endPos + 1);
        var texts = [];
        var ctrlIndex = 0;
        range.forEach(function(hwpChar) {
          if (typeof hwpChar.value === "string") {
            texts.push(hwpChar.value);
            return;
          }
          if (hwpChar.type === CharType.Extened) {
            var control = paragraph.controls[ctrlIndex];
            ctrlIndex += 1;
            _this4.drawControl(container, control);
          }
          if (hwpChar.value === 13) {
            texts.push("\n");
          }
        });
        var text = texts.join("");
        var span = document.createElement("div");
        span.textContent = text;
        var charShape = this.hwpDocument.info.getCharShpe(shapePointer.shapeIndex);
        if (charShape) {
          var fontBaseSize = charShape.fontBaseSize, fontRatio = charShape.fontRatio, color = charShape.color, fontId = charShape.fontId;
          var fontSize = fontBaseSize * (fontRatio[0] / 100);
          span.style.fontSize = "".concat(fontSize, "pt");
          span.style.lineBreak = "anywhere";
          span.style.whiteSpace = "pre-wrap";
          span.style.color = this.getRGBStyle(color);
          var fontFace = this.hwpDocument.info.fontFaces[fontId[0]];
          span.style.fontFamily = fontFace.getFontFamily();
        }
        container.appendChild(span);
      }
    }, {
      key: "drawParagraph",
      value: function drawParagraph(container, paragraph) {
        var _this5 = this;
        var paragraphContainer = document.createElement("div");
        paragraphContainer.style.margin = "0";
        var shape = this.hwpDocument.info.paragraphShapes[paragraph.shapeIndex];
        paragraphContainer.style.textAlign = TEXT_ALIGN[shape.align];
        paragraph.shapeBuffer.forEach(function(shapePointer, index) {
          var endPos = paragraph.getShapeEndPos(index);
          _this5.drawText(paragraphContainer, paragraph, shapePointer, endPos);
        });
        container.append(paragraphContainer);
      }
    }, {
      key: "drawSection",
      value: function drawSection(container, section, index) {
        var _this6 = this;
        var page = this.createPage(section, index);
        page.style.marginBottom = "20px";
        section.content.forEach(function(paragraph) {
          _this6.drawParagraph(page, paragraph);
        });
        container.appendChild(page);
      }
    }, {
      key: "draw",
      value: function draw() {
        var _this7 = this;
        this.drawViewer();
        var content = document.createElement("div");
        content.style.height = "100%";
        content.style.padding = "52px 24px 24px 24px";
        content.style.overflow = "auto";
        content.style.position = "relative";
        content.style.zIndex = "0";
        this.hwpDocument.sections.forEach(function(section, index) {
          _this7.drawSection(content, section, index);
        });
        this.header = new Header(this.viewer, this.container, this.pages);
        this.viewer.appendChild(content);
        this.container.appendChild(this.viewer);
      }
    }]);
    return HWPViewer2;
  })();

  // public/hwp_entry.js
  window.HWP = { Viewer: HWPViewer, parse };
})();
