function sl(engine) {
	this.engine = engine;
}


var isPrimitive = function(node) {
	if (v(node).type('command')) return false;
	else return true;
}

sl.prototype.fn = function fn(args, resolve, reject, context) {
	if (!args || args.length === 0) resolve(function(a, res, rej, c) {
		res();
	});

	if (args.length > 0) {
		var fn = args.slice(args.length - 1);
		var fnargs = args.slice(0, args.length - 1);

		if (isPrimitive(fn)) reject('fn: last argument should be a node');
		
		var fnargsx = fnargs.map(el => this.engine.promise(el));

		Promise.all(fnargsx).then(function(fnargsr) {
			if (fnargsr.every(el => typeof el === "string")) {

			} else reject('fn: argument names should resolve to string');
		});
	}
}

sl.prototype.wait = function wait(args, resolve, reject, context) {
	Promise.all(args.map(a => this.engine.promise(a, context))).then(function(argsx) {
		var startTime = process.hrtime();
		startTime = startTime[0] * 1000000 + startTime[1] / 1000;
		setTimeout(function() {
			var endTime = process.hrtime();
			endTime = endTime[0] * 1000000 + endTime[1] / 1000;

			if (argsx[1]) return resolve(argsx[1]);
			else return resolve((endTime - startTime) / 1000);
		}, argsx[0]);
	});
}

sl.prototype["add"] = function add(args, resolve, reject, context) {
	Promise.all(args.map(arg => this.engine.promise(arg, context))).then(function(args) {
		resolve(args.reduce((p, n) => p + n, 0));
	}).catch(function(e) {
		reject(e);
	});
}

sl.prototype["var"] = function variable(args, resolve, reject, context) {
	Promise.all(args.slice(0, 2).map(e => this.engine.promise(e, context))).then((argsx) => {
		context[argsx[0]] = [ "number", argsx[1], undefined ];
		return this.engine.promise(args[2], context);
	}).then(function(v) {
		resolve(v);
	}).catch(function(err) {
		reject(err);
	});
}



sl.prototype.resolve = function resolve(args, resolve, reject, context) {
	if (!args || args.length === 0) reject('resolve: no arguments');
	if (args.length !== 1) reject('resolve: too much arguments (expected 1, got ' + args.length + ')');

	this.engine.promise(args[0], context).then(function(value) {
		resolve(value);
	}).catch(function(err) {
		reject('resolve: ' + err);
	});
}

sl.prototype.exit = function() {
	process.exit(1);
}


module.exports = sl;