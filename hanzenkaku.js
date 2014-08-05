/*
 * $Id: hanzenkaku.js,v 1.1 2013/05/13 15:54:38 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 */
(function (global) {
    // hankaku <-> zenkaku
    var re_h2z = new RegExp('(?:' + [
        '[',
        '\uFF61\uFF62\uFF63\uFF65\uFF66\uFF67\uFF68\uFF69\uFF6A\uFF6B',
        '\uFF6C\uFF6D\uFF6E\uFF6F\uFF70\uFF71\uFF72\uFF74\uFF75\uFF85',
        '\uFF86\uFF87\uFF88\uFF89\uFF8F\uFF90\uFF91\uFF92\uFF93\uFF94',
        '\uFF95\uFF96\uFF97\uFF98\uFF99\uFF9A\uFF9B\uFF9C\uFF9D',
        ']', '|',
        '[',
        '\uFF73\uFF76\uFF77\uFF78\uFF79\uFF7A\uFF7B\uFF7C\uFF7D\uFF7E',
        '\uFF7F\uFF80\uFF81\uFF82\uFF83\uFF84',
        ']', '[\uFF9E]?', '|',
        '[\uFF8A\uFF8B\uFF8C\uFF8D\uFF8E][\uFF9E\uFF9F]?'
        ].join('') + ')', 'g');
    var re_z2h = new RegExp('(?:[' + [
        '\u3002\u300C\u300D\u30A1\u30A2\u30A3\u30A4\u30A5\u30A6\u30A7',
        '\u30A8\u30A9\u30AA\u30AB\u30AC\u30AD\u30AE\u30AF\u30B0\u30B1',
        '\u30B2\u30B3\u30B4\u30B5\u30B6\u30B7\u30B8\u30B9\u30BA\u30BB',
        '\u30BC\u30BD\u30BE\u30BF\u30C0\u30C1\u30C2\u30C3\u30C4\u30C5',
        '\u30C6\u30C7\u30C8\u30C9\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF',
        '\u30D0\u30D1\u30D2\u30D3\u30D4\u30D5\u30D6\u30D7\u30D8\u30D9',
        '\u30DA\u30DB\u30DC\u30DD\u30DE\u30DF\u30E0\u30E1\u30E2\u30E3',
        '\u30E4\u30E5\u30E6\u30E7\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED',
        '\u30EF\u30F2\u30F3\u30F4\u30FB\u30FC'
        ].join('') + '])', 'g');
    var o_z2h = {
        '\u3002': '\uFF61',
        '\u300C': '\uFF62',
        '\u300D': '\uFF63',
        '\u30FB': '\uFF65',
        '\u30FC': '\uFF70',
        '\u30A1': '\uFF67',
        '\u30A2': '\uFF71',
        '\u30A3': '\uFF68',
        '\u30A4': '\uFF72',
        '\u30A5': '\uFF69',
        '\u30A6': '\uFF73',
        '\u30A7': '\uFF6A',
        '\u30A8': '\uFF74',
        '\u30A9': '\uFF6B',
        '\u30AA': '\uFF75',
        '\u30AB': '\uFF76',
        '\u30AC': '\uFF76\uFF9E',
        '\u30AD': '\uFF77',
        '\u30AE': '\uFF77\uFF9E',
        '\u30AF': '\uFF78',
        '\u30B0': '\uFF78\uFF9E',
        '\u30B1': '\uFF79',
        '\u30B2': '\uFF79\uFF9E',
        '\u30B3': '\uFF7A',
        '\u30B4': '\uFF7A\uFF9E',
        '\u30B5': '\uFF7B',
        '\u30B6': '\uFF7B\uFF9E',
        '\u30B7': '\uFF7C',
        '\u30B8': '\uFF7C\uFF9E',
        '\u30B9': '\uFF7D',
        '\u30BA': '\uFF7D\uFF9E',
        '\u30BB': '\uFF7E',
        '\u30BC': '\uFF7E\uFF9E',
        '\u30BD': '\uFF7F',
        '\u30BE': '\uFF7F\uFF9E',
        '\u30BF': '\uFF80',
        '\u30C0': '\uFF80\uFF9E',
        '\u30C1': '\uFF81',
        '\u30C2': '\uFF81\uFF9E',
        '\u30C3': '\uFF6F',
        '\u30C4': '\uFF82',
        '\u30C5': '\uFF82\uFF9E',
        '\u30C6': '\uFF83',
        '\u30C7': '\uFF83\uFF9E',
        '\u30C8': '\uFF84',
        '\u30C9': '\uFF84\uFF9E',
        '\u30CA': '\uFF85',
        '\u30CB': '\uFF86',
        '\u30CC': '\uFF87',
        '\u30CD': '\uFF88',
        '\u30CE': '\uFF89',
        '\u30CF': '\uFF8A',
        '\u30D0': '\uFF8A\uFF9E',
        '\u30D1': '\uFF8A\uFF9F',
        '\u30D2': '\uFF8B',
        '\u30D3': '\uFF8B\uFF9E',
        '\u30D4': '\uFF8B\uFF9F',
        '\u30D5': '\uFF8C',
        '\u30D6': '\uFF8C\uFF9E',
        '\u30D7': '\uFF8C\uFF9F',
        '\u30D8': '\uFF8D',
        '\u30D9': '\uFF8D\uFF9E',
        '\u30DA': '\uFF8D\uFF9F',
        '\u30DB': '\uFF8E',
        '\u30DC': '\uFF8E\uFF9E',
        '\u30DD': '\uFF8E\uFF9F',
        '\u30DE': '\uFF8F',
        '\u30DF': '\uFF90',
        '\u30E0': '\uFF91',
        '\u30E1': '\uFF92',
        '\u30E2': '\uFF93',
        '\u30E3': '\uFF6C',
        '\u30E4': '\uFF94',
        '\u30E5': '\uFF6D',
        '\u30E6': '\uFF95',
        '\u30E7': '\uFF6E',
        '\u30E8': '\uFF96',
        '\u30E9': '\uFF97',
        '\u30EA': '\uFF98',
        '\u30EB': '\uFF99',
        '\u30EC': '\uFF9A',
        '\u30ED': '\uFF9B',
        '\u30EF': '\uFF9C',
        '\u30F2': '\uFF66',
        '\u30F3': '\uFF9D',
        '\u30F4': '\uFF73\uFF9E'
    };
    var objectReverse = function (o) {
        var r = {};
        for (var p in o) r[o[p]] = p;
        return r;
    };
    var o_h2z = objectReverse(o_z2h);
    var f_h2z = function (str) {
        return str.replace(re_h2z, function (m) {
            return o_h2z[m];
        });
    };
    var f_z2h = function (str) {
        return str.replace(re_z2h, function (m) {
            return o_z2h[m];
        });
    };
    // halfwidth <-> fullwidth
    var o_hw2fw = (function (o) {
        for (var i = 0x21; i <= 0x7E; i++) {
            o[String.fromCharCode(i)] = String.fromCharCode(i + 0xFF00 - 0x20);
        }
        return o;
    })({
        '\u2985': '\uFF5F', // LEFT WHITE PARENTHESIS
        '\u2986': '\uFF60', // RIGHT WHITE PARENTHESIS
        '\u00A2': '\uFFE0', // CENT SIGN
        '\u00A3': '\uFFE1', // POUND SIGN
        '\u00AC': '\uFFE2', // NOT SIGN
        '\u00AF': '\uFFE3', // MACRON
        '\u00A6': '\uFFE4', // BROKEN BAR
        '\u00A5': '\uFFE5', // YEN SIGN
        '\u20A9': '\uFFE6' // WON SIGN
    });
    var re_hw2fw = /[\x21-\x7E\u2985\u2986\xA2\xA3\xAC\xAF\xA6\xA5\u20A9]/g;
    var o_fw2hw = objectReverse(o_hw2fw);
    var re_fw2hw = /[\uFF01-\uFFE6]/g;
    var f_hw2fw = function (str) {
        return str.replace(re_hw2fw, function (m) {
            return o_hw2fw[m];
        });
    };
    var f_fw2hw = function (str) {
        return str.replace(re_fw2hw, function (m) {
            return o_fw2hw[m];
        });
    };
    var f_fs2hs = function (str) {
        return str.replace(/\u3000/g, ' ');
    };
    var f_hs2fs = function (str) {
        return str.replace(/ /g, '\u3000');
    };
    // katakana <-> hiragana
    var o_h2k = (function () {
        var o = {};
        for (var i = 0x3041; i <= 0x3094; i++) {
            o[String.fromCharCode(i)] = String.fromCharCode(i - 0x3040 + 0x30A0);
        }
        return o;
    })();
    var o_k2h = objectReverse(o_h2k);
    var f_h2k = function (str) {
        return str.replace(/[\u3041-\u3094]/g, function (m) {
            return o_h2k[m];
        });
    };
    var f_k2h = function (str) {
        return str.replace(/[\u30A1-\u30F4]/g, function (m) {
            return o_k2h[m];
        });
    };
    // export
    global.HanZenKaku = global.HanZenKaku || {
        h2z: f_h2z,
        z2h: f_z2h,
        fw2hw: f_fw2hw,
        hw2fw: f_hw2fw,
        fs2hs: f_fs2hs,
        hs2fs: f_hs2fs,
        h2k: f_h2k,
        k2h: f_k2h,
        version: '1.0.1'
    };
    /*
     * Extend String.prototype iff ES5 is available
     */
    if (typeof (Object.defineProperty) === 'function')(function (obj, meth) {
        var f2m = function (f) {
            return function () {
                return f(this);
            };
        };
        for (var k in meth) if (!obj[k]) Object.defineProperty(
            obj, k, {
                value: f2m(meth[k]),
                enumerable: false,
                writable: true,
                configurable: true
            }
        );
    })(String.prototype, {
        toZenkaku: f_h2z,
        toHankaku: f_z2h,
        toFullwidth: f_hw2fw,
        toHalfwidth: f_fw2hw,
        toFullwidthSpace: f_hs2fs,
        toHalfwidthSpace: f_fs2hs,
        toKatakana: f_h2k,
        toHiragana: f_k2h
    });
})(this);
