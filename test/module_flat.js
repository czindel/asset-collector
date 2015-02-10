var utils = require('./util/utils');

var assert = require("assert");

var collection = {
	"type": "less",
	"locations": {
		"module_flat/": {
			"pattern": "module_flat"
		}
	}
};

var collectionIncludeBrand = {
	"type": "less",
	"locations": {
		"module_flat/": {
			"pattern": "module_flat",
			"include": ['brand_1']
		}
	}
};


describe('module_flat', function () {
	describe('brand_1', function () {
		describe('no tags', function () {
			var result;

			before(function (done) {
				utils.testCollection(collection, 'brand_1', [], function (list) {
					result = list;
					done();
				})
			});

			it('should contain files without tag', function () {
				var expected = [
					'/module_flat/brands/brand_1/a.less',
					'/module_flat/c.less',
					'/module_flat/subfolder/c.less',
					'/module_flat/brands/brand_1/b.less'
				];
				assert.deepEqual(result, expected);
			})
		});

		describe('tag "x"', function () {
			var result;

			before(function (done) {
				utils.testCollection(collection, 'brand_1', ['x'], function (list) {
					result = list;
					done();
				})
			});

			it('should contain files with correct tag', function () {
				var expected = [
					'/module_flat/brands/brand_1/a@x.less',
					'/module_flat/d@x.less',
					'/module_flat/brands/brand_1/e@x.less'
				];
				assert.deepEqual(result, expected);
			})
		});

		describe('no tags include', function () {
			var result;

			before(function (done) {
				utils.testCollection(collectionIncludeBrand, 'brand_1', [], function (list) {
					result = list;
					done();
				})
			});

			it('should contain files without tag', function () {
				var expected = [
					'/module_flat/brands/brand_1/a.less',
					'/module_flat/c.less',
					'/module_flat/subfolder/c.less',
					'/module_flat/brands/brand_1/b.less'
				];
				assert.deepEqual(result, expected);
			})
		});
	});

	describe('brand_2', function () {
		describe('no tags exclude brand', function () {
			var result;

			var collectionExcludeBrand = {
				"type": "less",
				"locations": {
					"module_flat/": {
						"pattern": "module_flat",
						"exclude": ['brand_2']
					}
				}
			};

			before(function (done) {
				utils.testCollection(collectionExcludeBrand, 'brand_2', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function () {
				var expected = [];
				assert.deepEqual(result, expected);
			})
		});

		describe('no tags exclude files', function () {
			var result;

			var collectionExcludeSingle = {
				"type": "less",
				"locations": {
					"module_flat/": {
						"pattern": "module_flat",
						"exclude": {
							"a.less": ['brand_2'],
							"subfolder/c.less": ['brand_2']
						}
					}
				}
			};

			before(function (done) {
				utils.testCollection(collectionExcludeSingle, 'brand_2', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function () {
				var expected = [
					'/module_flat/c.less'
				];
				assert.deepEqual(result, expected);
			})
		});

		describe('no tags include', function () {
			var result;

			before(function (done) {
				utils.testCollection(collectionIncludeBrand, 'brand_2', [], function (list) {
					result = list;
					done();
				})
			});

			it('should be empty', function () {
				var expected = [];
				assert.deepEqual(result, expected);
			})
		});
	});
});
