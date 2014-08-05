var fs = require('fs');

var model_str = fs.readFileSync( process.argv[2] );
fs.writeFile( process.argv[3], "var model = " + model_str + ";" );
