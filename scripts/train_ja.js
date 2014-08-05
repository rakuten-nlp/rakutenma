var RakutenMA = require('../rakutenma');
var fs = require('fs');

var rma = new RakutenMA();
rma.featset = RakutenMA.default_featset_ja;
rma.hash_func = RakutenMA.create_hash_func(15);

var rcorpus = JSON.parse(fs.readFileSync( process.argv[2]));

console.error( "total sents = " + rcorpus.length );

var iter = parseInt(process.argv[4]);

for (var k = 0; k < iter; k ++) {
    console.error("iter = " + k);
    for (var i in rcorpus) {
	var res = rma.train_one(rcorpus[i]);
	if (i % 100 == 0)
	    console.error("  train i = " + i);
    }
}

fs.writeFile(process.argv[3], JSON.stringify(rma.model));
