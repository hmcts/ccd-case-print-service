process.env.TS_NODE_FAST = "true";
process.env.NODE_CONFIG_DIR = __dirname + "/config";
require('@hmcts/properties-volume').addTo(require('config'));
require('./src/main/server');
