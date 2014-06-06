// includes
var ProgressReporter = require('../abstract/progressReporter');
var util = require('util');
// async stuff
var async = require('asyncawait/async');
// crypto
var crypto = require('crypto');
var S = require("string");

// process function
var process = async(function(corpus) {
    // hash input
    var md5sum = crypto.createHash('md5');
    md5sum.update(corpus.input);
    // generate unique url for piece
    var url = 'direct-input://'+corpus._id.toString()+'/'+md5sum.digest('hex')+'/'+Date.now();

    // convert to html string
    var doc = {
        corpuses: [corpus._id],
        uri: url,
        source: corpus.input,
        plaintext: S(corpus.input).stripTags().s //TODO implement this on all input types
    };

    return [doc];
});

// module
var DirectProcessing = function () {
    ProgressReporter.call(this);

    // name (also ID of processer used in client)
    this.name = 'directinput';

    // function
    this.process = process;

    return this;
};

// Inherit from ProgressReporter
util.inherits(DirectProcessing, ProgressReporter);

module.exports = new DirectProcessing();