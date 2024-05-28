!(function (e) {
  if (!e.JSBridge || !window.JSBridge.native) {
    var i = {};
    (e.JSBridge = {
      onSuccess: function (e, t, r) {
        if (((r = void 0 === r ? 0 : r), "__iframe" === e.split("-")[r]))
          for (var n = 0; n < window.frames.length; n++)
            window.frames[n].postMessage(
              {
                xmmpMessage: { token: e, response: t, tokenParseCount: r + 1 },
              },
              "*"
            );
        else {
          if ("object" != typeof t)
            try {
              t = JSON.parse(decodeURIComponent(t));
            } catch (e) {
              console.error("JSBridge Error: Parse Response Error \n", e, t);
            }
          var o = 0;
          i[e] && (o = Date.now() - i[e]),
            console.log("客户端回调token:", e, o);
          try {
            window.JSBridge._callback[e](t);
          } catch (e) {}
        }
      },
      onEvent: function (t, r) {
        console.log("客户端事件触发：", t, r),
          window.JSBridge._event &&
            window.JSBridge._event[t] &&
            window.JSBridge._event[t].forEach(function (e) {
              try {
                e(r.data);
              } catch (e) {
                console.error(
                  "JSBridge Error: Event " + t + " Callback Error \n",
                  e,
                  r
                );
              }
            });
      },
      onNavigateBack: function () {
        var t = "navigateBack",
          r = !1;
        window.JSBridge._event &&
          window.JSBridge._event[t] &&
          window.JSBridge._event[t].forEach(function (e) {
            try {
              !1 === e() && (r = !0);
            } catch (e) {
              console.error(
                "JSBridge Error: Event " + t + " Callback Error \n",
                e
              );
            }
          }),
          r || window.JSBridge._requestHybrid({ method: "goBack" });
      },
      native: function (e, n) {
        return new Promise(function (t, r) {
          window.JSBridge._requestHybrid({
            method: e,
            data: n,
            callback: function (e) {
              console.log("客户端返回：", e), 200 === e.code ? t(e.data) : r(e);
            },
          });
        });
      },
      on: function (e, t) {
        return (
          e &&
            t &&
            (window.JSBridge._event[e] || (window.JSBridge._event[e] = []),
            window.JSBridge._event[e].push(t)),
          this
        );
      },
      once: function (e, t) {
        var r = function () {
          window.JSBridge.off(e, r), t();
        };
        window.JSBridge.on(e, r);
      },
      off: function (e, t) {
        if (e)
          if (t) {
            if (!window.JSBridge._event[e]) return this;
            for (var r = 0; r < window.JSBridge._event[e].length; r++)
              if (t === window.JSBridge._event[e][r]) {
                window.JSBridge._event[e].splice(r, 1);
                break;
              }
          } else delete window.JSBridge._event[e];
        else window.JSBridge._event = {};
        return this;
      },
      emit: function (e, t) {
        return (
          window.JSBridge._event[e] &&
            window.JSBridge._event[e].forEach(function (e) {
              e(t);
            }),
          this
        );
      },
      _requestHybrid: function (t) {
        var r = this;
        if ((console.log("客户端入参：", t), t.callback)) {
          var e = Date.now(),
            n =
              t.callbackName ||
              "token_" + e + "_" + Math.floor(1e4 * Math.random());
          i[n] = e;
          try {
            for (var o = window.self; o !== o.parent; )
              (n = "__iframe-" + n), (o = o.parent);
          } catch (e) {}
          (this._callback[n] = function (e) {
            t.callback(e), delete r._callback[n];
          }),
            (t._token = n);
        }
        this._postToNative(this._getUrlByParams(t));
      },
      _getUrlByParams: function (e) {
        var t = "";
        return (
          (t += "native://" + e.method + "?"),
          e.data &&
            ("object" == typeof e.data && (e.data = JSON.stringify(e.data)),
            (t += "data=" + encodeURIComponent(e.data) + "&")),
          (t += "callback=" + e._token)
        );
      },
      _postToNative: function (e) {
        var t = document.createElement("iframe");
        (t.src = e),
          (t.style.display = "none"),
          document.documentElement.appendChild(t),
          document.documentElement.removeChild(t),
          (t = null);
      },
      _callback: {},
      _event: {},
    }),
      window.addEventListener(
        "message",
        function (e) {
          if (e.data && e.data.xmmpMessage) {
            var t = e.data.xmmpMessage.token,
              r = e.data.xmmpMessage.response,
              n = e.data.xmmpMessage.tokenParseCount || 0;
            window.JSBridge.onSuccess(t, r, n);
          }
        },
        !1
      );
  }
})(window);
var support = {
  searchParams: "URLSearchParams" in self,
  iterable: "Symbol" in self && "iterator" in Symbol,
  blob:
    "FileReader" in self &&
    "Blob" in self &&
    (function () {
      try {
        return new Blob(), !0;
      } catch (e) {
        return !1;
      }
    })(),
  formData: "FormData" in self,
  arrayBuffer: "ArrayBuffer" in self,
};
function isDataView(e) {
  return e && DataView.prototype.isPrototypeOf(e);
}
if (support.arrayBuffer)
  var viewClasses = [
      "[object Int8Array]",
      "[object Uint8Array]",
      "[object Uint8ClampedArray]",
      "[object Int16Array]",
      "[object Uint16Array]",
      "[object Int32Array]",
      "[object Uint32Array]",
      "[object Float32Array]",
      "[object Float64Array]",
    ],
    isArrayBufferView =
      ArrayBuffer.isView ||
      function (e) {
        return e && -1 < viewClasses.indexOf(Object.prototype.toString.call(e));
      };
