var _ = require('lodash');
var path = require('path');
var AssetCollector = require('../../lib/asset-collector');


function stripBasePath(list, base) {

	var result = _.map(list, function (item) {
		return item.replace(base, '');
	});

	return result;
};
exports.stripBasePath = stripBasePath;


function testCollection(collection, brand, tags, cb){

	var baseDir = path.resolve(__dirname, '../content');
	var assetCollector = new AssetCollector(collection.type, collection, tags, brand, baseDir);

	assetCollector.collect().then(function (list) {

		list = stripBasePath(list, baseDir);

		cb(list);
	});
};
exports.testCollection = testCollection;