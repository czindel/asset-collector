module.exports = {

	"file.css": {
		"type" : "less",
		"locations" : {
			"file/" : {
				"pattern" : "file",
//				"exclude": [],
//				"include": []
			}
		}
	},
	"folder.css": {
		"type" : "less",
		"locations" : {
			"folder/" : {
				"pattern" : "folder",
//				"exclude": [],
//				"include": []
			}
		}
	},
	"module.css": {
		"type" : "less",
		"locations" : {
			"module/" : {
				"pattern" : "module",
				// only include/exclude for complete module is possible
				"exclude": ["brand_2"],
				"include": ["brand_1"]
			}
		}
	},
	"module_flat.css": {
		"type" : "less",
		"locations" : {
			"module_flat/" : {
				"pattern" : "module_flat",
//				"exclude": [],
//				"include": []
			}
		}
	},
	"package.css": {
		"type" : "less",
		"locations" : {
			"package/" : {
				"pattern" : "package"
			}
		}
	},
}