function normalizeName(e) {
  if (
    ("string" != typeof e && (e = String(e)),
    /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(e) || "" === e)
  )
    throw new TypeError("Invalid character in header field name");
  return e.toLowerCase();
}
function normalizeValue(e) {
  return "string" != typeof e && (e = String(e)), e;
}
function iteratorFor(t) {
  var e = {
    next: function () {
      var e = t.shift();
      return { done: void 0 === e, value: e };
    },
  };
  return (
    support.iterable &&
      (e[Symbol.iterator] = function () {
        return e;
      }),
    e
  );
}
function Headers(t) {
  (this.map = {}),
    t instanceof Headers
      ? t.forEach(function (e, t) {
          this.append(t, e);
        }, this)
      : Array.isArray(t)
      ? t.forEach(function (e) {
          this.append(e[0], e[1]);
        }, this)
      : t &&
        Object.getOwnPropertyNames(t).forEach(function (e) {
          this.append(e, t[e]);
        }, this);
}
function consumed(e) {
  if (e.bodyUsed) return Promise.reject(new TypeError("Already read"));
  e.bodyUsed = !0;
}
function fileReaderReady(r) {
  return new Promise(function (e, t) {
    (r.onload = function () {
      e(r.result);
    }),
      (r.onerror = function () {
        t(r.error);
      });
  });
}
function readBlobAsArrayBuffer(e) {
  var t = new FileReader(),
    r = fileReaderReady(t);
  return t.readAsArrayBuffer(e), r;
}
function readBlobAsText(e) {
  var t = new FileReader(),
    r = fileReaderReady(t);
  return t.readAsText(e), r;
}
function readArrayBufferAsText(e) {
  for (
    var t = new Uint8Array(e), r = new Array(t.length), n = 0;
    n < t.length;
    n++
  )
    r[n] = String.fromCharCode(t[n]);
  return r.join("");
}
function bufferClone(e) {
  if (e.slice) return e.slice(0);
  var t = new Uint8Array(e.byteLength);
  return t.set(new Uint8Array(e)), t.buffer;
}
function Body() {
  return (
    (this.bodyUsed = !1),
    (this._initBody = function (e) {
      (this._bodyInit = e)
        ? "string" == typeof e
          ? (this._bodyText = e)
          : support.blob && Blob.prototype.isPrototypeOf(e)
          ? (this._bodyBlob = e)
          : support.formData && FormData.prototype.isPrototypeOf(e)
          ? (this._bodyFormData = e)
          : support.searchParams && URLSearchParams.prototype.isPrototypeOf(e)
          ? (this._bodyText = e.toString())
          : support.arrayBuffer && support.blob && isDataView(e)
          ? ((this._bodyArrayBuffer = bufferClone(e.buffer)),
            (this._bodyInit = new Blob([this._bodyArrayBuffer])))
          : support.arrayBuffer &&
            (ArrayBuffer.prototype.isPrototypeOf(e) || isArrayBufferView(e))
          ? (this._bodyArrayBuffer = bufferClone(e))
          : (this._bodyText = e = Object.prototype.toString.call(e))
        : (this._bodyText = ""),
        this.headers.get("content-type") ||
          ("string" == typeof e
            ? this.headers.set("content-type", "text/plain;charset=UTF-8")
            : this._bodyBlob && this._bodyBlob.type
            ? this.headers.set("content-type", this._bodyBlob.type)
            : support.searchParams &&
              URLSearchParams.prototype.isPrototypeOf(e) &&
              this.headers.set(
                "content-type",
                "application/x-www-form-urlencoded;charset=UTF-8"
              ));
    }),
    support.blob &&
      ((this.blob = function () {
        var e = consumed(this);
        if (e) return e;
        if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
        if (this._bodyArrayBuffer)
          return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        if (this._bodyFormData)
          throw new Error("could not read FormData body as blob");
        return Promise.resolve(new Blob([this._bodyText]));
      }),
      (this.arrayBuffer = function () {
        return this._bodyArrayBuffer
          ? consumed(this) || Promise.resolve(this._bodyArrayBuffer)
          : this.blob().then(readBlobAsArrayBuffer);
      })),
    (this.text = function () {
      var e = consumed(this);
      if (e) return e;
      if (this._bodyBlob) return readBlobAsText(this._bodyBlob);
      if (this._bodyArrayBuffer)
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      if (this._bodyFormData)
        throw new Error("could not read FormData body as text");
      return Promise.resolve(this._bodyText);
    }),
    support.formData &&
      (this.formData = function () {
        return this.text().then(decode);
      }),
    (this.json = function () {
      return this.text().then(JSON.parse);
    }),
    this
  );
}
(Headers.prototype.append = function (e, t) {
  (e = normalizeName(e)), (t = normalizeValue(t));
  var r = this.map[e];
  this.map[e] = r ? r + ", " + t : t;
}),
  (Headers.prototype.delete = function (e) {
    delete this.map[normalizeName(e)];
  }),
  (Headers.prototype.get = function (e) {
    return (e = normalizeName(e)), this.has(e) ? this.map[e] : null;
  }),
  (Headers.prototype.has = function (e) {
    return this.map.hasOwnProperty(normalizeName(e));
  }),
  (Headers.prototype.set = function (e, t) {
    this.map[normalizeName(e)] = normalizeValue(t);
  }),
  (Headers.prototype.forEach = function (e, t) {
    for (var r in this.map)
      this.map.hasOwnProperty(r) && e.call(t, this.map[r], r, this);
  }),
  (Headers.prototype.keys = function () {
    var r = [];
    return (
      this.forEach(function (e, t) {
        r.push(t);
      }),
      iteratorFor(r)
    );
  }),
  (Headers.prototype.values = function () {
    var t = [];
    return (
      this.forEach(function (e) {
        t.push(e);
      }),
      iteratorFor(t)
    );
  }),
  (Headers.prototype.entries = function () {
    var r = [];
    return (
      this.forEach(function (e, t) {
        r.push([t, e]);
      }),
      iteratorFor(r)
    );
  }),
  support.iterable &&
    (Headers.prototype[Symbol.iterator] = Headers.prototype.entries);
