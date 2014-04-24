var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var async = require('async');

var AssetCollector = function(type, collection, tags, brand)
{
	this.fileExtension = type;
	this.collection = collection;
	this.tags = tags || [];
	this.brand = brand;
};

AssetCollector.prototype = {

	collect : function(callback)
	{
		var locationList = [];
		var resultList = {};
		_.each(this.collection.locations, function(entry, key){
			locationList.push(_.extend(entry, {
				path: key
			}));
			resultList[key] = {};
		});
		
		async.each(locationList, 
			(function(item, callback){
				this.parseSection(item, item.path, function(files){
					resultList[item.path] = files;
					callback();
				});
		}).bind(this), function(assetConfig, assetPath)
		{
			var result = _.reduce(resultList, function(memo, num){
				return memo.concat(num);
			}, []);

			callback(result);
		});
	},

	parseSection : function(assetConfig, assetPath, callback)
	{
		var modifier = _.pick(assetConfig, 'include', 'exclude');

		fs.realpath(path.join(process.cwd(), assetPath), (function(err, assetPath){
			
			if( err )
			{
				callback([]);
			}
			else
			{
				switch(assetConfig.pattern)
				{
					case 'file':
						if( this.tags.length )
						{
							callback([]);
							break;
							// Tags not supported at the moment
						}
						
						if( !fs.existsSync(assetPath) )
						{
							callback([]);
							break;
						}
						if( !this.hasValidFileEnd(assetPath, this.fileExtension) )
						{
							callback([]);
							break;
						}
						if( !this.isFileIncluded(assetPath, modifier) )
						{
							callback([]);
							break;
						}
						
						callback([assetPath]);
						break;
						
					case 'folder':
//						if( this.tags.length ) break; // Tags not supported at the moment
						this.getFolderAssets(assetPath, this.fileExtension, null, null, (function(files){
							
							callback(this.filterAssets(files, assetPath, modifier, this.fileExtension));
						}).bind(this));
						break;
						
					case 'module_flat':
						this.getModuleAssets(assetPath, this.fileExtension, '', {}, (function (result) {

							callback(this.filterAssets(result, assetPath, modifier, this.fileExtension));
						}).bind(this));
						break;
						
					case 'module':
						this.getModuleAssets(assetPath, this.fileExtension, this.fileExtension, modifier, callback);
						break;
						
					case 'package':
						this.getPackageAssets(assetPath, this.fileExtension, this.fileExtension, modifier, callback);
						break;
						
					default:
						callback([]);
						break;
				}
			}
		}).bind(this));
	},

	getModuleAssets : function(assetPath, fileExtension, subfolder, modifier, callback)
	{
		subfolder = subfolder || '';
		modifier = modifier || {};

		if( this.isFileIncluded(assetPath, modifier) )
		{
			this.getFolderAssets(assetPath, fileExtension, '', subfolder, (function(defaultFiles){
				
				var brandFiles;
				if( this.brand )
				{
					this.getFolderAssets(assetPath, fileExtension, this.brand, subfolder, (function(brandFiles){
						callback(this.mergeDefaultAndBrandFiles(defaultFiles, brandFiles, assetPath));
					}).bind(this));
				}
				else
				{
					callback(this.mergeDefaultAndBrandFiles(defaultFiles, [], assetPath));
				}
			}).bind(this));
		}
		else
		{
			callback([]);
		}
	},

	getPackageAssets : function(folder, fileExtension, subfolder, modifier, callback)
	{
		fs.exists(folder, (function(exists)
		{
			if( exists )
			{
				fs.readdir(folder, (function(err, files)
				{
					async.filter(files, function(moduleFolder, cb)
					{
						fs.stat(path.join(folder, moduleFolder), function(err, stats){
							cb(stats.isDirectory());
						});
					}, (function(modules){

						modules = _.filter(modules, function (modName) {
							return this.isModuleIncluded(modName, modifier);
						}, this);

						// results is now an array of stats for each file
						var sortedModules = modules.sort();
						async.map(sortedModules, (function(mod, cb){
							this.getModuleAssets(path.join(folder, mod), fileExtension, subfolder, modifier, function(modFiles){
								cb(null, modFiles);
							});
						}).bind(this), function(err, results){
							var packageContent = [];
							_.each(results, function(modItems)
							{
								packageContent = _.union(packageContent, modItems);
							});
							
							callback(packageContent);
						});
					}).bind(this));
				}).bind(this));
			}
			else
			{
				callback([]);
			}
		}).bind(this))
	},

	getFolderAssets : function(assetFolder, fileExtension, brand, subfolder, callback)
	{
		brand = brand || '';
		subfolder = subfolder || '';

		if( brand )
		{
			assetFolder = path.join(assetFolder, 'brands', brand);
		}

		if( subfolder )
		{
			assetFolder = path.join(assetFolder, subfolder);
		}

		this.collectDirContentByType(assetFolder, fileExtension, -1, (function(assets){
			callback(this.filterFilesByTags(assets, fileExtension));
		}).bind(this));
	},

	collectDirContentByType : function(folder, fileExtension, depth, callback)
	{
		this.collectFiles(folder, fileExtension, (function(err, entries)
		{
			if( err )
			{
				// ENOENT -> No such file or directory
				if( err.code !== 'ENOENT')
				{
					console.log(err)
				}

				callback([]);
			}
			else
			{
				var fullPathEntries = this.getFullPath(folder, entries.sort());
				
				if( depth === 0 )
				{
					callback(fullPathEntries); // max depth reached
				}
				else
				{
					this.collectSubDirs(folder, (function(dirEntries)
					{
						if( dirEntries.length === 0)
						{
							callback(fullPathEntries); // no more deeper folder
						}
						else
						{
							dirEntries.sort();
							
							async.map(dirEntries, (function(dir, callbackDirContent)
							{
								var subFolder = path.join(folder + path.sep + dir);
								this.collectDirContentByType(subFolder, fileExtension, depth - 1, function(subFiles)
								{
									callbackDirContent(null, subFiles);
								});
							}).bind(this), (function(err, results)
							{
								var combined = _.reduce(results, function(memo, entry){
									return memo.concat(entry);
								}, fullPathEntries);
										
								callback(combined);
							}).bind(this))
						}
					}).bind(this));
				}
			}
		}).bind(this));
	},
	
	getFullPath : function(folder, entries)
	{
		return _.map(entries, function(entry)
		{
			return path.join(folder, entry);
		});
	},
	
	collectFiles : function(dir, fileExtension, callback)
	{
		fs.readdir(dir, (function(err, files)
		{
			if( !err )
			{
				async.filter(files, (function(item, callbackFileFilter)
				{
					fs.stat(path.join(dir, item), (function(err, stats)
					{
						// only pick files
						callbackFileFilter(stats.isFile() && this.hasValidFileEnd(item, fileExtension));
					}).bind(this));
				}).bind(this), (function(entries){
					
					callback(null, entries);
					
				}).bind(this));
			}
			else
			{
				callback(err, []);
			}
		}).bind(this));
	},
	
	collectSubDirs : function(dir, callback){
		
		fs.readdir(dir, (function(err, subDirs)
		{
			if( err )
			{
				console.log(err);
			}
			
			async.filter(subDirs, (function(item, callbackDirFilter)
			{
				// sort out dirs
				fs.stat(path.join(dir, item), function(err, stats)
				{
					callbackDirFilter(stats.isDirectory() && item != 'brands' && !/^\./.test(item) );
				});
			}).bind(this), (function(dirEntries)
			{
				callback(dirEntries);
				
			}).bind(this));
		}).bind(this));						
	},

	isModuleIncluded : function(modName, modifier)
	{
		var include = modifier.include ? modifier.include[modName] : null;
		var exclude = modifier.exclude ? modifier.exclude[modName] : null;

		if( _.isArray(include) )
		{
			return _.contains(include, this.brand);
		}

		if( _.isArray(exclude) )
		{
			return !_.contains(exclude, this.brand);
		}

		return true;
	},

	isFileIncluded : function(fileName, modifier)
	{
		var include;
		var exclude;
		
		if( _.isArray(modifier.include) )
		{
			include = modifier.include;
		}
		else if( _.isObject(modifier.include) )
		{
			include = modifier.include[fileName];
		}
		
		if( _.isArray(modifier.exclude) )
		{
			exclude = modifier.exclude;
		}
		else if( _.isObject(modifier.exclude) )
		{
			exclude = modifier.exclude[fileName];
		}
		
		
		if( include )
		{
			return _.contains(include, this.brand);
		}
		else if( exclude )
		{
			return !_.contains(exclude, this.brand);
		}
		else
		{
			return true;
		}
	},
	
	hasValidFileEnd : function(fileName, fileExtension)
	{
		fileExtension = '.' + fileExtension;
		
		return fileName.substr(-fileExtension.length) === fileExtension;
	},
	
	/**
	 * 
	 */
	filterAssets : function(files, folder, modifier, fileExtension)
	{
		fileExtension = fileExtension || '';
		
		var result = [];
		_.each(files, function(file)
		{
			var fileName = file.replace(folder + path.sep, '');
			var nameWithoutExtension = this.getPathWithoutExtension(fileName, fileExtension);
			var fileTags = nameWithoutExtension.split('@');
			
			fileName = fileTags[0]+'.'+fileExtension;
			
			if( this.isFileIncluded(fileName, modifier) )
			{
				result.push(file);
			}
		}, this);

		return result;
	},
	
	filterFilesByTags : function(files, fileExtension/* , tagmode='join' */)
	{
		var result = [];

		//find all files with at least one tag
		var tagRegex = new RegExp('\@(.*?)\.' + fileExtension + '$');
		var taggedFiles = _.filter(files, function(file)
		{
			return tagRegex.test(file);
		}, this);

		if( !this.tags.length /* || tagmode == 'join' */)
		{
			// remove files with tags from selection
			result = _.union(result, _.difference(files, taggedFiles));
		}

		if( this.tags.length )
		{
			var filesWithRequiredTags = [];
			_.each(taggedFiles, function(fileName)
			{
				var nameWithoutExtension = this.getPathWithoutExtension(fileName, fileExtension);

				var fileTags = nameWithoutExtension.split('@');
				fileTags.shift(); //remove file basename

				if( this.areTagsEqual(this.tags, fileTags) ) filesWithRequiredTags.push(fileName);
			}, this);

			result = _.union(result, filesWithRequiredTags);
		}

		return result;
	},

	mergeDefaultAndBrandFiles : function(defauls, brand, assetPath, subfolder)
	{
		subfolder = subfolder || '';
		var result = [];

		var brandPath = assetPath + path.sep + 'brands' + path.sep + this.brand + path.sep;
		if( subfolder ) brandPath += subfolder + path.sep;

		var defaultPath = assetPath + path.sep;
		if( subfolder ) defaultPath += subfolder + path.sep;

		_.each(defauls, function(defaultValue)
		{
			var match = false;
			var defaultBasename = defaultValue.replace(defaultPath, '');

			_.each(brand, function(brandValue, bKey)
			{
				var brandBasename = brandValue.replace(brandPath, '');

				if( defaultBasename == brandBasename )
				{
					match = true;
					result.push(brandValue);
					delete brand[bKey];
				}
			}, this);

			if( !match ) result.push(defaultValue);
		}, this);

		result = _.union(result, brand);

		return result;
	},

	areTagsEqual : function(requiredTags, fileTags)
	{
		var delta1 = _.difference(requiredTags, fileTags).length;
		var delta2 = _.difference(fileTags, requiredTags).length;

		return delta1 === 0 && delta2 === 0;
	},
	
	getPathWithoutExtension : function(filePath, fileExtension)
	{
		var extensionRegex = new RegExp('\.' + fileExtension + '$');
		
		return filePath.replace(extensionRegex, '');
	}
};

// node.js module export
module.exports = AssetCollector;
