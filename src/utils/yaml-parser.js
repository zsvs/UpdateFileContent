const YAML = require('yaml');
const fs = require('fs');

// const file = fs.readFileSync('./stg-configs.yaml', 'utf8');
// const confs = YAML.parse(file);
// let confObj = confs;
// confObj.on.workflow_dispatch.inputs.repo.default = confObj.on.workflow_dispatch.inputs.repo.default.replace("install", "delete")

// YAML.stringify(confObj);

// console.log(YAML.stringify(confObj))

class Configs {
    constructor() {
        this.inputs = {};
        //this.octokit = github.getOctokit(gh_token);
    };

    setup(inputs) {
        for(const [key, value] of Object.entries(inputs)) {
            this.inputs[key] = value;
        };
    };

    setLogger({notice, info, output, warning, error}) {
        this.notice = notice;
        this.info = info;
        this.output = output;
        this.warning = warning;
        this.error = error;
    };

    getConfiguration(path) {
        try {
            const file = fs.readFileSync(path, 'utf8');
            const confs = YAML.parse(file);
            return confs;
        } catch (error) {
            throw error
        };
    };

    rewriteConfiguration(path) {
        try {
            this.configs = this.getConfiguration(path);
            console.log(this.configs);

            this.inputs.OWNER = this.configs.inputs.owner;
            this.inputs.REPO = this.configs.inputs.repo;
            this.inputs.TARGET_BRANCH = this.configs.inputs.target_branch;
            this.inputs.FILE = this.configs.inputs.file;
            this.inputs.OLD_VERSION = this.configs.inputs.old_version;
            this.inputs.NEW_VERSION = this.configs.inputs.new_version;
        } catch (error) {
            throw error;
        }

    };

    showConfiguration() {
        console.log(YAML.stringify(this.getConfiguration(path)));
    }

};

const path = './stg-configs.yaml';
const confs = new Configs;
const inputs = {
    REPO: "repo1",
    OWNER: "owner1",
    GITHUB_TKN: "github_tkn1",
    TARGET_BRANCH: "target_branch1",
    FILE: "file1",
    OLD_VERSION: "old_version1",
    NEW_VERSION: "new_version1"

};
confs.setup(inputs);
confs.getConfiguration(path)
confs.showConfiguration();