var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
function normalizeMethod(e) {
  var t = e.toUpperCase();
  return -1 < methods.indexOf(t) ? t : e;
}
function Request(e, t) {
  var r = (t = t || {}).body;
  if (e instanceof Request) {
    if (e.bodyUsed) throw new TypeError("Already read");
    (this.url = e.url),
      (this.credentials = e.credentials),
      t.headers || (this.headers = new Headers(e.headers)),
      (this.method = e.method),
      (this.mode = e.mode),
      (this.signal = e.signal),
      r || null == e._bodyInit || ((r = e._bodyInit), (e.bodyUsed = !0));
  } else this.url = String(e);
  if (
    ((this.credentials = t.credentials || this.credentials || "same-origin"),
    (!t.headers && this.headers) || (this.headers = new Headers(t.headers)),
    (this.method = normalizeMethod(t.method || this.method || "GET")),
    (this.mode = t.mode || this.mode || null),
    (this.signal = t.signal || this.signal),
    (this.referrer = null),
    ("GET" === this.method || "HEAD" === this.method) && r)
  )
    throw new TypeError("Body not allowed for GET or HEAD requests");
  this._initBody(r);
}
function decode(e) {
  var o = new FormData();
  return (
    e
      .trim()
      .split("&")
      .forEach(function (e) {
        if (e) {
          var t = e.split("="),
            r = t.shift().replace(/\+/g, " "),
            n = t.join("=").replace(/\+/g, " ");
          o.append(decodeURIComponent(r), decodeURIComponent(n));
        }
      }),
    o
  );
}
function parseHeaders(e) {
  var o = new Headers();
  return (
    e
      .replace(/\r?\n[\t ]+/g, " ")
      .split(/\r?\n/)
      .forEach(function (e) {
        var t = e.split(":"),
          r = t.shift().trim();
        if (r) {
          var n = t.join(":").trim();
          o.append(r, n);
        }
      }),
    o
  );
}
function Response(e, t) {
  (t = t || {}),
    (this.type = "default"),
    (this.status = void 0 === t.status ? 200 : t.status),
    (this.ok = 200 <= this.status && this.status < 300),
    (this.statusText = "statusText" in t ? t.statusText : "OK"),
    (this.headers = new Headers(t.headers)),
    (this.url = t.url || ""),
    this._initBody(e);
}
(Request.prototype.clone = function () {
  return new Request(this, { body: this._bodyInit });
}),
  Body.call(Request.prototype),
  Body.call(Response.prototype),
  (Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url,
    });
  }),
  (Response.error = function () {
    var e = new Response(null, { status: 0, statusText: "" });
    return (e.type = "error"), e;
  });
