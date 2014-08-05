var RakutenMA = require('../rakutenma');
var Trie = RakutenMA.Trie;

describe("Rakuten MA Trie library tests", function() {
  var trie = {};

  Trie.insert(trie, ["A"], 15);

  Trie.insert(trie, ["t", "o"], 7);
  Trie.insert(trie, ["t", "e", "a"], 3);
  Trie.insert(trie, ["t", "e", "d"], 4);
  Trie.insert(trie, ["t", "e", "n"], 12);
  Trie.insert(trie, ["i"], 11);
  Trie.insert(trie, ["i", "n"], 5);
  Trie.insert(trie, ["i", "n", "n"], 9);


  it("tests basic insertion operation", function() {

    expect(Trie.find(trie, ["A"])).toEqual(15);
    expect(Trie.find(trie, ["t", "o"])).toEqual(7);
    expect(Trie.find(trie, ["t", "e", "a"])).toEqual(3);
    expect(Trie.find(trie, ["t", "e", "d"])).toEqual(4);
    expect(Trie.find(trie, ["t", "e", "n"])).toEqual(12);
    expect(Trie.find(trie, ["i"])).toEqual(11);
    expect(Trie.find(trie, ["i", "n"])).toEqual(5);
    expect(Trie.find(trie, ["i", "n", "n"])).toEqual(9);
    expect(Trie.find(trie, ["i", "n", "n", "n"])).toEqual(undefined);
    expect(Trie.find(trie, ["z"])).toEqual(undefined);

  });

  var trie2 = {};
  Trie.insert(trie2, ["t", "e", "a"], 3);
  Trie.insert(trie2, ["t", "e", "d"], 2);
  Trie.insert(trie2, ["t", "e", "n"], 1);
  Trie.insert(trie2, ["t", "e", "x"], 10);
  Trie.insert(trie2, ["t", "e"], 10);


  it("tests inner product", function() {
    expect(Trie.inner_prod(trie, trie2)).toEqual(29);
  });

  it("tests addition with coefficient", function() {
    var trie1 = Trie.copy(trie);


    Trie.add_coef(trie1, trie2, 0.1); // with default value = 0

    expect(Trie.find(trie1, ["A"])).toEqual(15);
    expect(Trie.find(trie1, ["t", "e", "a"])).toEqual(3.3);
    expect(Trie.find(trie1, ["t", "e", "d"])).toEqual(4.2);
    expect(Trie.find(trie1, ["t", "e", "n"])).toEqual(12.1);
    expect(Trie.find(trie1, ["t", "e", "x"])).toEqual(1);
    expect(Trie.find(trie1, ["t", "e"])).toEqual(1);

    trie1 = Trie.copy(trie);

    Trie.add_coef(trie1, trie2, 0.1, 1.0); // with default value = 1

    expect(Trie.find(trie1, ["A"])).toEqual(15);
    expect(Trie.find(trie1, ["t", "e", "a"])).toEqual(3.3);
    expect(Trie.find(trie1, ["t", "e", "d"])).toEqual(4.2);
    expect(Trie.find(trie1, ["t", "e", "n"])).toEqual(12.1);
    expect(Trie.find(trie1, ["t", "e", "x"])).toEqual(2);
    expect(Trie.find(trie1, ["t", "e"])).toEqual(2);

  });

  it("tests multiplication", function() {
    var trie1 = Trie.copy(trie);

    Trie.mult(trie1, trie2);

    expect(Trie.find(trie1, ["A"])).toEqual(15);
    expect(Trie.find(trie1, ["t", "e", "a"])).toEqual(9);
    expect(Trie.find(trie1, ["t", "e", "d"])).toEqual(8);
    expect(Trie.find(trie1, ["t", "e", "n"])).toEqual(12);
    expect(Trie.find(trie1, ["t", "e", "x"])).toEqual(undefined);
    expect(Trie.find(trie1, ["t", "e"])).toEqual(undefined);

  });

  it("tests find_partial", function() {

    expect(Trie.find_partial(trie, ["t", "e"])["a"].v).toEqual(3);
    expect(Trie.find_partial(trie, ["x"])).toEqual(undefined);

  });

  it("tests toString", function() {
    var trie = {};
    Trie.insert(trie, ["a", "b"], 1);
    Trie.insert(trie, ["a", "c"], 2);
    expect(Trie.toString(trie)).toEqual("a b\t1\na c\t2\n");
  });

  it("tests each", function() {

    var trie2 = {};
    Trie.each(trie, function(key, val) {
      Trie.insert(trie2, key, val);
    });
    expect(trie2).toEqual(trie);

  });
});
