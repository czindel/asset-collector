var utils = require('./util/utils');
var assert = require("assert");


var collection = {
	"type" : "less",
		"locations" : {
		"module/" : {
			"pattern" : "module",
				// only include/exclude for complete module is possible
				"exclude": ["brand_2"],
				"include": ["brand_1"]
		}
	}
};

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
				'/module/brands/brand_1/less/a.less',
				'/module/less/c.less',
				'/module/brands/brand_1/less/b.less'
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

		it('should contain files with correct tag', function(){
			var expected = [
				'/module/brands/brand_1/less/a@x.less',
				'/module/less/d@x.less',
				'/module/brands/brand_1/less/e@x.less'
			];
			assert.deepEqual(result, expected);
		})
	});

	describe('tag "x" and "y"', function(){
		var result;

		before(function (done) {
			utils.testCollection(collection, 'brand_1', ['x', 'y'], function (list) {
				result = list;
				done();
			})
		});

		it('should contain files with correct tag', function(){
			var expected = [
				'/module/less/g@x@y.less',
				'/module/less/h@y@x.less'
			];
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