var redirectStatuses = [301, 302, 303, 307, 308];
Response.redirect = function (e, t) {
  if (-1 === redirectStatuses.indexOf(t))
    throw new RangeError("Invalid status code");
  return new Response(null, { status: t, headers: { location: e } });
};
var DOMException = self.DOMException;
try {
  new DOMException();
} catch (e) {
  ((DOMException = function (e, t) {
    (this.message = e), (this.name = t);
    var r = Error(e);
    this.stack = r.stack;
  }).prototype = Object.create(Error.prototype)),
    (DOMException.prototype.constructor = DOMException);
}
(self.Headers = Headers),
  (self.Request = Request),
  (self.Response = Response),
  (function (e, t) {
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = t())
      : "function" == typeof define && define.amd
      ? define(t)
      : (e.xm = t());
  })(window, function () {
    "use strict";
    var l = JSBridge.native,
      n = JSBridge.on,
      r = JSBridge.emit,
      o = JSBridge.once,
      i = JSBridge.off,
      f = {
        canIUse: "checkmethod",
        emit: !0,
        emitParent: "callparentjs",
        off: !0,
        on: !0,
        once: !0,
        pageScrollTo: !0,
        setEnableDebug: !0,
        setNavigationBarTitle: !0,
        showExceptionTip: "showexceptiontip",
        sourceCheck: "sourceCheck",
        getSystemInfo: "getSystemInfo",
        getAppVersion: "getversion",
        getAppInfo: "getAppInfo",
        getAppConfig: "getappconfig",
        log: "log",
        logToServer: "logToServer",
        isLogin: "islogin",
        chooseImage: "selectpic",
        previewImages: "previewimages",
        cancelRecord: "cancelRecord",
        pauseRecord: "pauseRecord",
        resumeRecord: "resumeRecord",
        startRecord: "startRecord",
        stopRecord: "stopRecord",
        playAudio: "playAudio",
        pauseAudio: "pauseAudio",
        resumeAudio: "resumeAudio",
        stopAudio: "stopAudio",
        playMedia: "playMedia",
        recordVideo: "recordVideo",
        openVC: "openvc",
        navigateBack: "navigateBack",
        navigateTo: "openurl",
        openApp: "openapp",
        openExternal: "openExternal",
        redirectTo: "locate",
        hideLoading: "hideLoading",
        showAlert: "alert",
        showConfirm: "confirm",
        showLoading: "showLoading",
        showModal: "modal",
        showPrompt: "prompt",
        showToast: "toast",
        picker: "picker",
        selectDate: "selectdate",
        showActionSheet: "actionsheet",
        request: "request",
        fetch: !0,
        clearStorage: "clearStorage",
        getStorage: "getStorage",
        removeStorage: "removeStorage",
        setStorage: "setStorage",
        createTable: "createTable",
        tableSelect: "select",
        tableUpdate: "update",
        tableDelete: "delete",
        tableInsert: "insert",
        getLocation: "getlocation",
        chooseFile: "savefile",
        downloadFile: "downloadFile",
        uploadFile: "uploadFile",
        openFile: "openfile",
        connectWifi: "connectwifi",
        getCurrentWifi: "currentwifi",
        getWifiList: "availablewifilist",
        isWifi: "iswifi",
        openBluetoothAdapter: "openBluetoothAdapter",
        closeBluetoothAdapter: "closeBluetoothAdapter",
        getBluetoothAdapterState: "getBluetoothAdapterState",
        startBluetoothDevicesDiscovery: "startBluetoothDevicesDiscovery",
        stopBluetoothDevicesDiscovery: "stopBluetoothDevicesDiscovery",
        getBluetoothDevices: "getBluetoothDevices",
        getConnectedDevices: "getConnectedDevices",
        createBLEConnection: "createBLEConnection",
        closeBLEConnection: "closeBLEConnection",
        getBLEDeviceServices: "getBLEDeviceServices",
        getBLEDeviceCharacteristics: "getBLEDeviceCharacteristics",
        readBLECharacteristicValue: "readBLECharacteristicValue",
        writeBLECharacteristicValue: "writeBLECharacteristicValue",
        notifyBLECharacteristicValueChange:
          "notifyBLECharacteristicValueChange",
        scanCode: "camerascan",
        horizontalScreen: "horizontalScreen",
        makePhoneCall: "makePhoneCall",
        annotate: "annotate",
        share: "share",
        shareCard: "sharecard",
        shareLink: "sharelink",
        getCurrentOrgInfo: "getCurrentOrgInfo",
        getLoginUserInfo: "getLoginUserInfo",
        getUserInfo: "getUserInfo",
        getOrgList: "getorglist",
        getToken: "getToken",
        selectDepartments: "selectdepartments",
        selectMembers: "selectmembers",
        writeMail: "writeMail",
        getAuthCode: "gethwssostring",
        uploadFileToCloudDriver: "uploadFileToCloudDriver",
        openCloudDriverFile: "openCloudDriverFile",
        chooseCloudDriverFile: "chooseCloudDriverFile",
        startTrail: "starttrail",
        stopTrail: "stoptrail",
      };
    function t(t) {
      window.requestAnimationFrame ||
        (window.requestAnimationFrame = function (e, t) {
          return setTimeout(e, 17);
        });
      var r = document.documentElement.scrollTop || document.body.scrollTop,
        n = function () {
          var e = t - r;
          (r += e / 5),
            Math.abs(e) < 1
              ? window.scrollTo(0, t)
              : (window.scrollTo(0, r), requestAnimationFrame(n));
        };
      n();
    }
    function a(e) {
      return Object.prototype.toString.call(e).match(/^\[object\s(.*)\]$/)[1];
    }
    function s(e, t, r, n) {
      var o = (function (t, e, n) {
          function r(r) {
            return n
              ? r
              : new Promise(function (e, t) {
                  t(r);
                });
          }
          if (!t) return r("请填写入参");
          var o = e
            .map(function (e) {
              return void 0 === t[e] ? e : "";
            })
            .filter(function (e) {
              return e;
            });
          if (o.length) return r("入参缺少必填项：" + o.join(","));
          return !0;
        })(e, t, n),
        i = (function (e, t) {
          var r = !1,
            n = "";
          for (var o in t) {
            var i = a(e[o]);
            if (-1 === t[o].toString().indexOf(i)) {
              (r = !0), (n = o);
              break;
            }
          }
          if (r)
            return new Promise(function (e, t) {
              t("入参格式错误：" + n);
            });
          return !0;
        })(e, r);
      return !0 !== o ? o : !0 === i || i;
    }
    function p(s) {
      var c = "shinemosdk://" + s + "/",
        u = 0;
      return Promise.all(
        [
          { type: "script", file: "index.js" },
          { type: "link", file: "index.css" },
        ].map(function (a) {
          return new Promise(function (e) {
            function t() {
              var e;
              2 === u &&
                ((e = s),
                window._VmCenter &&
                  window._VmCenter[e] &&
                  window._VmCenter[e].reload &&
                  window._VmCenter[e].reload());
            }
            var r = Date.now(),
              n = document.createElement(a.type);
            if ("script" === a.type) {
              var o = document.getElementById("J_" + s);
              o && o.parentNode.removeChild(o),
                (n.id = "J_" + s),
                (n.src = c + a.file + "?t=" + r),
                (n.async = !0),
                (n.defer = !0);
            } else if ("link" === a.type) {
              var i = document.getElementById("C_" + s);
              i && i.parentNode.removeChild(i),
                (n.id = "C_" + s),
                (n.href = c + a.file + "?t=" + r),
                (n.rel = "stylesheet");
            }
            document.head.appendChild(n),
              (n.onload = function () {
                e(s), (n.onerror = n.onload = null), ++u, t();
              }),
              (n.onerror = function () {
                e(!1), (n.onerror = n.onload = null);
              });
          });
        })
      ).then(function (e) {
        return (
          !!e.filter(function (e) {
            return e;
          }).length && s
        );
      });
    }
    function e() {
      return new Promise(function (t) {
        l("getAuthedCardIds").then(function (e) {
          t(e);
        });
      });
    }
    var c = {
      version: "2.0.46",
      native: l,
      getAuthedCardIds: e,
      isInNative: function () {
        return (
          -1 < window.navigator.userAgent.toLowerCase().indexOf("hwminiapp")
        );
      },
      canIUse: function (e) {
        var t = s(e, ["api"], { api: ["String", "Array"] });
        if (!0 !== t) return t;
        var r,
          n = "String" === a(e.api);
        return (
          n && (e.api = [e.api]),
          (r = e.api.map(function (e) {
            return f[e.split(".").slice(1).join(".")];
          })),
          l(f.canIUse, { method: r }).then(function (e) {
            return n ? e[0] : e;
          })
        );
      },
      emit: function (e, t) {
        e && r(e, t);
      },
      emitParent: function (e, t) {
        e && l(f.emitParent, { callbackId: e, data: t });
      },
      off: function (e, t) {
        i(e, t);
      },
      on: function (e, t) {
        e && t && n(e, t);
      },
      once: function (e, t) {
        e && t && o(e, t);
      },
      pageScrollTo: function (e) {
        if ((e.duration || (e.duration = 300), void 0 !== e.scrollTop))
          t(e.scrollTop, e.duration);
        else if (e.selector) {
          if (void 0 === window.getComputedStyle(document.body).scrollBehavior)
            t(
              document.querySelector(e.selector).getBoundingClientRect().top,
              e.duration
            );
          else
            document
              .querySelector(e.selector)
              .scrollIntoView({ behavior: "smooth" });
        }
      },
      setEnableDebug: function (e) {
        e.enableDebug && window.VConsole && !window.__VConsole
          ? (window.__VConsole = new VConsole())
          : !e.enableDebug &&
            window.__VConsole &&
            "Function" === a(window.__VConsole.destroy) &&
            (window.__VConsole.destroy(), (window.__VConsole = null));
      },
      setNavigationBarTitle: function (e) {
        var t = s(e, ["title"], { title: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        document.title = e.title;
      },
      showExceptionTip: function (e) {
        if (document.getElementById("__vconsole"))
          return l(f.showToast, { msg: "exception:" + e.msg });
        l(f.showExceptionTip, e);
      },
      sourceCheck: function (c) {
        console.log("开始加载卡片:", Date.now());
        var t = {},
          u = ["20000", "25000", "25001", "25002"],
          d = [];
        return (
          c.componentNames.forEach(function (e) {
            (e = e.toString()),
              t[e] || ((t[e] = 1), d.push(e.split("-").pop()));
          }),
          new Promise(function (s) {
            e().then(function (e) {
              var t = {},
                r = [];
              e.forEach(function (e) {
                t[e] = 1;
              }),
                d.forEach(function (e) {
                  t[e] && r.push(e);
                }),
                (c.ids = [].concat(u).concat(r));
              for (var n = [], o = 0; o < Math.ceil(r.length / 5); o++)
                n.push(r.slice(5 * o, 5 * (o + 1)));
              function i(e) {
                return e.reduce(function (e, t) {
                  return e.then(function () {
                    return Promise.all(t.map(p));
                  });
                }, Promise.resolve());
              }
              var a = function (n) {
                if (!n.length) return console.log("加载完成:", Date.now()), s();
                var o = n.shift();
                l(f.sourceCheck, { ids: o }).then(function (e) {
                  var t = [];
                  if (e)
                    for (var r in e)
                      e[r].loaded &&
                        e[r].updated &&
                        -1 === u.indexOf(r) &&
                        t.push(r);
                  t.length && i([o]), a(n);
                });
              };
              l(f.sourceCheck, { ids: u }),
                a([].concat(n)),
                i([].concat(n)).then(function () {
                  console.log("默认加载完成:", Date.now());
                });
            });
          })
        );
      },
      getSystemInfo: function () {
        return l(f.getSystemInfo);
      },
      getAppVersion: function () {
        return l(f.getAppVersion);
      },
      getAppInfo: function () {
        return l(f.getAppInfo);
      },
      getAppConfig: function () {
        return l(f.getAppConfig);
      },
      log: function (e) {
        var t = s(e, ["content"], { content: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        e.type || (e.type = "i"), l(f.log, e);
      },
      logToServer: function (e) {
        var t = s(e, ["mid", "eid"], { mid: "String", eid: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        l(f.logToServer, e);
      },
      isLogin: function () {
        return l(f.isLogin);
      },
      chooseImage: function (e) {
        return (
          e.count && (e.max = e.count),
          e.selectType || (e.selectType = 0),
          e.needExif || (e.needExif = 0),
          e.needBase64 || (e.needBase64 = 0),
          l(f.chooseImage, e)
        );
      },
      previewImages: function (e) {
        var t = s(e, ["urls"], { urls: "Array" }, !0);
        if (!0 !== t) throw new Error(t);
        (e.position = e.current || 0), l(f.previewImages, e);
      },
      cancelRecord: function () {
        return l(f.cancelRecord);
      },
      pauseRecord: function () {
        return l(f.pauseRecord);
      },
      resumeRecord: function () {
        return l(f.resumeRecord);
      },
      startRecord: function (e) {
        return (
          e && e.onError && n("onStartRecordError", e.onError),
          l(f.startRecord, e)
        );
      },
      stopRecord: function () {
        return l(f.stopRecord);
      },
      playAudio: function (e) {
        var t = s(e, ["url"], { url: "String" });
        return !0 !== t ? t : l(f.playAudio, e);
      },
      pauseAudio: function () {
        return l(f.pauseAudio);
      },
      resumeAudio: function () {
        return l(f.resumeAudio);
      },
      stopAudio: function () {
        return l(f.stopAudio);
      },
      playMedia: function (e) {
        var t = s(e, ["url"], { url: "String" });
        return !0 !== t ? t : l(f.playMedia, e);
      },
      recordVideo: function (e) {
        return e && e.max && 60 < e.max && (e.max = 60), l(f.recordVideo, e);
      },
      openVC: function (e) {
        var t = s(e, ["DEVICE_CODE"], { DEVICE_CODE: "String" });
        if (!0 !== t) return t;
        l(f.openVC, e);
      },
      navigateBack: function (e) {
        l(f.navigateBack, e);
      },
      navigateTo: function (t) {
        var e = s(t, ["url"], { url: "String" }, !0);
        if (!0 !== e) throw new Error(e);
        if (t.events) {
          for (var r in t.events) n(r, t.events[r]);
          o("onPageShow", function () {
            for (var e in t.events) i(e, t.events[e]);
          });
        }
        return l(f.navigateTo, t);
      },
      openApp: function (e) {
        var t = s(e, ["appid"], { appid: ["Number", "String"] }, !0);
        if (!0 !== t) throw new Error(t);
        if (e.param) {
          var r = [];
          for (var n in e.param) r.push(n + "=" + e.param[n]);
          e.param = r.join("&");
        }
        return l(f.openApp, e);
      },
      openExternal: function (e) {
        var t = s(e, ["url"], { url: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        return l(f.openExternal, e);
      },
      redirectTo: function (e) {
        var t = s(e, ["url"], { url: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        return (e.name = e.url), l(f.redirectTo, e);
      },
      hideLoading: function () {
        l(f.hideLoading);
      },
      showAlert: function (e) {
        var t = s(
          e,
          ["title", "message"],
          { title: "String", message: "String" },
          !0
        );
        if (!0 !== t) throw new Error(t);
        (e.msg = e.message), l(f.showAlert, e);
      },
      showConfirm: function (e) {
        var t = s(e, ["title", "message"], {
          title: "String",
          message: "String",
        });
        return !0 !== t ? t : ((e.msg = e.message), l(f.showConfirm, e));
      },
      showLoading: function () {
        l(f.showLoading);
      },
      showModal: function (e) {
        var t = s(
          e,
          ["title", "img", "message"],
          { message: "String", title: "String", img: "String" },
          !0
        );
        if (!0 !== t) throw new Error(t);
        (e.msg = e.message), l(f.showModal, e);
      },
      showPrompt: function (e) {
        var t = s(e, ["title", "message"], {
          title: "String",
          message: "String",
        });
        return !0 !== t ? t : ((e.msg = e.message), l(f.showPrompt, e));
      },
      showToast: function (e) {
        var t = s(e, ["message"], { message: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        (e.msg = e.message), l(f.showToast, e);
      },
      picker: function (e) {
        var t = s(e, ["title", "list"], { title: "String", list: "Array" });
        return !0 !== t ? t : l(f.picker, e);
      },
      selectDate: function (e) {
        return l(f.selectDate, e);
      },
      showActionSheet: function (e) {
        var t = s(e, ["title", "itemList"], {
          title: "String",
          itemList: "Array",
        });
        return !0 !== t
          ? t
          : ((e.list = e.itemList),
            (e.highlight = e.defaultValue),
            l(f.showActionSheet, e));
      },
      request: function (e) {
        var t = s(e, ["url"], { url: "String" });
        if (!0 !== t) return t;
        if (
          (!e.method || "GET" === e.method.toUpperCase()) &&
          "string" != typeof e.data
        ) {
          var r = "";
          for (var n in e.data) r += "&" + n + "=" + e.data[n];
          var o = -1 < e.url.indexOf("?") ? "&" : "?";
          e.url += o + r.substr(1);
        }
        return l(f.request, e).then(function (e) {
          var t = e.body;
          try {
            t = JSON.parse(t);
          } catch (e) {}
          return t;
        });
      },
      fetch: function (e, i) {
        return (
          i || "Object" !== a(e) || (e = i.url),
          e && "String" === a(e)
            ? ((i.url = e),
              (i.data = i.body),
              (i.withCredentials = i.credentials),
              new Promise(function (n, o) {
                l(f.request, i).then(function (e) {
                  var t = {
                      status: e.status,
                      statusText: e.statusText,
                      headers: parseHeaders(e.headers || ""),
                      ok: e.ok,
                      url: i.url,
                    },
                    r = new Response(e.body, t);
                  (r.ok ? n : o)(r);
                });
              }))
            : new Promise(function (e, t) {
                t("url不能为空");
              })
        );
      },
      isOnline: function () {
        return window.navigator.onLine;
      },
      clearStorage: function () {
        return l(f.clearStorage);
      },
      getStorage: function (e) {
        var t = s(e, ["key"], { key: "String" });
        return !0 !== t ? t : l(f.getStorage, e);
      },
      removeStorage: function (e) {
        var t = s(e, ["key"], { key: "String" });
        return !0 !== t ? t : l(f.removeStorage, e);
      },
      setStorage: function (e) {
        var t = s(e, ["key", "value"], { key: "String", value: "String" });
        return !0 !== t ? t : l(f.setStorage, e);
      },
      createTable: function (e) {
        var t = s(e, ["tableName", "columnList"], {
          tableName: "String",
          columnList: "Array",
        });
        return !0 !== t ? t : l(f.createTable, e);
      },
      tableSelect: function (e) {
        var t = s(e, ["tableName", "condition"], {
          tableName: "String",
          condition: "String",
        });
        return !0 !== t ? t : l(f.tableSelect, e);
      },
      tableUpdate: function (e) {
        var t = s(e, ["tableName", "condition"], {
          tableName: "String",
          condition: "String",
        });
        return !0 !== t ? t : l(f.tableUpdate, e);
      },
      tableDelete: function (e) {
        var t = s(e, ["tableName", "condition"], {
          tableName: "String",
          condition: "String",
        });
        return !0 !== t ? t : l(f.tableDelete, e);
      },
      tableInsert: function (e) {
        var t = s(e, ["tableName", "list"], {
          tableName: "String",
          list: "Array",
        });
        return !0 !== t ? t : l(f.tableInsert, e);
      },
      getLocation: function (e) {
        return (
          e &&
            ((e.sdk = e.sdk || 0),
            (e.location = e.sdk || 0),
            (e.timeout = parseInt((e.timeout || 3e4) / 1e3))),
          l(f.getLocation, e)
        );
      },
      openFile: function (e) {
        var t = s(e, ["fileName"], { fileName: "String" }, !0);
        if (!0 !== t) throw new Error(t);
        if (!e.path && !e.url) throw new Error("入参缺少必填项：path或者url");
        l(f.openFile, e);
      },
      chooseFile: function (e) {
        return l(f.chooseFile, e);
      },
      downloadFile: function (e) {
        var t = s(e, ["url", "filePath"], {
          url: "String",
          filePath: "String",
        });
        return !0 !== t ? t : l(f.downloadFile, e);
      },
      uploadFile: function (e) {
        var t = s(e, ["url", "filePath"], {
          url: "String",
          filePath: "String",
        });
        return !0 !== t ? t : l(f.uploadFile, e);
      },
      connectWifi: function (e) {
        var t = s(e, ["ssid", "mac", "password", "capabilities"], {
          ssid: "String",
          mac: "String",
          password: "String",
          capabilities: "String",
        });
        return !0 !== t ? t : l(f.connectWifi, e);
      },
      getCurrentWifi: function () {
        return l(f.getCurrentWifi);
      },
      getWifiList: function () {
        return l(f.getWifiList);
      },
      isWifi: function () {
        return l(f.isWifi).then(function (e) {
          return 1 === e;
        });
      },
      openBluetoothAdapter: function () {
        return l(f.openBluetoothAdapter);
      },
      closeBluetoothAdapter: function () {
        return l(f.closeBluetoothAdapter);
      },
      getBluetoothAdapterState: function () {
        return l(f.getBluetoothAdapterState);
      },
      startBluetoothDevicesDiscovery: function (e) {
        return l(f.startBluetoothDevicesDiscovery, e);
      },
      stopBluetoothDevicesDiscovery: function () {
        return l(f.stopBluetoothDevicesDiscovery);
      },
      getBluetoothDevices: function () {
        return l(f.getBluetoothDevices);
      },
      getConnectedDevices: function () {
        return l(f.getConnectedDevices);
      },
      createBLEConnection: function (e) {
        var t = s(e, ["deviceId"], { deviceId: "String" });
        return !0 !== t ? t : l(f.createBLEConnection, e);
      },
      closeBLEConnection: function (e) {
        var t = s(e, ["deviceId"], { deviceId: "String" });
        return !0 !== t ? t : l(f.closeBLEConnection, e);
      },
      getBLEDeviceServices: function (e) {
        var t = s(e, ["deviceId"], { deviceId: "String" });
        return !0 !== t ? t : l(f.getBLEDeviceServices, e);
      },
      getBLEDeviceCharacteristics: function (e) {
        var t = s(e, ["deviceId", "serviceId"], {
          deviceId: "String",
          serviceId: "String",
        });
        return !0 !== t ? t : l(f.getBLEDeviceCharacteristics, e);
      },
      readBLECharacteristicValue: function (e) {
        var t = s(e, ["deviceId", "serviceId", "characteristicId"], {
          deviceId: "String",
          serviceId: "String",
          characteristicId: "String",
        });
        return !0 !== t ? t : l(f.readBLECharacteristicValue, e);
      },
      writeBLECharacteristicValue: function (e) {
        var t = s(e, ["deviceId", "serviceId", "characteristicId", "value"], {
          deviceId: "String",
          serviceId: "String",
          characteristicId: "String",
          value: "String",
        });
        return !0 !== t ? t : l(f.writeBLECharacteristicValue, e);
      },
      notifyBLECharacteristicValueChange: function (e) {
        var t = s(e, ["deviceId", "serviceId", "characteristicId", "state"], {
          deviceId: "String",
          serviceId: "String",
          characteristicId: "String",
          state: "Boolean",
        });
        return !0 !== t ? t : l(f.notifyBLECharacteristicValueChange, e);
      },
      scanCode: function () {
        return l(f.scanCode);
      },
      horizontalScreen: function () {
        l(f.horizontalScreen);
      },
      makePhoneCall: function (e) {
        l(f.makePhoneCall, e);
      },
      annotate: function (t) {
        return l(f.annotate, (t = t || {})).then(function (e) {
          return t.upload ? e : "data:image/png;base64," + e;
        });
      },
      share: function (e) {
        var t = s(e, ["logo", "title", "description"], {
          logo: "String",
          title: "String",
          description: "String",
        });
        return !0 !== t ? t : l(f.share, e);
      },
      shareLink: function (e) {
        var t = s(e, ["pic", "title", "desc", "link"], {
          pic: "String",
          title: "String",
          desc: "String",
          link: "String",
        });
        return !0 !== t ? t : l(f.shareLink, e);
      },
      getCurrentOrgInfo: function () {
        return l(f.getCurrentOrgInfo);
      },
      getLoginUserInfo: function () {
        return l(f.getLoginUserInfo, { needLogin: !0 });
      },
      getUserInfo: function (e) {
        var t = s(e, ["uid"], { uid: "String" });
        return !0 !== t ? t : l(f.getUserInfo, e);
      },
      getOrgList: function () {
        return l(f.getOrgList);
      },
      getToken: function () {
        return l(f.getToken, { needLogin: !0 });
      },
      getAuthCode: function (e) {
        return ((e = e || {}).needLogin = !0), l(f.getAuthCode, e);
      },
      getHWSSOString: function () {
        return (
          console.info(
            "废弃通知：getHWSSOString即将废弃，请使用getAuthCode代替，请注意返回值的变化"
          ),
          l(f.getAuthCode).then(function (e) {
            return "string" == typeof e ? { encryptedString: e } : e;
          })
        );
      },
      selectDepartments: function (e) {
        var t = s(e, ["orgId"], { orgId: "String" });
        return !0 !== t
          ? t
          : ((e.orgid = e.orgId), delete e.orgId, l(f.selectDepartments, e));
      },
      selectMembers: function (e) {
        return (
          e.orgId && ((e.orgid = e.orgId), delete e.orgId),
          e.count || (e.count = 500),
          l(f.selectMembers, e)
        );
      },
      writeMail: function (e) {
        return l(f.writeMail, e);
      },
      uploadFileToCloudDriver: function (e) {
        var t = s(e, ["filePath"], { filePath: "String" });
        return !0 !== t
          ? t
          : (void 0 === e.chooseUploadPath && (e.chooseUploadPath = !0),
            l(f.uploadFileToCloudDriver, e));
      },
      openCloudDriverFile: function (e) {
        l(f.openCloudDriverFile, e);
      },
      chooseCloudDriverFile: function () {
        return l(f.chooseCloudDriverFile);
      },
      startTrail: function (e) {
        return l(f.startTrail, e);
      },
      stopTrail: function () {
        l(f.stopTrail);
      },
    };
    return (
      l("sdkloaded"),
      window.document.addEventListener("DOMContentLoaded", function (e) {
        l("contentLoaded");
      }),
      c
    );
  }),
  window.addEventListener("load", function () {
    window.xm &&
      xm.native("performance", [
        {
          key: "whiteScreenTime",
          value:
            performance.timing.responseStart -
            performance.timing.navigationStart,
          name: "页面白屏时间",
          unit: "ms",
          description:
            "从打开webview到从服务器（或从本地缓存）收到第一个字节的时间",
        },
        {
          key: "avaliableTime",
          value: performance.now(),
          name: "页面可用时间",
          unit: "ms",
          description: "从打开webview到页面加载完成(onLoad事件)",
        },
      ]),
      window.xm &&
        xm.native("dotlog", {
          key: "LT",
          value: [location.href, performance.now()],
        });
  }),
  window.addEventListener(
    "error",
    function (e) {
      var t = e.target.localName;
      console.log("资源加载错误：", e),
        "link" === t
          ? window.xm &&
            xm.native("dotlog", {
              key: "RESOURCE#0",
              value: [location.href, e.target.href],
            })
          : "script" === t || "img" === t
          ? window.xm &&
            xm.native("dotlog", {
              key: "RESOURCE#0",
              value: [location.href, e.target.src],
            })
          : e.message &&
            window.xm &&
            xm.native("dotlog", {
              key: "JSERROR",
              value: [location.href, e.message],
            });
    },
    !0
  );
var isTv = /tv/.test(navigator.userAgent);
if (window.xm && isTv) {
  function paramToString(t) {
    return Object.keys(t)
      .map(function (e) {
        return e + "=" + encodeURIComponent(t[e]);
      })
      .join("&");
  }
  var pageMap = {
      red: {
        url: "index.html#/page/tv-create/page-1604471484664",
        title: "发起红灯",
      },
    },
    tv = {
      screenshot: function () {
        return new Promise(function (t, e) {
          window.xm.hideLoading(),
            window.xm
              .native("screenshot", {
                x: 0,
                y: 0,
                width: window.screen.width,
                height: window.screen.height,
              })
              .then(function (e) {
                window.xm.native("uploadimg", { base64: e }).then(function (e) {
                  t(e);
                });
              })
              .catch(function () {});
        });
      },
      createRed: function () {
        var e = this;
        window.xm.native("getsmallappinfo").then(function (t) {
          e.screenshot().then(function (e) {
            window.xm.native("openmodal", {
              title: pageMap.red.title,
              appId: 100001,
              width: 940,
              relativeUrl:
                pageMap.red.url +
                "?" +
                paramToString({ img: e, appName: t.name, appId: t.appId }),
            });
          });
        });
      },
      createUrge: function (r) {
        if (!r)
          return window.xm.showToast({
            message: "请传入参数，{ name, firstDepts, firstUsers }",
          });
        this.screenshot().then(function (t) {
          window.xm.getLoginUserInfo().then(function (e) {
            window.xm.openApp({
              appid: 51242895,
              relativeUrl:
                "index.html#/new?businessData=" +
                encodeURIComponent(
                  JSON.stringify(
                    Object.assign(
                      {
                        imgUrl: t,
                        majorName: e.name,
                        majorUid: String(e.uid),
                        firstDepts: [],
                        firstUsers: [],
                      },
                      r
                    )
                  )
                ),
            });
          });
        });
      },
      createMeeting: function () {
        window.xm.selectMembers({ count: 100 }).then(function (e) {
          window.xm.native("createvideomeeting", {
            uids: e.map(function (e) {
              return e.uid;
            }),
          });
        });
      },
      createAnnotate: function () {
        window.xm.native("annotate", { upload: !1 }).then(function (e) {
          window.xm.native("shareimg", { base64: e });
        });
      },
    };
  Object.assign(window.xm, tv);
}
