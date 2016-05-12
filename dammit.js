// DAtabase Maintenance and MIgration Tool

var postgres = require("pg");
var fs = require("fs");
var LineReader = require("./utils/linereader").LineReader;

var args = require("yargs").argv;

var databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/hang-fire";
console.log("Connecting to " + databaseUrl + "...");

postgres.connect(databaseUrl, function(err, client) {

	if (err) {
		console.log(err);
		process.exit(1);
	}

	var execQueue = [];
	var allMigrations = [];
	var appliedMigrations = [];

	function queryOrBust(sql, callback) {

		client.query(sql, function(err, result) {

			if (err) {
				console.log(err);
				process.exit(1);
			}

			callback(result);
		});
	}

	function checkMigrationsTable(next) {

		queryOrBust("SELECT * FROM pg_catalog.pg_tables WHERE tablename='migrations'", function(result) {

			if (result.rows && result.rows.length) {
				next();
			}
			else {
				queryOrBust("CREATE TABLE migrations (name text, state int)", function() {
					console.log("created migrations table");
					next();
				});
			}
		});
	}

	function loadAllMigrations(next) {
		var filesInConfigDb = fs.readdirSync("config/db/migrations");
		if (filesInConfigDb) {
			for (var i = 0; i < filesInConfigDb.length; ++i) {
				if (/^.+\.sql$/.test(filesInConfigDb[i])) {
					allMigrations.push(filesInConfigDb[i]);
				}
			}
		}
		allMigrations.sort();
		setTimeout(next, 1);
	}

	function loadAppliedMigrations(next) {

		queryOrBust("SELECT * FROM migrations", function(result) {
			if (result.rows) {
				for (var i = 0; i < result.rows.length; ++i) {
					appliedMigrations.push(result.rows[i].name);
				}
			}
			appliedMigrations.sort();
			next();
		});
	}

	function createMigrationPlan(next) {
		var n = 0;
		for (; n < Math.min(allMigrations.length, appliedMigrations.length); ++n) {
			if (allMigrations[n] != appliedMigrations[n])
				break;
		}
		for (var i = appliedMigrations.length; --i >= n; ) {
			if (!allMigrations.contains(appliedMigrations[i])) {
				console.log("applied migration " + appliedMigrations[i] + " is missing and cannot be undone");
				process.exit(1);
			}
			execQueue.push(downgradeFunction(appliedMigrations[i]));
		}
		for (var i = n; i < allMigrations.length; ++i) {
			execQueue.push(upgradeFunction(allMigrations[i]));
		}
		setTimeout(next, 1);
	}

	function upgradeFunction(migration) {

		return function(next) {

			console.log("upgrading", migration + "...");

			var lineReader = new LineReader("config/db/migrations/" + migration);
			var sql = "";
			var line;
			var funcbuf = [
				runStatementFunction("INSERT INTO migrations (name, state) VALUES ('" + migration + "', 0)")
			];

			while ((line = lineReader.readLine()) != null) {
				if (!line.length) {
					if (sql.length) {
						funcbuf.push(runStatementFunction(sql));
						sql = "";
					}
				}
				else {
					sql += line;
				}
			}
			if (sql.length) {
				funcbuf.push(runStatementFunction(sql));
			}
			funcbuf.push(runStatementFunction("UPDATE migrations SET state=1 WHERE name='" + migration + "'"));

			lineReader.close();
			execQueue = funcbuf.concat(execQueue);
			setTimeout(next, 1);
		};
	}

	function downgradeFunction(migration) {
		return function(next) {
			console.log("downgrading", migration, "(not implemented)");
			next();
		};
	}

	function runStatementFunction(sql) {
		return function(next) {
			console.log("  " + sql);
			queryOrBust(sql, next);
		};
	}

	execQueue.push(checkMigrationsTable);
	execQueue.push(loadAllMigrations);
	execQueue.push(loadAppliedMigrations);
	execQueue.push(createMigrationPlan);

	(function go() {
		while (execQueue.length) {
			var f = execQueue.shift();
			if (f) {
				f(go);
				return;
			}
		}
		process.exit(0);
	})();
});
