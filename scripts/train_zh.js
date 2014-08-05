var RakutenMA = require('../rakutenma');
var fs = require('fs');

var rma = new RakutenMA();
rma.ctype_func = RakutenMA.create_ctype_chardic_func(JSON.parse(fs.readFileSync("zh_chardic.json")));
rma.featset = RakutenMA.default_featset_zh;
// rma.featset = rma.featset.concat(["t0", "t1", "t9"]);
rma.hash_func = RakutenMA.create_hash_func( 15 );

var rcorpus = JSON.parse(fs.readFileSync(process.argv[2]));

console.error("total sents = " + rcorpus.length);

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
