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
        this.configs = undefined;
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

    setInputsFromConfiguration(path) {
        try {
            this.configs = this.getConfiguration(path);
            // console.log(this.configs);

            this.inputs.OWNER = this.configs.inputs.owner.default;
            this.inputs.REPO = this.configs.inputs.repo.default;
            this.inputs.TARGET_BRANCH = this.configs.inputs.target_branch.default;
            this.inputs.FILE = this.configs.inputs.file.default;
            this.inputs.OLD_VERSION = this.configs.inputs.old_version.default;
            this.inputs.NEW_VERSION = this.configs.inputs.new_version.default;
        } catch (error) {
            throw error;
        }

    };

    getResultInputs() {
        try {
            return {
                OWNER: this.inputs.OWNER,
                REPO: this.inputs.REPO,
                TARGET_BRANCH: this.inputs.TARGET_BRANCH,
                FILE: this.inputs.FILE,
                OLD_VERSION: this.inputs.OLD_VERSION,
                NEW_VERSION: this.inputs.NEW_VERSION
            }
        } catch (error) {
            throw error;
        }
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
confs.setInputsFromConfiguration(path);
const inputsResults = confs.getResultInputs();

console.log(inputsResults);
