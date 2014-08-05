var RakutenMA = require('../rakutenma');
var Trie = RakutenMA.Trie;

describe("Rakuten MA core library tests", function() {

  it("tests Rakuten MA initialization", function() {
    var rma = RakutenMA();
    expect(rma.model).toEqual({});
    expect(rma.scw).toBeDefined();
    expect(rma.scw.mu).toEqual({});
    expect(rma.scw.sigma).toEqual({});
    expect(rma.scw.phi).toEqual(2048);         // default value test
    expect(rma.scw.c).toEqual(0.003906);       // defualt value test


    rma = new RakutenMA({mu: {"feat1": 0.1}, sigma: {"feat1": 0.2}}, 1.0, 2.0);
    expect(rma.model.mu).toEqual({"feat1": 0.1});
    expect(rma.model.sigma).toEqual({"feat1": 0.2});
    expect(rma.scw.mu).toEqual({"feat1": 0.1});
    expect(rma.scw.sigma).toEqual({"feat1": 0.2});
    expect(rma.scw.phi).toEqual(1.0);
    expect(rma.scw.c).toEqual(2.0);

    rma.set_model({mu: {"feat1": 0.3}, sigma: {"feat1": 0.4}});
    expect(rma.scw.mu).toEqual({"feat1": 0.3});
    expect(rma.scw.sigma).toEqual({"feat1": 0.4});

  });

  it("tests evaluation functions", function() {

    // the last "a" doesn't match because of offset of "d+"
    var sent1 = ["a", "b", "c", "d", "a"];
    var sent2 = ["a", "b", "c", "d+", "a"];
    expect(RakutenMA.count_tps(sent1, sent2)).toEqual(3);

    // ignores pos tags for comparison
    sent1 = [["x", "pos1"], ["y", "pos2"], ["z", "pos3"]];
    sent2 = [["x", "pos0"], ["u", "pos2"], ["v", "pos3"], ["x", "pos1"]];
    expect(RakutenMA.count_tps(sent1, sent2)).toEqual(1);

    expect(function(){ RakutenMA.eval_corpus(["a"], []); }).toThrow();

    sent1 = ["a", "b", "c", "d", "a"];
    sent2 = ["a", "b", "c", "d+", "a", "b", "c", "d", "e", "f"];
    var res = RakutenMA.eval_corpus([sent1], [sent2]);
    expect(res[0]).toEqual(0.3);
    expect(res[1]).toEqual(0.6);
    expect(res[2]).toEqual(0.4);

    var test_corpus = [[["abra", "pos1"], ["cadabra", "pos2"]]];
    var tokenize_func = function(s) { return s.split(""); };
    expect(RakutenMA.tokenize_corpus(tokenize_func, test_corpus))
      .toEqual([["a", "b", "r", "a", "c", "a", "d", "a", "b", "r", "a"]]);

    // tsent identical check
    expect(RakutenMA.tokens_identical([["a"]], [[]])).toBe(false);
    expect(RakutenMA.tokens_identical([["a"]], [["b"]])).toBe(false);
    expect(RakutenMA.tokens_identical([["a", "pos1"]], [["a", "pos2"]])).toBe(false);
    expect(RakutenMA.tokens_identical([["a", "pos1"]], [["a", "pos1"]])).toBe(true);

  });

  it("tests schema comparison and other conversion methods", function() {
    var rma = new RakutenMA({});
    var sent = [["hoge", "X"], ["fuga", "Y"], ["p", "Z"]];

    expect(function() { rma.tokens2csent(sent, "UNKNOWN_SCHEME") }).toThrow();


    var csent =  rma.tokens2csent(sent, "SBIEO");
    expect(csent[1].c).toEqual("h"); expect(csent[1].l).toEqual("B-X");
    expect(csent[2].c).toEqual("o"); expect(csent[2].l).toEqual("I-X");
    expect(csent[4].c).toEqual("e"); expect(csent[4].l).toEqual("E-X");
    expect(csent[9].c).toEqual("p"); expect(csent[9].l).toEqual("S-Z");

    sent = RakutenMA.csent2tokens(csent, "SBIEO");
    expect(function() { RakutenMA.csent2tokens(csent, "UNKNOWN_SCHEME")}).toThrow();

    expect(sent[0][0]).toEqual("hoge"); expect(sent[0][1]).toEqual("X");
    expect(sent[1][0]).toEqual("fuga"); expect(sent[1][1]).toEqual("Y");
    expect(sent[2][0]).toEqual("p");    expect(sent[2][1]).toEqual("Z");

    expect(RakutenMA.tokens2string(sent)).toEqual("hoge [X] | fuga [Y] | p [Z]");

    expect(rma.str2csent("hoge")).toEqual([
      { c: '',  t: '', l: RakutenMA._BEOS_LABEL },
      { c: 'h', t: RakutenMA.ctype_ja_default_func("h") },
      { c: 'o', t: RakutenMA.ctype_ja_default_func("o") },
      { c: 'g', t: RakutenMA.ctype_ja_default_func("g") },
      { c: 'e', t: RakutenMA.ctype_ja_default_func("e") },
      { c: '',  t: '', l: RakutenMA._BEOS_LABEL }
      ]);
  });

  it("tests character type related functions", function() {
    var cfunc = RakutenMA.create_ctype_chardic_func({"a": ["type1"], "b": ["type2"]});
    expect(cfunc("a")).toEqual(["type1"]);
    expect(cfunc("b")).toEqual(["type2"]);
    expect(cfunc("c")).toEqual([]);

    expect(RakutenMA.ctype_ja_default_func("あ")).toEqual("H");
    expect(RakutenMA.ctype_ja_default_func("ア")).toEqual("K");
    expect(RakutenMA.ctype_ja_default_func("Ａ")).toEqual("A");
    expect(RakutenMA.ctype_ja_default_func("ａ")).toEqual("a");
    expect(RakutenMA.ctype_ja_default_func("漢")).toEqual("C");
    expect(RakutenMA.ctype_ja_default_func("百")).toEqual("S");
    expect(RakutenMA.ctype_ja_default_func("0")).toEqual("N");
    expect(RakutenMA.ctype_ja_default_func("・")).toEqual("n");
  });

  it("tests basic tokenizing functions", function() {
    expect(RakutenMA.string2hash("hoge")).toEqual(3208229);
    expect(RakutenMA.string2hash("piyopiyo")).toEqual(-105052642);

    // create 4-bit (0 - 15) feature hashing function
    var hash_func = RakutenMA.create_hash_func(4);
    expect(hash_func(["feat1", "foo"])).toEqual([5]);
    expect(hash_func(["feat1", "bar"])).toEqual([2]);
    expect(hash_func(["feat1", "baz"])).toEqual([10]);
    expect(hash_func(["feat1", "qux"])).toEqual([3]);

    // feature functions test
    var rma = new RakutenMA();
    rma.featset = ["w0"];
    var csent = rma.str2csent("A1-b");
    rma.add_efeats(csent);
    expect(csent[0].f).toEqual([["w0", ""]]);
    expect(csent[1].f).toEqual([["w0", "A"]]);
    expect(csent[2].f).toEqual([["w0", "1"]]);
    expect(csent[3].f).toEqual([["w0", "-"]]);
    expect(csent[4].f).toEqual([["w0", "b"]]);
    expect(csent[5].f).toEqual([["w0", ""]]);

    rma.featset = ["b1"];
    rma.add_efeats(csent);
    expect(csent[0].f).toEqual([["b1", "", "A"]]);
    expect(csent[1].f).toEqual([["b1", "A", "1"]]);
    expect(csent[2].f).toEqual([["b1", "1", "-"]]);
    expect(csent[3].f).toEqual([["b1", "-", "b"]]);
    expect(csent[4].f).toEqual([["b1", "b", ""]]);
    expect(csent[5].f).toEqual([["b1", "", ""]]);

    rma.featset = ["c0"];
    rma.add_efeats(csent);
    expect(csent[0].f).toEqual([["c0", ""]]);
    expect(csent[1].f).toEqual([["c0", "A"]]);
    expect(csent[2].f).toEqual([["c0", "N"]]);
    expect(csent[3].f).toEqual([["c0", "O"]]);
    expect(csent[4].f).toEqual([["c0", "a"]]);
    expect(csent[5].f).toEqual([["c0", ""]]);

    rma.featset = ["d9"];
    rma.add_efeats(csent);
    expect(csent[0].f).toEqual([["d9", "", ""]]);
    expect(csent[1].f).toEqual([["d9", "", "A"]]);
    expect(csent[2].f).toEqual([["d9", "A", "N"]]);
    expect(csent[3].f).toEqual([["d9", "N", "O"]]);
    expect(csent[4].f).toEqual([["d9", "O", "a"]]);
    expect(csent[5].f).toEqual([["d9", "a", ""]]);

    rma.featset = ["t0"];
    rma.add_efeats(csent);
    expect(csent[0].f).toEqual([["t0", "", "", "A"]]);
    expect(csent[1].f).toEqual([["t0", "", "A", "1"]]);
    expect(csent[2].f).toEqual([["t0", "A", "1", "-"]]);
    expect(csent[3].f).toEqual([["t0", "1", "-", "b"]]);
    expect(csent[4].f).toEqual([["t0", "-", "b", ""]]);
    expect(csent[5].f).toEqual([["t0", "b", "", ""]]);

    rma.featset = [function(_t, i) {
      // test a custom function for feature
      // args _t: a function which receives position i and returns the token, taking care of boundary cases
      //       i: current position

      // sample function -> returns if the character is a capitalized letter
      return ["CAP", _t(i).t == "A" ? "T" : "F"];
    }];
    rma.add_efeats(csent);
    expect(csent[0].f).toEqual([["CAP", "F"]]);
    expect(csent[1].f).toEqual([["CAP", "T"]]);
    expect(csent[2].f).toEqual([["CAP", "F"]]);
    expect(csent[3].f).toEqual([["CAP", "F"]]);
    expect(csent[4].f).toEqual([["CAP", "F"]]);
    expect(csent[5].f).toEqual([["CAP", "F"]]);

    rma.featset = ["NONEXISTENT_FEATURE"];
    expect(function() {rma.add_efeats(csent);}).toThrow();

    rma.featset = ["w0"];
    csent = rma.tokens2csent([["foo", "N"], ["bar", "N"]], "SBIEO");
    rma.add_efeats(csent);
    var feats = rma.csent2feats(csent);
    expect(feats).toContain(["w0", "", "_"]);
    expect(feats).toContain(["w0", "f", "B-N"]);
    expect(feats).toContain(["w0", "o", "I-N"]);
    expect(feats).toContain(["w0", "o", "E-N"]);
    expect(feats).toContain(["w0", "b", "B-N"]);
    expect(feats).toContain(["w0", "a", "I-N"]);
    expect(feats).toContain(["w0", "r", "E-N"]);

    expect(feats).toContain(["t", "B-N", "_"]);
    expect(feats).toContain(["t", "I-N", "B-N"]);
    expect(feats).toContain(["t", "E-N", "I-N"]);
    expect(feats).toContain(["t", "B-N", "E-N"]);
    expect(feats).toContain(["t", "_", "E-N"]);
    expect(feats).not.toContain(["t", "E-N", "B-N"]);
    expect(feats).not.toContain(["t", "B-N", "I-N"]);

    rma.featset = ["c0", "w0"];
    csent = rma.tokens2csent([["foo", "N"], ["bar", "N"]], "SBIEO");
    rma.add_efeats(csent);

    var weights = {"c0": {"a": {"B-N": {v: 1.0}, "I-N": {v: 1.0}, "E-N": {v: 1.0}}},
                   "w0": {"f": {"B-N": {v: 1.0}},
                          "o": {"I-N": {v: 1.0}, "E-N": {v: 1.0}},
                          "b": {"B-N": {v: 1.0}},
                          "a": {"I-N": {v: 1.0}},
                          "r": {"E-N": {v: 1.0}}},
                  "t":   {"I-N": {"B-N": {v: 1.0}},
                          "E-N": {"I-N": {v: 1.0}}}};

    expect(rma.calc_states0(csent[1].f, weights, {})).toEqual({ 'B-N': 2, 'I-N': 1, 'E-N': 1 });
    expect(rma.calc_states0(csent[2].f, weights, {})).toEqual({ 'B-N': 1, 'I-N': 2, 'E-N': 2 });
    expect(rma.calc_states0(csent[3].f, weights, {})).toEqual({ 'B-N': 1, 'I-N': 2, 'E-N': 2 });
    expect(rma.calc_states0(csent[4].f, weights, {})).toEqual({ 'B-N': 2, 'I-N': 1, 'E-N': 1 });
    expect(rma.calc_states0(csent[5].f, weights, {})).toEqual({ 'B-N': 1, 'I-N': 2, 'E-N': 1 });
    expect(rma.calc_states0(csent[6].f, weights, {})).toEqual({ 'B-N': 1, 'I-N': 1, 'E-N': 2 });

    for (var i = 0; i < csent.length; i ++)
      csent[i].l = '';

    rma.model.mu = weights;
    rma.decode(csent);
    expect(csent[0].l).toEqual("_");
    expect(csent[1].l).toEqual("B-N");
    expect(csent[2].l).toEqual("I-N");
    expect(csent[3].l).toEqual("E-N");
    expect(csent[4].l).toEqual("B-N");
    expect(csent[5].l).toEqual("I-N");
    expect(csent[6].l).toEqual("E-N");
    expect(csent[7].l).toEqual("_");

    csent = rma.tokens2csent([["foX", "N"], ["bar", "N"]], "SBIEO");
    rma.add_efeats(csent);

    rma.decode(csent);
    expect(csent[0].l).toEqual("_");
    expect(csent[1].l).toEqual("B-N");
    expect(csent[2].l).toEqual("I-N");
    expect(csent[3].l).toEqual("O");
    expect(csent[4].l).toEqual("B-N");
    expect(csent[5].l).toEqual("I-N");
    expect(csent[6].l).toEqual("E-N");
    expect(csent[7].l).toEqual("_");
  });

  it("tests training", function() {
    var rma = new RakutenMA();
    rma.featset = ["w0"];

    var res = rma.train_one([["foo", "N"], ["bar", "N"]]);
    expect(res.updated).toBe(true);
    expect(Trie.find(rma.model.mu, ["w0", "f", "B-N"])).toBeGreaterThan(0);
    expect(Trie.find(rma.model.mu, ["w0", "o", "I-N"])).toBeGreaterThan(0);
    expect(Trie.find(rma.model.mu, ["w0", "o", "E-N"])).toBeGreaterThan(0);
    expect(rma.tokenize("foobar")).toEqual([["foo", "N"], ["bar", "N"]]);

    rma.set_model({});
    rma.set_tag_scheme("IOB2");
    expect(rma.model).toEqual({});
    expect(rma.tag_scheme).toEqual("IOB2");

    rma.train_one([["foo", "N"], ["bar", "N"]]);
    expect(Trie.find(rma.model.mu, ["w0", "f", "B-N"])).toBeGreaterThan(0);
    expect(Trie.find(rma.model.mu, ["w0", "o", "I-N"])).toBeGreaterThan(0);
    expect(Trie.find(rma.model.mu, ["w0", "o", "E-N"])).not.toBeDefined();
    expect(rma.tokenize("foobar")).toEqual([["foo", "N"], ["bar", "N"]]);

  });
});
