/// <reference path="node.d.ts" />

// Node imports
import path = require("path");
import fs = require("fs");

import async = require("async");

// Source map converter by thlorenz
import convert = require("convert-source-map");

function embed(compiledFile: string, cb: (err, text?: string) => void) {
	fs.readFile(compiledFile, { encoding: "utf8" }, (err, text: string) => {
		if (err) return cb(err);

		var m = embed.sourceMapUrlRegex.exec(text);

		if (!m) return cb(new embed.NoSourceMapError(compiledFile));

		var dir = path.dirname(compiledFile);

		var match = m[0];
		var sourceMapRelativeLocation = m[1];
		var sourceName = m[2];

		var sourceMapLocation = path.join(dir, sourceMapRelativeLocation);

		fs.readFile(sourceMapLocation, { encoding: "utf8" }, (err, json: string) => {
			if (err) return cb(err);

			var converter = convert.fromJSON(json);
			var sources: string[] = converter.getProperty("sources");

			async.map(sources.map(source => path.join(dir, source)), (source, callback) => fs.readFile(source, { encoding: "utf8" }, callback),
				(err, sourceContents) => {
					if (err) return cb(err);

					var newSourceMapComment = converter.setProperty("sourcesContent", sourceContents).toComment();
					var newText = text.replace(match, newSourceMapComment);
					cb(null, newText);
				});
		});
	});
}

module embed {
	export class NoSourceMapError implements Error {
		name: string = "NoSourceMap";
		message: string;

		constructor(public file: string) {
			this.message = "No sourceMappingURL comment could be found in " + this.file;
		}
	}

	export function fromFile(filePath: string, cb: (err, text?: string) => void) {
		embed(filePath, cb);
	}

	export function overwriteFile(filePath: string, cb: (err) => void) {
		embed(filePath, (err, text?) => {
			if (err) return cb(err);

			fs.writeFile(filePath, text, cb);
		});
	}

	export var sourceMapUrlRegex = /\/\/[#@] sourceMappingURL=(([\w-\.]+)\.js\.map)/;
}

export = embed;