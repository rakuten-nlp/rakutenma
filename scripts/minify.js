var RakutenMA = require('../rakutenma');
var fs = require('fs');
var Trie = RakutenMA.Trie;

var model = JSON.parse( fs.readFileSync( process.argv[2] ) );

var new_mu = {};
Trie.each( model.mu,
	   function( key, mu_val ) {
	       var new_mu_val = Math.round( mu_val * 1000 );
	       if (new_mu_val != 0)
		   Trie.insert(new_mu, key, new_mu_val);
	       // console.log( [key, mu_val, new_mu_val] );
	   }
	 );

model = {mu: new_mu};

// write out the final file
fs.writeFile( process.argv[3], JSON.stringify(model));
