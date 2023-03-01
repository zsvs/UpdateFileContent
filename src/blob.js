const github = require('@actions/github');
const core = require("@actions/core");

class Blob {
    constructor(fileName, content) {
        core.warning("New Blob object created");
        this.path = fileName,
        this.mode = '100644',
        this.type = 'blob'
        this.content = content;
    };

    setContent(content) {
        this.content = content;
    };

    getBlob() {
        return {
            path: this.path,
            mode: this.mode,
            type: this.type,
            content: this.content
        }
    };
};


module.exports = Blob;