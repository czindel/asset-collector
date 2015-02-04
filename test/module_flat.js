var collections = require('./util/collections');
var utils = require('./util/utils');

var assert = require("assert");


describe('brand_1', function(){
	describe('no tags', function(){
		var result;

		before(function (done) {
			utils.testCollection(collections['module_flat.css'], 'brand_1', [], function (list) {
				result = list;
				done();
			})
		});

		it('should contain files without tag', function(){
			var expected = [
				'/module_flat/brands/brand_1/a.less',
				'/module_flat/c.less',
				'/module_flat/subfolder/c.less',
				'/module_flat/brands/brand_1/b.less'
			];
			assert.deepEqual(result, expected);
		})
	});

	describe('tag "x"', function(){
		var result;

		before(function (done) {
			utils.testCollection(collections['module_flat.css'], 'brand_1', ['x'], function (list) {
				result = list;
				done();
			})
		});

		it('should contain files with correct tag', function(){
			var expected = [
				'/module_flat/brands/brand_1/a@x.less',
				'/module_flat/d@x.less',
				'/module_flat/brands/brand_1/e@x.less'
			];
			assert.deepEqual(result, expected);
		})
	});
});

//describe('brand_2', function(){
//	describe('no tags', function(){
//		var result;
//
//		before(function (done) {
//			utils.testCollection(collections['module.css'], 'brand_2', [], function (list) {
//				result = list;
//				done();
//			})
//		});
//
//		it('should be empty', function(){
//			var expected = [];
//			assert.deepEqual(result, expected);
//		})
//	});
//});
//
//describe('brand_3', function(){
//	describe('no tags', function(){
//		var result;
//
//		before(function (done) {
//			utils.testCollection(collections['module.css'], 'brand_3', [], function (list) {
//				result = list;
//				done();
//			})
//		});
//
//		it('should be empty', function(){
//			var expected = [];
//			assert.deepEqual(result, expected);
//		});
//	});
//});
