
var read = require('read');

const util = require('util');

var stdlib = require('./stdlib.js')
var Engine = require('./engine.js')


var e = new Engine('ald.peg');
var sl = new stdlib(e);

e.sl = sl;






if (process.argv.length >= 3) {
  var contents = require('fs').readFileSync(process.argv[2], "utf8");

  repl = false;

  var context = {};

  var tree = parser.parse(contents);
  parse(tree);
} else {
  prompt();
}

function prompt() {
  read({ prompt: ' >'}, function(err, str) {
    e.parse(str).then(function(result) {
      parse(result);
    }).catch(function(err) {
      var reason = err.found === null ? 'end of input' : '"' + err.found + '"';
      console.log('syntax error: unexpected ' + reason);
      prompt();
    });
  });
}

function parse(tree) {
  var context = {};


  e.promise(tree, context).then(function(result) {
    console.log(typeof result === "function" ? '(fn ' + result.name + ')' : result);
    prompt();
  }).catch(function(err) {
    console.log(err);
    prompt();
  });

  // console.log(util.inspect(tree, { depth: null }));
}





function a(t) {
  
}