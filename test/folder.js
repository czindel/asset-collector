var utils = require('./util/utils');
var assert = require("assert");


var collection = {
	"type" : "less",
		"locations" : {
		"folder/" : {
			"pattern" : "folder",
				// only include/exclude for complete module is possible
				"exclude": ["brand_2"],
				"include": ["brand_1"]
		}
	}
};

describe('folder', function () {
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
					'/folder/a.less',
					'/folder/c.less',
					'/folder/subfolder/c.less'
				];
				assert.deepEqual(result, expected);
			});

			it('should not contain brand files', function(){
				var expected = [
					'/folder/a.less',
					'/folder/c.less',
					'/folder/subfolder/c.less'
				];
				assert.deepEqual(result, expected);
			});
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

	describe('brand_x', function(){

		describe('single exclude', function(){
			var result;
			var collectionSingleExclude = {
				"type" : "less",
				"locations" : {
					"folder/" : {
						"pattern" : "folder",
						"exclude": {
							"subfolder/c.less": ['brand_1'],
							"a.less": ['brand_1']
						}
					}
				}
			};

			before(function (done) {
				utils.testCollection(collectionSingleExclude, 'brand_1', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function(){
				var expected = [
					'/folder/c.less'
				];
				assert.deepEqual(result, expected);
			});
		});

		describe('single include', function(){
			var result;
			var collectionSingleInclude = {
				"type" : "less",
				"locations" : {
					"folder/" : {
						"pattern" : "folder",
						"include": {
							"subfolder/c.less": ['brand_1']
						}
					}
				}
			};

			before(function (done) {
				utils.testCollection(collectionSingleInclude, 'brand_2', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function(){
				var expected = [
					'/folder/a.less',
					'/folder/c.less'
				];
				assert.deepEqual(result, expected);
			});
		});
	});
});
