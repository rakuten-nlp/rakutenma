var RakutenMA = require('../rakutenma');
var SCW = RakutenMA.SCW;
var Trie = RakutenMA.Trie;

describe("Rakuten MA SCW library tests", function() {
  it("tests case 1", function() {
    var scw = new SCW(0.0, 1.0);

    expect(scw.psi).toEqual(1.0);
    expect(scw.zeta).toEqual(1.0);

    var x = {};

    Trie.insert(x, ["a", "b", "c"], 1.0);
    Trie.insert(scw.mu, ["a", "b", "c"], 1.0);

    var margin = scw.calc_margin(x, 1);
    var variance = scw.calc_variance(x);

    expect(margin).toEqual(1.0);
    expect(variance).toEqual(1.0);

    var alpha = scw.calc_alpha(margin, variance);
    expect(alpha).toEqual(0.0);
    var beta  = scw.calc_beta(margin, variance, alpha);
    expect(beta).toEqual(0.0);

    Trie.insert(x, ["a", "b", "d"], 2.0);
    Trie.insert(scw.mu, ["a", "b", "d"], 0.5);
    Trie.insert(scw.sigma, ["a", "b", "d"], 0.5);

    expect(scw.calc_margin(x, -1)).toEqual(-2.0);
    expect(scw.calc_variance(x)).toEqual(3.0);

    scw.update_mu_sigma(x, 1, 1.0, 1.0);

    expect(Trie.find(scw.mu, ["a", "b", "c"])).toEqual(2.0);
    expect(Trie.find(scw.mu, ["a", "b", "d"])).toEqual(1.5);
    expect(Trie.find(scw.sigma, ["a", "b", "c"])).toEqual(0.0);
    expect(Trie.find(scw.sigma, ["a", "b", "d"])).toEqual(-0.5);

  });

  it("tests case 2", function() {
    // case2: C = 1.0, phi = 2.0

    var scw = new SCW(2.0, 1.0);

    expect(scw.psi).toEqual(3.0);
    expect(scw.zeta).toEqual(5.0);

    var x = {};

    Trie.insert(x, ["a", "b", "c"], 1.0);
    Trie.insert(scw.mu, ["a", "b", "c"], 1.0);

    var margin = scw.calc_margin(x, 1);
    var variance = scw.calc_variance(x);

    expect(margin).toEqual(1.0);
    expect(variance).toEqual(1.0);

    var alpha = scw.calc_alpha(margin, variance);
    var beta = scw.calc_beta(margin, variance, alpha);

    expect(alpha).toBeCloseTo((Math.sqrt(24)-3)/5, 15);
    var beta_true = (2*(Math.sqrt(24)-3)/5)/(0.5*(-2*(Math.sqrt(24)-3)/5+Math.sqrt(4*(33-6*Math.sqrt(24))/25+4))+2*(Math.sqrt(24)-3)/5);
    expect(beta).toBeCloseTo(beta_true, 15);


    Trie.insert(x, ["a", "b", "d"], 2.0);
    scw.update_mu_sigma(x, -1, 0.2, 0.5);
    expect(Trie.find(scw.mu, ["a", "b", "c"])).toEqual(0.8);
    expect(Trie.find(scw.mu, ["a", "b", "d"])).toEqual(-0.4);
    expect(Trie.find(scw.sigma, ["a", "b", "c"])).toEqual(0.5);
    expect(Trie.find(scw.sigma, ["a", "b", "d"])).toEqual(-1.0);
  });

  it("tests scw.prune", function() {

    var scw = new SCW(0.0, 1.0);
    Trie.insert(scw.mu, ["a", "b", "c"], 0.5);
    Trie.insert(scw.mu, ["a", "b", "d"], 1.5);
    Trie.insert(scw.sigma, ["a", "b", "c"], 0.5);
    Trie.insert(scw.sigma, ["a", "b", "d"], 0.5);

    scw.prune(1.0, 0.8);

    expect(Trie.find(scw.mu, ["a", "b", "c"])).toEqual(0);
    expect(Trie.find(scw.mu, ["a", "b", "d"])).toEqual(0.5);
    expect(Trie.find(scw.sigma, ["a", "b", "c"])).toEqual(0.5);
    expect(Trie.find(scw.sigma, ["a", "b", "d"])).toEqual(0.5);

    scw.prune(1.0, 0.4);

    expect(Trie.find(scw.mu, ["a", "b", "c"])).toEqual(undefined);
    expect(Trie.find(scw.mu, ["a", "b", "d"])).toEqual(undefined);
    expect(Trie.find(scw.sigma, ["a", "b", "c"])).toEqual(undefined);
    expect(Trie.find(scw.sigma, ["a", "b", "d"])).toEqual(undefined);

  });
});
