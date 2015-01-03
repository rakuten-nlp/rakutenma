# Rakuten MA

[English README (英語ドキュメント)](https://github.com/rakuten-nlp/rakutenma/blob/master/README.md)

## はじめに

Rakuten MA (mophological analyzer; 形態素解析器) は、100% JavaScript で書かれた、日本語・中国語用の形態素解析（単語の分かち書き＋品詞付与）ツールです。

注：分かち書き、品詞、原形付与を総称して形態素解析と呼び、Rakuten MA は正確には形態素解析ではありませんが、日本語圏における分かりやすさを優先してこの名称を使っています。

Rakuten MA には、以下のような特徴があります：
  - 100% JavaScript による実装。ほとんどのブラウザや Node.js 上で動きます。
  - 言語非依存の文字タギングモデルを採用。日本語・中国語の単語の分かち書きおよび品詞付与ができます。
  - オンライン機械学習  (Soft Confidence Weighted, Wang et al. ICML 2012) を使い、解析モデルの差分アップデートが可能。
  - 素性セットのカスタマイズが可能。
  - モデルサイズ削減のため、素性ハッシング、量子化、フィルタリングをサポート。
  - 一般分野のコーパス (BCCWJ [Maekawa 2008] と CTB [Xue et al. 2005]) およびネットショッピング分野のコーパスから学習したモデルを同梱。

## デモ

[こちらのページ](http://rakuten-nlp.github.io/rakutenma/) から、Rakuten MA のデモを試すことができます。 (ロードに少し時間がかかります)

## 使い方

### ダウンロードとインストール

Since Rakuten MA is a JavaScript library, there's no need for installation. Clone the git repository as

    git clone https://github.com/rakuten-nlp/rakutenma.git

or download the zip archive from here: https://github.com/rakuten-nlp/rakutenma/archive/master.zip

If you have Node.js installed, you can run the demo by

    node demo.js

which is identical to the usage example below.

### npm パッケージ

You can also use Rakuten MA as an npm package. You can install it by:

    npm install rakutenma

The model files can be found under `node_modules/rakutenma/`.

### Node.js における使用例

    // RakutenMA デモ

    // 必要なライブラリをロード
    var RakutenMA = require('./rakutenma');
    var fs = require('fs');

    // RakutenMA のインスタンスを初期化
    // (空のモデルと、日本語のデフォルト素性セットを使用)
    var rma = new RakutenMA();
    rma.featset = RakutenMA.default_featset_ja;

    // サンプル文を解析 (from http://tatoeba.org/jpn/sentences/show/103809)
    // → モデルが空のため、正確な分かち書きができない
    console.log(rma.tokenize("彼は新しい仕事できっと成功するだろう。"));

    // tatoeba.com から10文をモデルに与えて学習
    var tatoeba = JSON.parse(fs.readFileSync("tatoeba.json"));
    for (var i = 0; i < 10; i ++) {
        rma.train_one(tatoeba[i]);
    }

    // 再度解析 → 結果が少し改善
    console.log(rma.tokenize("彼は新しい仕事できっと成功するだろう。"));

    // RakutenMA インスタンスを、学習済みモデルを使って初期化
    var model = JSON.parse(fs.readFileSync("model_ja.json"));
    rma = new RakutenMA(model, 1024, 0.007812);  // SCW のハイパーパラメータを指定
    rma.featset = RakutenMA.default_featset_ja;

    // 素性ハッシング関数 (15bit) を指定
    rma.hash_func = RakutenMA.create_hash_func(15);

    // サンプル文を解析
    console.log(rma.tokenize("うらにわにはにわにわとりがいる"));

    // 望む解析結果 ([トークン, 品詞タグ]の列) を与えて再学習
    var res = rma.train_one(
            [["うらにわ","N-nc"],
             ["に","P-k"],
             ["は","P-rj"],
             ["にわ","N-n"],
             ["にわとり","N-nc"],
             ["が","P-k"],
             ["いる","V-c"]]);
    // train_one() の戻り値には、以下が含まれる：
    //   sys: 現在のモデルに基づくシステムの出力
    //   ans: ユーザのあたえた正解
    //   update: モデルが更新されたかどうかのフラグ
    console.log(res);

    // 再度解析
    console.log(rma.tokenize("うらにわにはにわにわとりがいる"));

### ブラウザ上での使用例

Include the following code snippet in the `<head>` of your HTML.

    <script type="text/javascript" src="rakutenma.js" charset="UTF-8"></script>
    <script type="text/javascript" src="model_ja.js" charset="UTF-8"></script>
    <script type="text/javascript" src="hanzenkaku.js" charset="UTF-8"></script>
    <script type="text/javascript" charset="UTF-8">
      function Segment() {

        rma = new RakutenMA(model);
        rma.featset = RakutenMA.default_featset_ja;
        rma.hash_func = RakutenMA.create_hash_func(15);

        var textarea = document.getElementById("input");
        var result = document.getElementById("output");
        var tokens = rma.tokenize(HanZenKaku.hs2fs(HanZenKaku.hw2fw(HanZenKaku.h2z(textarea.value))));

        result.style.display = 'block';
        result.innerHTML = RakutenMA.tokens2string(tokens);
      }

    </script>

The analysis and result looks like this:

    <textarea id="input" cols="80" rows="5"></textarea>
    <input type="submit" value="Analyze" onclick="Segment()">
    <div id="output"></div>


### 学習済みモデルを使って日本語・中国語の文を解析

1. Load an existing model, e.g., `model = JSON.parse(fs.readFileSync("model_file"));` then `rma = new RakutenMA(model);` or `rma.set_model(model);`
2. Specify `featset` depending on your langage (e.g., `rma.featset = RakutenMA.default_featset_zh;` for Chinese and `rma.featset = RakutenMA.default_featset_ja;` for Japanese).
3. Remember to use 15-bit feature hashing function (`rma.hash_func = RakutenMA.create_hash_func(15);`) when using the bundled models (`model_zh.json` and `model_ja.json`).
4. Use `rma.tokenize(input)` to analyze your input.

### オリジナルの解析モデルの学習

1. Prepare your training corpus (a set of training sentences where a sentence is just an array of correct [token, PoS tag].)
2. Initialize a RakutenMA instance with `new RakutenMA()`.
3. Specify `featset`. (and optionally, `ctype_func`, `hash_func`, etc.)
4. Feed your training sentences one by one (from the first one to the last) to the `train_one(sent)` method.
5. Usually SCW converges enough after one `epoch` (one pass through the entire training corpus) but you can repeat Step 4. to achieve even better performance.

See `scripts/train_zh.js` (for Chinese) and `scripts/train_ja.js` (for Japanese) to see an example showing how to train your own model.

### 学習済みモデルの再学習 (分野適応、エラー修正等)

1. Load an existing model and initialize a RakutenMA instance. (see "Using bundled models to analyze Chinese/Japanese sentences" above)
2. Prepare your training data (this could be as few as a couple of sentences, depending on what and how much you want to "re-train".)
3. Feed your training sentences one by one to the `train_one(sent)` method.

### モデルサイズの削減

The model size could still be a problem for client-side distribution even after applying feature hashing.
We included a script `scripts/minify.js` which applies feature quantization
(see [Hagiwara and Sekine COLING 2014] for the details) to reduce the trained model size.

You can run it `node scripts/minify.js [input_model_file] [output_model_file]` to make a minified version of the model file.
*Remember:* it also deletes the "sigma" part of the trained model, meaning that you are no longer able to re-train the minified model. If necessary, re-train the model first, then minify it.

## API ドキュメント

| Constructor                 | Description                                 |
| ----------------------------| ------------------------------------------- |
| `RakutenMA(model, phi, c)`    | Creates a new RakutenMA instance. `model` (optional) specifies the model object to initialize the RakutenMA instance with. `phi` and `c` (both optional) are hyper parameters of SCW (default: `phi = 2048`, `c = 0.003906`).  |


| Methods                     | Description                                 |
| ----------------------------| ------------------------------------------- |
| `tokenize(input)`           | Tokenizes `input` (string) and returns tokenized result ([token, PoS tag] pairs).  |
| `train_one(sent)`           | Updates the current model (if necessary) using the given answer `sent` ([token, PoS tag] pairs).  The return value is an object with three properties `ans`, `sys`, and `updated`, where `ans` is the given answer (same as `sent`), `sys` is the system output using the (old) model, and `updated` is a binary (True/False) flag meaning whether the model was updated (because `sys` was different from `ans`) or not.|
| `set_model(model)`          | Sets the Rakuten MA instance's model to `model`. |
| `set_tag_scheme(scheme)`    | Sets the sequential labeling tag scheme. Currently, `"IOB2"` and `"SBIEO"` are supported.  Specifying other tag schemes causes an exception. |

| Properties                  | Description                                 |
| ----------------------------| ------------------------------------------- |
| `featset`                   | Specifies an array of feature templates (string) used for analysis. You can use `RakutenMA.default_featset_ja` and `RakutenMA.default_featset_zh` as the default feature sets for Japanese and Chinese, respectively. See below ("Supported feature templates") for the details of feature templates. |
| `ctype_func`                | Specifies the function used to convert a character to its character type. `RakutenMA.ctype_ja_default_func` is the default character type function used for Japanese. Alternatively, you can call `RakutenMA.create_ctype_chardic_func(chardic)` to create a character type function which takes a character to look it up in `chardic` and return its value. (For example, `RakutenMA.create_ctype_chardic_func({"A": "type1"})` returns a function `f` where `f("A")` returns `"type1"` and `[]` otherwise.) |
| `hash_func`                 | Specifies the hash function to use for feature hashing. Default = `undefined` (no feature hashing). A feature hashing function with `bit`-bit hash space can be created by calling `RakutenMA.create_hash_func(bit)`. |


## 利用規約・ライセンス

Distribution, modification, and academic/commercial use of Rakuten MA is permitted, provided that
you conform with Apache License version 2.0 http://www.apache.org/licenses/LICENSE-2.0.html.

If you are using Rakuten MA for research purposes, please cite our paper on Rakuten MA [Hagiwara and Sekine 2014]


## よくある質問

Q. What are supported browsers and Node.js versions?

 - A. We confirmed that Rakuten MA runs in the following environments:
  - Internet Explorer 8 (ver. 8.0.7601.17414 or above)
  - Google Chrome (ver. 35.0.1916.153 or above)
  - Firefox (ver. 16.0.2 or above)
  - Safari (ver. 6.1.5 or above)
  - Node.js (ver. 0.10.13 or above)

Q. Is commercial use permitted?
- A. Yes, as long as you follow the terms and conditions. See "Terms and Conditions" above for the details.

Q. I found a bug / analysis error / etc. Where should I report?
- A. Please create an issue at Github issues https://github.com/rakuten-nlp/rakutenma/issues.
- Alternatively, you can create a pull request if you modify the code. Rakuten MA has a test suite using Jasmine http://jasmine.github.io/. Please make sure all the tests pass (no errors after running `jasmine-node spec`) and write your own (if necessary) before submitting a pull request.
- Finally, if your question is still not solved, please contact us at prj-rakutenma [at] mail.rakuten.com.

Q. Tokenization results look strange (specifically, the sentence is split up to individual characters with no PoS tags)
- A. Check if you are using the same feature set (`featset`) and the feature hashing function (`hash_func`) used for training. Remember to use 15-bit feature hashing function (`rma.hash_func = RakutenMA.create_hash_func(15);`) when using the bundled models (`model_zh.json` and `model_ja.json`).

Q. What scripts (Simplified/Traditional) are supported for Chinese?
- A. Currently only simplified Chinese is supported.

Q. Can we use the same model file in the JSON format for browsers?
- A. Yes and no. Although internal data structure of models is the same, you need to add assignment (e.g., `var model = [JSON representation];`) in order to refer to it on browsers. See the difference between `model_zh.json` (for Node.js) and `model_zh.js` (for browsers). There is a mini script `scripts/convert_for_browser.js` which does this for you. We recommend you work on Node.js for model training etc. and then convert it for browser uses.

## 付録

### 対応している素性テンプレート

| Feature template | Description                   |
| ---------------- | ----------------------------- |
| w7               | Character unigram (c-3)       |
| w8               | Character unigram (c-2)       |
| w9               | Character unigram (c-1)       |
| w0               | Character unigram (c0)        |
| w1               | Character unigram (c+1)       |
| w2               | Character unigram (c+2)       |
| w3               | Character unigram (c+3)       |
| c7               | Character type unigram (t-3)       |
| c8               | Character type unigram (t-2)       |
| c9               | Character type unigram (t-1)       |
| c0               | Character type unigram (t0)        |
| c1               | Character type unigram (t+1)       |
| c2               | Character type unigram (t+2)       |
| c3               | Character type unigram (t+3)       |
| b7               | Character bigram (c-3 c-2)       |
| b8               | Character bigram (c-2 c-1)       |
| b9               | Character bigram (c-1 c0)       |
| b1               | Character bigram (c0 c+1)       |
| b2               | Character bigram (c+1 c+2)       |
| b3               | Character bigram (c+2 c+3)       |
| d7               | Character type bigram (t-3 t-2)       |
| d8               | Character type bigram (t-2 t-1)       |
| d9               | Character type bigram (t-1 t0)       |
| d1               | Character type bigram (t0 t+1)       |
| d2               | Character type bigram (t+1 t+2)       |
| d3               | Character type bigram (t+2 t+3)       |
| others           | If you specify a customized feature function in the `featset` array, the function will be called with two arguments `_t` and `i`, where `_t` is a function which takes a position `j` and returns the character object at that position, and `i` is the current position. A character object is an object with two properties `c` and `t` which are character and character type, respectively. The return value of that function is used as the feature value. (For example, if you specify a function `f(_t, i)` which `returns _t[i].t;`, then it's returning the character type of the current position, which is basically the same as the template `c0`. )|

### PoS tag list in Chinese

| Tag  | Description      |
| ---  | ---------------- |
| AD   | Adverb           |
| AS   | Aspect Particle  |
| BA   | ba3 (in ba-construction) |
| CC   | Coordinating conjunction |
| CD   | Cardinal number  |
| CS   | Subordinating conjunction |
| DEC  | de5 (Complementizer/Nominalizer) |
| DEG  | de5 (Genitive/Associative) |
| DER  | de5 (Resultative) |
| DEV  | de5 (Manner) |
| DT   | Determiner |
| ETC  | Others |
| FW   | Foreign word |
| IJ   | Interjection |
| JJ   | Other noun-modifier |
| LB   | bei4 (in long bei-construction) |
| LC   | Localizer |
| M    | Measure word |
| MSP  | Other particle |
| NN   | Other noun |
| NN-SHORT | Other noun (abbrev.) |
| NR   | Proper noun |
| NR-SHORT | Proper noun (abbrev.) |
| NT   | Temporal noun |
| NT-SHORT | Temporal noun (abbrev.) |
| OD   | Ordinal number |
| ON   | Onomatopoeia |
| P    | Preposition |
| PN   | Pronoun |
| PU   | Punctuation |
| SB   | bei4 (in short bei-construction) |
| SP   | Sentence-final Particle |
| URL  | URL |
| VA   | Predicative adjective |
| VC   | Copula |
| VE   | you3 (Main verb) |
| VV   | Other verb |
| X    | Others |

### PoS tag list in Japanese and correspondence to BCCWJ tags

| Tag  | Original JA name | English             |
| ---  | ---------------- | ------------------  |
| A-c  | 形容詞-一般       | Adjective-Common    |
| A-dp | 形容詞-非自立可能  | Adjective-Dependent |
| C    | 接続詞            | Conjunction         |
| D    | 代名詞            | Pronoun             |
| E    | 英単語            | English word        |
| F    | 副詞              | Adverb              |
| I-c  | 感動詞-一般        | Interjection-Common |
| J-c  | 形状詞-一般        | Adjectival Noun-Common |
| J-tari | 形状詞-タリ      | Adjectival Noun-Tari |
| J-xs | 形状詞-助動詞語幹   | Adjectival Noun-AuxVerb stem |
| M-aa | 補助記号-AA        | Auxiliary sign-AA |
| M-c  | 補助記号-一般      | Auxiliary sign-Common |
| M-cp | 補助記号-括弧閉    | Auxiliary sign-Open Parenthesis |
| M-op | 補助記号-括弧開    | Auxiliary sign-Close Parenthesis |
| M-p  | 補助記号-句点      | Auxiliary sign-Period |
| N-n  | 名詞-名詞的        | Noun-Noun |
| N-nc | 名詞-普通名詞      | Noun-Common Noun |
| N-pn | 名詞-固有名詞      | Noun-Proper Noun |
| N-xs | 名詞-助動詞語幹    | Noun-AuxVerb stem |
| O    | その他            | Others            |
| P    | 接頭辞             | Prefix |
| P-fj | 助詞-副助詞        | Particle-Adverbial |
| P-jj | 助詞-準体助詞      | Particle-Phrasal |
| P-k  | 助詞-格助詞        | Particle-Case Marking |
| P-rj | 助詞-係助詞        | Particle-Binding |
| P-sj | 助詞-接続助詞      | Particle-Conjunctive |
| Q-a  | 接尾辞-形容詞的    | Suffix-Adjective |
| Q-j  | 接尾辞-形状詞的    | Suffix-Adjectival Noun |
| Q-n  | 接尾辞-名詞的      | Suffix-Noun |
| Q-v  | 接尾辞-動詞的      | Suffix-Verb |
| R    | 連体詞            | Adnominal adjective |
| S-c  | 記号-一般         | Sign-Common |
| S-l  | 記号-文字         | Sign-Letter  |
| U    | URL              | URL         |
| V-c  | 動詞-一般         | Verb-Common |
| V-dp | 動詞-非自立可能    | Verb-Dependent |
| W    | 空白              | Whitespace |
| X    | 助動詞            | AuxVerb |

## 謝辞

The developers would like to thank Satoshi Sekine, Satoko Marumoto, Yoichi Yoshimoto, Keiji Shinzato, Keita Yaegashi, and Soh Masuko for
their contribution to this project.

## 参考文献

Masato Hagiwara and Satoshi Sekine. Lightweight Client-Side Chinese/Japanese Morphological Analyzer Based on Online Learning. COLING 2014 Demo Session, pages 39-43, 2014. [[PDF](http://anthology.aclweb.org/C/C14/C14-2009.pdf)]

Kikuo Maekawa. Compilation of the Kotonoha-BCCWJ corpus (in Japanese). Nihongo no kenkyu (Studies in Japanese), 4(1):82–95, 2008.
(Some English information can be found [here](http://www2.ninjal.ac.jp/kikuo/Yonsei_KM20070129.pdf).) [[Site](http://www.ninjal.ac.jp/corpus_center/bccwj/)]

Jialei Wang, Peilin Zhao, and Steven C. Hoi. Exact soft confidence-weighted learning. In Proc. of ICML 2012, pages 121–128, 2012. [[PDF](http://icml.cc/2012/papers/86.pdf)]

Naiwen Xue, Fei Xia, Fu-dong Chiou, and Marta Palmer. The Penn Chinese treebank: Phrase structure
annotation of a large corpus. Natural Language Engineering, 11(2):207–238, 2005. [[PDF](http://verbs.colorado.edu/~mpalmer/papers/ctb.pdf)] [[Site](https://catalog.ldc.upenn.edu/LDC2010T07)]

---

&copy; 2014 Rakuten NLP Project. All Rights Reserved. / Sponsored by [Rakuten, Inc.](http://global.rakuten.com/corp/) and [Rakuten Institute of Technology](http://rit.rakuten.co.jp/).
