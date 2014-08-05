// RakutenMA demo

// Load necessary libraries
var RakutenMA = require('./rakutenma');
var fs = require('fs');

// Initialize a RakutenMA instance
// with an empty model and the default ja feature set
var rma = new RakutenMA();
rma.featset = RakutenMA.default_featset_ja;

// Let's analyze a sample sentence (from http://tatoeba.org/jpn/sentences/show/103809)
// With a disastrous result, since the model is empty!
console.log(rma.tokenize("彼は新しい仕事できっと成功するだろう。"));

// Feed the model with ten sample sentences from tatoeba.com
var tatoeba = JSON.parse(fs.readFileSync("tatoeba.json"));
for (var i = 0; i < 10; i ++) {
    rma.train_one(tatoeba[i]);
}

// Now what does the result look like?
console.log(rma.tokenize("彼は新しい仕事できっと成功するだろう。"));

// Initialize a RakutenMA instance with a pre-trained model
var model = JSON.parse(fs.readFileSync("model_ja.json"));
rma = new RakutenMA(model, 1024, 0.007812);  // Specify hyperparameter for SCW (for demonstration purpose)
rma.featset = RakutenMA.default_featset_ja;

// Set the feature hash function (15bit)
rma.hash_func = RakutenMA.create_hash_func(15);

// Tokenize one sample sentence
console.log(rma.tokenize("うらにわにはにわにわとりがいる"));

// Re-train the model feeding the right answer (pairs of [token, PoS tag])
var res = rma.train_one(
        [["うらにわ","N-nc"],
         ["に","P-k"],
         ["は","P-rj"],
         ["にわ","N-n"],
         ["にわとり","N-nc"],
         ["が","P-k"],
         ["いる","V-c"]]);
// The result of train_one contains:
//   sys: the system output (using the current model)
//   ans: answer fed by the user
//   update: whether the model was updated
console.log(res);

// Now what does the result look like?
console.log(rma.tokenize("うらにわにはにわにわとりがいる"));
