var utils = require('./util/utils');
var assert = require("assert");
var path = require('path');
var exec = require('child_process').exec;


var collection = {
	"type" : "js",
	"locations" : {
		"bower_components/" : {
			"pattern" : "bower",
			"bowerJson": path.resolve(__dirname, 'content/bower.json'),
		}
	}
};
var collectionExclude = {
	"type" : "js",
	"locations" : {
		"bower_components/" : {
			"pattern" : "bower",
			"bowerJson": path.resolve(__dirname, 'content/bower.json'),
			"exclude": {
				"jquery/*" : ["brand_1"]
			}
		}
	}
};

describe('bower', function () {
	describe('brand_1', function(){
		describe('install', function(){
			var result;

			before(function (done) {

				this.timeout(50000);
				exec('bower install', {cwd:path.resolve(__dirname, 'content/')}, function () {

					utils.testCollection(collection, 'brand_1', [], function (list) {
						result = list;
						done();
					})
				})
			});

			it('should have installed dependencies', function(){
				var expected = [
					'/bower_components/jquery/dist/jquery.js',
					'/bower_components/slick.js/slick/slick.min.js',
					'/bower_components/jquery-cookie/jquery.cookie.js',
					'/bower_components/bootstrap/dist/js/bootstrap.js'
				];
				assert.deepEqual(result, expected);
			})
		});

		describe('exclude', function(){
			var result;

			before(function (done) {

				this.timeout(50000);
				exec('bower install', {cwd:path.resolve(__dirname, 'content/')}, function () {

					utils.testCollection(collectionExclude, 'brand_1', [], function (list) {
						result = list;
						done();
					})
				})
			});

			it('should not contain jquery', function(){
				var expected = [
//					'/bower_components/jquery/dist/jquery.js',
					'/bower_components/slick.js/slick/slick.min.js',
					'/bower_components/jquery-cookie/jquery.cookie.js',
					'/bower_components/bootstrap/dist/js/bootstrap.js'
				];
				assert.deepEqual(result, expected);
			})
		});

	});
});
