const YAML = require('yaml');
const fs = require('fs');

//TODO Get inputs from inputs and get remote yaml for change values


class Configs {
    constructor() {
        this.inputs = {};
        this.configs = undefined;
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
            console.log(`Environmets: ${this.configs.ENVIRONMENT.split(" ")}`)
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

const path = '../../metadata/stg-configs.yaml';
const remotePath = '../../metadata/test-data.yaml';

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
console.log(`Old version: ${inputsResults.OLD_VERSION}`);

const remoteConfs = new Configs;
let remoteYaml = remoteConfs.getConfiguration(remotePath);
console.log(`Current remote confs version: ${remoteYaml.front.tag}`);

remoteYaml.front.tag = remoteYaml.front.tag.replace(inputsResults.OLD_VERSION, inputsResults.NEW_VERSION);
console.log(`New remote conf to commit: ${remoteYaml.front}`);