/* server.js */

var express = require("express");
var postgres = require("pg");
var Promise = require("promise");

var databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/hangfire";
console.log("Connecting to " + databaseUrl + "...");

function replace(instr, token, replacementFunc) {
	var outstr = "";
	while (instr) {
		var ix = instr.indexOf(token);
		if (ix < 0) {
			outstr += instr;
			instr = null;
		}
		else {
			outstr += instr.substring(0, ix);
			outstr += replacementFunc();
			instr = instr.substring(ix + 1);
		}
	}
	return outstr;
}

function escapeArg(arg) {
	if (arg == null) {
		return "NULL";
	}
	else if (typeof arg == "string") {
		return "'" + replace(arg, "'", "''") + "'";
	}
	else {
		return arg.toString();
	}
}

function bind(insql) {
	var outsql = "";
	var args = arguments;
	var argIndex = 1;
	return replace(insql, "?", function() {
		return escapeArg(args[argIndex++]);
	});
}

function query(sqlFunc, resultProcessor) {
	return new Promise(function(resolve, reject) {
		try {
			var sql = sqlFunc();
			console.log(sql);
			postgres.connect(databaseUrl, function(err, client, done) {
				if (err) {
					reject(err);
				}
				else {
					client.query(sql, function(err, result) {
						done();
						if (err) {
							reject(err);
						}
						else if (!resultProcessor) {
							resolve(result);
						}
						else if (typeof resultProcessor == "function") {
							resolve(resultProcessor(result));
						}
						else {
							resolve(resultProcessor);
						}
					});
				}
			});
		}
		catch (e) {
			reject(e);
		}
	});
	return promise;
}

function getUserByGoogleId(googleId) {
	return query(function() {
		return bind("SELECT * FROM users where google_id=?", googleId);
	}, function(result) {
		return result.rows && result.rows.length ? result.rows[0] : null;
	});
}

function insertUser(googleId, name) {
	return query(function() {
		return bind("INSERT INTO users (google_id, name) VALUES (?, ?) RETURNING *", 
			googleId, name);
	}, function(result) {
		return result.rows[0];
	});
}

function lookupUser(req) {
	return new Promise(function(resolve, reject) {
    var name = req.query.name || "Anonymous";
    var googleId = req.query.google_id;
		if (!googleId) {
			throw "required parameter missing";
		}
		getUserByGoogleId(googleId).then(function(user) {
			if (user) {
				resolve(user);
			}
			else {
				resolve(insertUser(googleId, name));
			}
		}, reject);
	});
}

var server = express();

server.set("port", process.env.PORT || 8989);

// Static assets.
server.use(express.static("www"));

// Get user info.
server.get("/u", function (req, res) {

  console.log("request", { uri: "/api", query: req.query });

	lookupUser(req).then(function(results) {
    res.json({ status: "ok", results: results });
	}, function(error) {
    res.json({ status: "error", error: error });
	});
});

server.listen(server.get("port"), function () {
  console.log("Listening on port", server.get("port"));
});
