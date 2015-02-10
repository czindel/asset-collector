var utils = require('./util/utils');
var assert = require("assert");


var collection = {
	"type" : "less",
		"locations" : {
		"file/a.less" : {
			"pattern" : "file",
				// only include/exclude for complete module is possible
				"exclude": ["brand_2"],
				"include": ["brand_1"]
		}
	}
};

describe('file', function () {
	describe('brand_1', function(){
		describe('no tags', function(){
			var result;

			before(function (done) {
				utils.testCollection(collection, 'brand_1', [], function (list) {
					result = list;
					done();
				})
			});

			it('should contain files without tag', function(){
				var expected = [
					'/file/a.less'
				];
				assert.deepEqual(result, expected);
			})
		});

		describe('tag "x"', function(){
			var result;

			before(function (done) {
				utils.testCollection(collection, 'brand_1', ['x'], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function(){
				var expected = [];
				assert.deepEqual(result, expected);
			})
		});

	});

	describe('brand_2', function(){
		describe('no tags', function(){
			var result;

			before(function (done) {
				utils.testCollection(collection, 'brand_2', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function(){
				var expected = [];
				assert.deepEqual(result, expected);
			})
		});
	});

	describe('brand_3', function(){
		describe('no tags', function(){
			var result;

			before(function (done) {
				utils.testCollection(collection, 'brand_3', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function(){
				var expected = [];
				assert.deepEqual(result, expected);
			});
		});
});
});
