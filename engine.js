var PEG = require('pegjs');
var fs = require('fs');

function Engine(fn) {
  this.file = fs.readFileSync(fn); 
  this.parser = PEG.buildParser(this.file.toString());
}

var v = function(node) {
  return {
    type: function(ch) {
      if (!this.valid(node)) return false;
      if (ch) return node[0] === ch;
      else return node[0];
    },
    value: function(d) {
      return d ? node[1] : v(node[1]);
    },
    children: function() {
      return node[2];
    },
    valid: function() {
      return node && node.length === 3;
    }
  }
}

Engine.prototype.args = function(args, context) {
  return args.map(function(arg, i) {
    if (v(arg).type('symbol')) {
      if (v(arg).value(true) in context) {
        return context[v(arg).value(true)];
      } else return arg;
    } else return arg;
  });
}


Engine.prototype.parse = function(str) {
  return new Promise((res, rej) => {
    try {
      var r = this.parser.parse(str);
      res(r);
    } catch (e) {
      rej(e);
    }
  });
}

Engine.prototype.execute = function(node, resolve, reject, context) {
  // console.log('execute', node);
  // console.log('name', v(node).value())
  this.promise(v(node).value(true), context).then(val => {
    // console.log('value', val);
    if (typeof val === "string") {
      var args = v(node).children();
      args = this.args(args, context);
      if (val in this.sl) this.sl[val](args, resolve, reject, context);
      else reject('not found: ' + val);
    } else if (typeof val === "function") {
      val(v(node).children(), resolve, reject, context);
    }
  }).catch(function(err) {
    reject(err);
  });
}

Engine.prototype.promise = function(node, context) {
  // console.log('promise', node);
	if (v(node).type('command')) {
    return new Promise((resolve, reject) => {
      this.execute(node, resolve, reject, context);
    });
  } else  {
    return new Promise(function(resolve, reject) {
      resolve(v(node).value(true));
    });
  }
/*  } else {
    return new Promise(function(resolve) {
      resolve(node);
    });
  }*/
}

module.exports = Engine;