/*
 * Rakuten MA
 *
 * Rakuten MA (morphological analyzer) is a morphological analyzer (word segmentor + PoS Tagger)
 * for Chinese and Japanese written purely in JavaScript.
 *
 * Refer to our GitHub repository https://github.com/rakuten-nlp/rakutenma for more information.
 *
 * Rakuten MA is distributed under Apache License, version 2.0. http://www.apache.org/licenses/LICENSE-2.0
 *
 * (C) 2014, 2015 Rakuten NLP Project. All Rights Reserved.
 */


var RakutenMA = function (model, phi, c) {
    // constructor
    this.model = model || {};

    // initialize the SCW module (with pre-fixed parameters if not specified)
    this.scw = new SCW(phi || 2048, c || 0.003906);
    this.scw.mu = this.model.mu || {};
    this.scw.sigma = this.model.sigma || {};

    // default ctype func for JA
    this.ctype_func = RakutenMA.ctype_ja_default_func;

    // default tag scheme = SBIEO
    this.tag_scheme = "SBIEO";

    return this;
};

RakutenMA.prototype.set_tag_scheme = function(scheme) {
  this.tag_scheme = scheme;
};

RakutenMA.string2hash = function(str) {
  // receives a string and returns a hash value for it
  // from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  var hash = 0;
  var i;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

RakutenMA.create_hash_func = function(bits) {
  // creates and returns a feature hashing function
  // using the specified number of bits
  var num_feats = Math.pow(2, bits);
  return function(arr) {
    return [(RakutenMA.string2hash(arr.join("_")) % num_feats) + num_feats - 1];
  }
};

RakutenMA.prototype.tokenize = function (input) {
    // tokenize input sentence (string)

    var csent = this.str2csent(input);
    this.add_efeats(csent);

    this.decode(csent);

    return RakutenMA.csent2tokens(csent, this.tag_scheme);
};

// default feature set (first features are used as tag dictionary)
RakutenMA.default_featset_ja = ["c0", "w0", "w1", "w9", "w2", "w8",
        "b1", "b9", "b2", "b8",
        "c1", "c9", "c2", "c8", "c3", "c7",
        "d1", "d9", "d2", "d8"];

RakutenMA.default_featset_zh = ["c0", "w0", "w1", "w9", "w2", "w8",
        "b1", "b9", "b2", "b8",
        "c1", "c9", "c2", "c8", "c3", "c7"];

RakutenMA.prototype.add_efeats = function(csent) {
  // receives csent (character-sentence) structure
  // and adds the emission features to csent[i].f

  var _empty_token = {c: "", t: ""};
  var _t = function(i) { return (i >= 0 && i < csent.length) ?
                         csent[i] : _empty_token; };

  // for feature hashing
  var _f = this.hash_func || function(x) { return x; };

  var add_ctype_feats = function(arr, label, ctype) {
    // a helper function to add all the feature values of ctype to arr
    // if ctype is a string, simply adds it to arr,
    // if ctype is an array, adds all the elements to arr (used for Chinese tokenization)

    var i;
    if (typeof(ctype) == "string") {
      arr.push(_f([label, ctype]));
    } else {
      for (i = 0; i < ctype.length; i ++)
        arr.push(_f([label, ctype[i]]));
    }
  };

  var i, j, feat;

  for (i = 0; i < csent.length; i ++) {

    csent[i].f = [];

    for (j = 0; j < this.featset.length; j ++) {
      feat = this.featset[j];
      switch (feat) {
      // character type unigram
      case "c0": add_ctype_feats( csent[i].f, "c0", _t(i  ).t ); break;
      case "c1": add_ctype_feats( csent[i].f, "c1", _t(i+1).t ); break;
      case "c9": add_ctype_feats( csent[i].f, "c9", _t(i-1).t ); break;
      case "c2": add_ctype_feats( csent[i].f, "c2", _t(i+2).t ); break;
      case "c8": add_ctype_feats( csent[i].f, "c8", _t(i-2).t ); break;
      case "c3": add_ctype_feats( csent[i].f, "c3", _t(i+3).t ); break;
      case "c7": add_ctype_feats( csent[i].f, "c7", _t(i-3).t ); break;
      // character unigram
      case "w0": csent[i].f.push( _f( ["w0", _t(i  ).c] ) ); break;
      case "w1": csent[i].f.push( _f( ["w1", _t(i+1).c] ) ); break;
      case "w9": csent[i].f.push( _f( ["w9", _t(i-1).c] ) ); break;
      case "w2": csent[i].f.push( _f( ["w2", _t(i+2).c] ) ); break;
      case "w8": csent[i].f.push( _f( ["w8", _t(i-2).c] ) ); break;
      case "w3": csent[i].f.push( _f( ["w3", _t(i+3).c] ) ); break;
      case "w7": csent[i].f.push( _f( ["w7", _t(i-3).c] ) ); break;
      // character bigram
      case "b1": csent[i].f.push( _f( ["b1", _t(i  ).c, _t(i+1).c] ) ); break;
      case "b9": csent[i].f.push( _f( ["b9", _t(i-1).c, _t(i  ).c] ) ); break;
      case "b2": csent[i].f.push( _f( ["b2", _t(i+1).c, _t(i+2).c] ) ); break;
      case "b8": csent[i].f.push( _f( ["b8", _t(i-2).c, _t(i-1).c] ) ); break;
      case "b3": csent[i].f.push( _f( ["b3", _t(i+2).c, _t(i+3).c] ) ); break;
      case "b7": csent[i].f.push( _f( ["b7", _t(i-3).c, _t(i-2).c] ) ); break;
      // character type bigram
      case "d1": csent[i].f.push( _f( ["d1", _t(i  ).t, _t(i+1).t] ) ); break;
      case "d9": csent[i].f.push( _f( ["d9", _t(i-1).t, _t(i  ).t] ) ); break;
      case "d2": csent[i].f.push( _f( ["d2", _t(i+1).t, _t(i+2).t] ) ); break;
      case "d8": csent[i].f.push( _f( ["d8", _t(i-2).t, _t(i-1).t] ) ); break;
      case "d3": csent[i].f.push( _f( ["d3", _t(i+2).t, _t(i+3).t] ) ); break;
      case "d7": csent[i].f.push( _f( ["d7", _t(i-3).t, _t(i-2).t] ) ); break;
      // character trigram
      case "t0": csent[i].f.push( _f( ["t0", _t(i-1).c, _t(i  ).c, _t(i+1).c] ) ); break;
      case "t1": csent[i].f.push( _f( ["t1", _t(i  ).c, _t(i+1).c, _t(i+2).c] ) ); break;
      case "t9": csent[i].f.push( _f( ["t9", _t(i-2).c, _t(i-1).c, _t(i  ).c] ) ); break;
      default:
      // if the feature template is a function,
      // invoke it and add the returned value
      if (typeof(feat) == 'function')
        csent[i].f.push( _f( feat(_t, i) ) );
      else
        throw "Invalid feature specification!";
      }
    }
  }
};

RakutenMA.prototype.csent2feats = function (csent) {
  // receives a csent and returns a set of features
  // (both transition and emission) for SCW update
  var feats = [];
  var i, j;
  for (i = 0; i < csent.length; i ++) {
    for (j = 0; j < csent[i].f.length; j ++)
      feats.push(csent[i].f[j].concat([csent[i].l]));

    if (i != 0)
      feats.push(["t", csent[i].l, csent[i-1].l]);
  }
  return feats;
};

RakutenMA.prototype.calc_states0 = function (cfeats, weights, e_def) {
  // get state distribution based on emission features
  // cfeat:   set of feature values
  // weights: feature weights (trie)
  // e_def:   emission default distribution
  var scores0 = {};
  var states0 = {};
  var j, k, s0;

  for (j in cfeats) {

    // console.log( "j = " + j + " cfeats[j] = " + cfeats[j]);
    var cemits = Trie.find_partial(weights, cfeats[j]) || e_def;

    // tag dictionary
    // the possible set of tags is solely defined by the first feature
    if (j == 0)
      for (k in cemits) states0[k] = true;

    if (cemits) {
      for (k in cemits) {
        if (k in scores0)
          scores0[k] += cemits[k].v;
        else
          scores0[k] = cemits[k].v;
      }
    }
  }
  // replace by scores
  for (s0 in states0) states0[s0] = scores0[s0];
  return states0;
};

RakutenMA.prototype.decode = function (csent) {
  // decode csent (character-sentence) structure based on its features
  // using the Viterbi algorithm and assign lables to csent[i].l
  var t_def = {};
  Trie.insert(t_def, [RakutenMA._DEF_LABEL, RakutenMA._DEF_LABEL], 1.0);
  Trie.insert(t_def, [RakutenMA._BEOS_LABEL, RakutenMA._DEF_LABEL], 0.1);
  Trie.insert(t_def, [RakutenMA._DEF_LABEL, RakutenMA._BEOS_LABEL], 0.1);
  var e_def = {};
  Trie.insert(e_def, [RakutenMA._DEF_LABEL], 0.1);
  Trie.insert(e_def, [RakutenMA._BEOS_LABEL], 0.0);

  var weights = this.model.mu || {};
  var trans = weights.t || t_def;

  var statesp = {}; statesp[RakutenMA._BEOS_LABEL] = {score: 0.0, path: [RakutenMA._BEOS_LABEL]};

  var states0 = undefined;

  var i, sp, s0;
  var max_score, max_state, states0_score, trans0, score;
  var final_path;

  for (i = 1; i < csent.length; i ++) {

    states0 = this.calc_states0(csent[i].f, weights, e_def);
    for (s0 in states0) {
      max_score = -Infinity;
      max_state = undefined;
      states0_score = states0[s0];
      trans0 = trans[s0] || {};

      for (sp in statesp) {
        t_score = 0.0;
        if (sp in trans0)
          t_score = trans0[sp].v || 0.0;

        score = statesp[sp].score + states0_score + t_score;
        if (score > max_score) {
          max_score = score;
          max_state = sp;
        }
      }

      if (max_state && max_score > 0)
        states0[s0] = {score: max_score, path: statesp[max_state].path.concat([s0])};

    }
    statesp = states0;
  }

  // track the path and assign to csent[i].l
  final_path = statesp[RakutenMA._BEOS_LABEL].path || {};
  for (i = 0; i < csent.length; i ++) {
    csent[i].l = final_path[i] || RakutenMA._DEF_LABEL;
  }
};

// training helper functions

RakutenMA.prototype.train_one = function(sent) {
  // train the current model based on a new (single) instance
  // which is tsent (token-sentence)
  var res = {};

  var sent_str = "";

  var ans_csent, sys_csent;
  var ans_feats, sys_feats;
  var ans_trie, sys_trie;
  var ans_tokens, sys_tokens;

  for (i in sent)
    sent_str += sent[i][0];

  // get answer feats
  ans_csent = this.tokens2csent(sent, this.tag_scheme);
  this.add_efeats(ans_csent);
  ans_feats = this.csent2feats(ans_csent);
  ans_trie = {};
  for (i = 0; i < ans_feats.length; i ++) Trie.insert(ans_trie, ans_feats[i], 1);
  ans_tokens = RakutenMA.csent2tokens(ans_csent, this.tag_scheme);
  res.ans = ans_tokens;

  // get system output
  sys_csent = this.str2csent(sent_str);
  this.add_efeats(sys_csent);
  this.decode(sys_csent);
  sys_feats = this.csent2feats(sys_csent);
  sys_trie = {};
  for (i = 0; i < sys_feats.length; i ++) Trie.insert(sys_trie, sys_feats[i], 1);

  sys_tokens = RakutenMA.csent2tokens(sys_csent, this.tag_scheme);
  res.sys = sys_tokens;

  // update
  if (!RakutenMA.tokens_identical(ans_tokens, sys_tokens)) {
    this.scw.update(ans_trie, 1);
    this.scw.update(sys_trie, -1);
    res.updated = true;
  } else {
    res.updated = false;
  }

  this.model.mu = this.scw.mu;
  this.model.sigma = this.scw.sigma;

  return res;
};

RakutenMA.prototype.prune = function(lambda, sigma_th) {
  // prune the model by FOBOS
  // simply dispatches scw.prune

  this.scw.prune(lambda, sigma_th);
  this.model.mu = this.scw.mu;
  this.model.sigma = this.scw.sigma;
};

RakutenMA.prototype.set_model = function(model) {
  // set a new model
  this.model = model;
  this.scw.mu = model.mu || {};
  this.scw.sigma = model.sigma || {};
};

RakutenMA.prototype.str2csent = function (input) {
  // convert input string to a vector of chars (csent; character-sent)
  // add ctypes on the way

  var csent = [{c: "", t: "", l: RakutenMA._BEOS_LABEL}]; // BOS
  var _chars = input.split("");
  var i;
  for (i = 0; i < _chars.length; i ++) {
    csent.push({c: _chars[i], t: this.ctype_func(_chars[i])});
  }

  csent.push({c: "", t: "", l: RakutenMA._BEOS_LABEL}); // EOS
  return csent;
};

RakutenMA.prototype.tokens2csent = function(tokens, scheme) {
  // convert a tsent(tokenized sentence) to the csent (character-sentence) structure
  // scheme should be either SBIEO or IOB2

  var csent = [ {c: "", t: "", l: RakutenMA._BEOS_LABEL} ]; // BOS
  var i, j, tag;

  if (scheme == "SBIEO") {
    for (i = 0; i < tokens.length; i ++) {
      if (tokens[i][0].length == 1) {
        csent.push({c: tokens[i][0], t: this.ctype_func(tokens[i][0]),
          l: "S-" + tokens[i][1]});
      } else {
        for (j = 0; j < tokens[i][0].length; j ++) {
          tag = j == 0 ? "B-" : (j == tokens[i][0].length-1 ? "E-" : "I-");
          csent.push({c: tokens[i][0].substring(j,j+1),
            t: this.ctype_func(tokens[i][0].substring(j,j+1)),
            l: tag + tokens[i][1]});
        }
      }
    }
  } else if (scheme == "IOB2") {
    for (i = 0; i < tokens.length; i ++) {
      for (j = 0; j < tokens[i][0].length; j ++) {
        tag = j == 0 ? "B-" : "I-";
        csent.push({c: tokens[i][0].substring(j,j+1),
          t: this.ctype_func(tokens[i][0].substring(j,j+1)),
          l: tag + tokens[i][1]});
      }
    }
  } else {
    throw "Invalid tag scheme!";
  }
  csent.push({c: "", t: "", l: RakutenMA._BEOS_LABEL }); // EOS

  return csent;
};

// helper (static) functions

RakutenMA.tokens2string = function (tokens) {
  // convert tsent to a string representation
  var ret = [], i;
  for (i = 0; i < tokens.length; i ++)
      ret.push(tokens[i][0] + " [" + tokens[i][1] + "]");
  return ret.join(" | ");
};

// character type function
// from TinySegmenter http://chasen.org/~taku/software/TinySegmenter/
var CTYPE_JA_PATTERNS = {
    "[一二三四五六七八九十百千万億兆]":"S",
    "[一-龠々〆ヵヶ]":"C",
    "[ぁ-ん]":"H",
    "[ァ-ヴーｱ-ﾝﾞｰ]":"K",
    "[A-ZＡ-Ｚ]":"A",
    "[a-zａ-ｚ]":"a",
    "[0-9０-９]":"N",
    "[・]": "n"
};

var i, regexp;
RakutenMA._ctype_ja_pats = [];
for (i in CTYPE_JA_PATTERNS) {
  regexp = new RegExp();
  regexp.compile(i);
  RakutenMA._ctype_ja_pats.push( [regexp, CTYPE_JA_PATTERNS[i]] );
}

RakutenMA._DEF_LABEL = "O";   // default label
RakutenMA._BEOS_LABEL = "_";  // label for BOS / EOS

RakutenMA.ctype_ja_default_func = function (str) {
  // default character type function for Japanese
  var i;
  for (i in RakutenMA._ctype_ja_pats) {
    if (str.match(RakutenMA._ctype_ja_pats[i][0])) {
      return RakutenMA._ctype_ja_pats[i][1];
    }
  }
  return "O";
};

RakutenMA.create_ctype_chardic_func = function(chardic) {
  // receives a chardic (object of character to set of character types
  // and returns a function which uses this chardic (closure)
  // mainly used for Chinese
  return function(str) {
    if (str in chardic)
      return chardic[str];
    else
      return [];
  };
};

RakutenMA.csent2tokens = function (csent, scheme) {
  // convert csent to tsent (mainly for final output and evaluation)
  var tokens = [];
  var ctoken = undefined;
  var i;
  var head, tail;

  if (scheme == "SBIEO") {

    for (i = 1; i < csent.length-1; i ++) {  // Skip BOS and EOS

      head = csent[i].l.substr(0, 1);
      tail = csent[i].l.substr(2);

      switch (head) {
      case "B":
        if (ctoken) tokens.push(ctoken);
        ctoken = [csent[i].c, tail];
        break;
      case "S":
        if (ctoken) tokens.push(ctoken);
        tokens.push([csent[i].c, tail]);
        ctoken = undefined;
        break;
      case "I":
        ctoken = ctoken || ["", tail];
        ctoken[0] += csent[i].c;
        break;
      case "E":
        ctoken = ctoken || ["", tail];
        ctoken[0] += csent[i].c;
        tokens.push(ctoken);
        ctoken = undefined;
        break;
      default:
        if (ctoken) tokens.push(ctoken);
        tokens.push([csent[i].c, tail]);
        ctoken = undefined;
      }
    }

  } else if (scheme == "IOB2") {

    for (i = 1; i < csent.length-1; i ++) {  // Skip BOS and EOS

      head = csent[i].l.substr(0, 1);
      tail = csent[i].l.substr(2);

      switch (head) {
      case "B":
        if (ctoken) tokens.push(ctoken);
        ctoken = [csent[i].c, tail];
        break;
      case "I":
        ctoken = ctoken || ["", tail];
        ctoken[0] += csent[i].c;
        break;
      default:
        if (ctoken) tokens.push(ctoken);
        tokens.push([csent[i].c, tail]);
        ctoken = undefined;
      }
    }
  } else {
    throw "Invalid tag scheme!";
  }

  if (ctoken) tokens.push(ctoken);
  return tokens;
};

RakutenMA.tokens_identical = function (tokens1, tokens2) {
  // checks if tokens1 and tokens2 (both tsent) are identical
  // based on words and their labels
  var i;

  if (tokens1.length != tokens2.length)
    return false;

  for (i in tokens1) {
    if (!(tokens1[i][0] == tokens2[i][0] && tokens1[i][1] == tokens2[i][1]))
      return false;
  }
  return true;
};

RakutenMA.tokenize_corpus = function (tokenize_func, corpus) {
  // given a corpus (test data), tokenizes all the sentences and returns the result
  // (mainly used for evaluation. see scripts/eval_ja.js and scripts/eval_zh.js)
  var ret = [];
  var i, j;
  var sent, sent_str;

  for (i in corpus) {
    sent = corpus[i];
    sent_str = "";
    for (j in sent)
      sent_str += sent[j][0];
    ret.push(tokenize_func(sent_str));
  }
  return ret;
};

RakutenMA.eval_corpus = function (corpus_ans, corpus_sys) {
  // evaluates the corpus and computes precision, recall, and F measure
  var tps = 0, tokens_ans = 0, tokens_sys = 0;
  var i;

  if (corpus_ans.length != corpus_sys.length)
    throw "Corpus sizes are not the same!";

  for (i in corpus_ans) {
    tps += RakutenMA.count_tps(corpus_ans[i], corpus_sys[i]);
    tokens_ans += corpus_ans[i].length;
    tokens_sys += corpus_sys[i].length;
  }

  return [1.0 * tps / tokens_sys,           // precision
    1.0 * tps / tokens_ans,                 // recall
    2.0 * tps / (tokens_ans + tokens_sys)]; // F1
};

RakutenMA.count_tps = function(ans, sys) {
  // compare tsent (ans) and tsent (sys)
  // and return the number of token-based true positives

  var token2str = function(token) {
    if (typeof token === 'string')
      return token;
    else
      return token[0];
  };

  var min_sent, max_sent;
  var offset = 0;
  var max_set = {};
  var i;
  var token_str;

  if (ans.length < sys.length) {
    min_sent = ans; max_sent = sys;
  } else {
    min_sent = sys; max_sent = ans;
  }

  for (i in max_sent) {
    token_str = token2str(max_sent[i]);
    // attach offset in order to distinguish different tokens
    max_set[token_str + offset] = true;
    offset += token_str.length;
  }

  offset = 0;
  res = 0;
  for (i in min_sent) {
    token_str = token2str(min_sent[i]);
    if ((token_str + offset) in max_set) res ++;
      offset += token_str.length;
  }
  return res;
};

// Trie static functions
var Trie = {};

Trie.find = function(trie, key, depth) {
  var node;

  if (!depth) depth = 0;

  if (depth == key.length) {
    return trie.v;
  } else {
    node = trie[key[depth]];
    if (!node)
      return undefined;
    else
      return Trie.find(node, key, depth + 1);
    }
};

Trie.find_partial = function(trie, key, depth) {
  var node;

  if (!depth) depth = 0;

  if (depth == key.length) {
    return trie;
  } else {
    node = trie[key[depth]];
    if (!node)
      return undefined;
    else
      return Trie.find_partial(node, key, depth + 1);
  }
};

Trie.insert = function(trie, key, val, depth) {
  var node;

  if (!depth) depth = 0;

  if (depth < key.length ) {
    node = trie[key[depth]] || (trie[key[depth]] = {});
    Trie.insert(node, key, val, depth + 1);
  } else {
    trie.v = val;
  }
};

Trie.inner_prod = function(trie1, trie2) {
  var res = 0.0;
  var node;
  var key;

  if (trie1.v && trie2.v)
    res += trie1.v * trie2.v;
  for (key in trie1) {
    if (key == "v") continue;
    node = trie2[key];
    if (node)
      res += Trie.inner_prod(trie1[key], node);
  }
  return res;
};

Trie.add_coef = function(trie1, trie2, coef, def) {
  // calc trie1 + trie2 * coef
  // def = default value

  var key, node;
  def = def || 0.0;

  if (trie2.v) {
    trie1.v = (trie1.v || def) + trie2.v * coef;
  }

  for (key in trie2) {
    if (key == "v") continue;
      node = trie1[key] || (trie1[key] = {});
      Trie.add_coef(node, trie2[key], coef, def);
  }
};

Trie.mult = function(trie1, trie2) {
  // calc trie1 * trie 2 (element wise multiplication)

  var key;
  if (trie1.v && trie2.v)
    trie1.v *= trie2.v;

  for (key in trie2) {
    if (key == "v") continue;
    if (key in trie1)
      Trie.mult(trie1[key], trie2[key]);
  }
};

Trie.copy = function(trie) {
  // make a deep copy of trie
  var new_trie = {}, key;
  for (key in trie) {
    if (key == "v")
      new_trie.v = trie.v;
    else
      new_trie[key] = Trie.copy(trie[key]);
  }
  return new_trie;
};

Trie.toString = function(trie, path) {
  var key;
  var res = "";
  if (!path) path = [];
  for (key in trie) {
    if (key == "v")
      res += path.join(" ") + "\t" + trie.v + "\n";
    else
      res += Trie.toString(trie[key], path.concat([key]));
  }
  return res;
};

Trie.each = function(trie, callback, path) {
  // calls the callback function (with two arguments)
  // for each pair of [key, value] in this trie
  var key;

  if (!path) path = [];
  for (key in trie) {
    if (key == "v")
      callback(path, trie.v);
     else
      Trie.each(trie[key], callback, path.concat([key]));
  }
};

RakutenMA.Trie = Trie;

// Soft Confidence Weighted (SCW)

var SCW = function(phi, c) {
  this.phi = phi;
  this.c = c;

  this.psi = 1.0 + phi * phi / 2;
  this.zeta = 1.0 + phi * phi;

  this.mu = {};
  this.sigma = {};
  return this;
};

SCW.prototype.calc_margin = function(x, y) {
  return y * Trie.inner_prod(this.mu, x);
};

SCW.prototype.calc_variance = function(x) {
  var ret = Trie.copy(x);
  Trie.mult(ret, this.sigma);
  return Trie.inner_prod(ret, x);
};

SCW.prototype.calc_alpha = function(margin, variance) {
  var term1 = margin * this.phi / 2;
  var alpha_denom = variance * this.zeta;
  var alpha = (-1 * margin * this.psi + this.phi * Math.sqrt(term1 * term1 + alpha_denom)) / alpha_denom;
  if (alpha < 0) return 0.0;
  return (alpha < this.c) ? alpha : this.c;
};

SCW.prototype.calc_beta = function(margin, variance, alpha) {
  var beta_numer = alpha * this.phi;
  var term1 = beta_numer * variance;
  var beta_denom = (-1 * term1 + Math.sqrt(term1 * term1 + 4 * variance)) / 2 + term1;
  return beta_numer / beta_denom;
};

SCW.prototype.update_mu_sigma = function(x, y, alpha, beta) {
  var x_sigma = Trie.copy(x), x_sigma2;

  Trie.mult(x_sigma, this.sigma);
  x_sigma2 = Trie.copy(x_sigma);
  Trie.mult(x_sigma2, x_sigma);

  Trie.add_coef(this.mu, x_sigma, alpha * y);
  Trie.add_coef(this.sigma, x_sigma2, -1 * beta, 1.0);
};

SCW.prototype.update = function(x, y) {
  var margin   = this.calc_margin(x, y);
  var variance = this.calc_variance(x);
  var alpha    = this.calc_alpha(margin, variance);
  var beta     = this.calc_beta(margin, variance, alpha);
  this.update_mu_sigma(x, y, alpha, beta);
};

// Feature selection by L1 regularization (FOBOS)
SCW.prototype.prune = function(lambda, sigma_th) {
  var new_mu = {};
  var new_sigma = {};
  var old_sigma = this.sigma;

  Trie.each(this.mu, function(key, mu_val) {
      var sigma_val = Trie.find(old_sigma, key);

      if (mu_val < -lambda) {
        Trie.insert(new_mu, key, mu_val + lambda);
        Trie.insert(new_sigma, key, sigma_val);
      } else if (mu_val > lambda) {
        Trie.insert(new_mu, key, mu_val - lambda);
        Trie.insert(new_sigma, key, sigma_val);
      } else {
        if (sigma_val < sigma_th) {
          Trie.insert(new_mu, key, 0);
          Trie.insert(new_sigma, key, sigma_val);
        }
      }
    });

  this.mu = new_mu;
  this.sigma = new_sigma;
};

RakutenMA.SCW = SCW;

// for node.js library export
if (typeof exports !== 'undefined')
    module.exports = RakutenMA;
