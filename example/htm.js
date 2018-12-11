var t = {},
    e = document.createElement("template"),
    r = /(\$_h\[\d+\])/g;function n(t, e) {
  var n = t.match(r),
      a = JSON.stringify(t);if (null != n) {
    if (n[0] === t) return t;a = a.replace(r, '"' + e + "$1" + e + '"').replace(/"[+,]"/g, ""), "," == e && (a = "[" + a + "]");
  }return a;
}export default function (r) {
  return (t[r] || (t[r] = function (t) {
    for (var r = t[0], a = 1; a < t.length;) r += "$_h[" + a + "]" + t[a++];return e.innerHTML = r.replace(/<(?:(\/)\/|(\/?)(\$_h\[\d+\]))/g, "<$1$2c c@=$3").replace(/<([\w:-]+)(?:\s[^<>]*?)?(\/?)>/g, function (t, e, r) {
      return t.replace(/(?:'.*?'|".*?"|([A-Z]))/g, function (t, e) {
        return e ? ":::" + e : t;
      }) + (r ? "</" + e + ">" : "");
    }).trim(), Function("h", "$_h", "return " + function t(e) {
      if (1 != e.nodeType) return 3 == e.nodeType && e.data ? n(e.data, ",") : "null";for (var r = "", a = n(e.localName, r), i = "", u = ",({", c = 0; c < e.attributes.length; c++) {
        var l = e.attributes[c].name,
            o = e.attributes[c].value;"c@" == l ? a = o : "..." == l.substring(0, 3) ? (i = "", u = ",Object.assign({", r += "}," + l.substring(3) + ",{") : (r += i + '"' + l.replace(/:::(\w)/g, function (t, e) {
          return e.toUpperCase();
        }) + '":' + (!o || n(o, "+")), i = ",");
      }r = "h(" + a + u + r + "})";for (var f = e.firstChild; f;) r += "," + t(f), f = f.nextSibling;return r + ")";
    }((e.content || e).firstChild));
  }(r)))(this, arguments);
}