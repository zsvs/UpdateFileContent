const github = require('@actions/github');
const FileFactory = require("./fabrics/FileFactory");
const YAML = require('yaml');

class updateFileContent {
    constructor(gh_token) {
        this.octokit = github.getOctokit(gh_token);
    };

    setLogger({notice, info, output, warning, error}) {
        this.notice = notice;
        this.info = info;
        this.output = output;
        this.warning = warning;
        this.error = error;
    };

    async getListBranches(repoOwner, repoName) {
        let ListBranches = await this.octokit.request('GET /repos/{owner}/{repo}/branches', {
            owner:  repoOwner,
            repo: repoName
          });

        let branches = [];
        ListBranches.data.forEach(element => {
            branches.push(element.name)
        });
        this.info(`List of branches: ${branches}`)
        return branches;
    };

    async createBranch(repoOwner, repoName, tgtBranch) {
        try {

            const MainBranchName = await this.octokit.request("GET /repos/{owner}/{repo}", {
                owner:  repoOwner,
                repo: repoName,
            });

            const MainBranchSHA = await this.octokit.request("GET /repos/{owner}/{repo}/git/refs/{ref}", {
                owner:  repoOwner,
                repo: repoName,
                ref: `heads/${MainBranchName.data.default_branch}`
            });
            const NewBranchCreation = await  this.octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner:  repoOwner,
                repo: repoName,
                ref: `refs/heads/${tgtBranch}`,
                sha: MainBranchSHA.data.object.sha
            });

            this.info(`HTTP status of main branch: ${MainBranchSHA.status}`);
            this.info(`SHA of main branch: ${MainBranchSHA.data.object.sha}`);
            return NewBranchCreation.data.ref;

        } catch (error) {
            throw error;
        }
    };

    async getFileContent(repoOwner, repoName, filePath) {
        try {
            const fileSHA = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner:  repoOwner,
                repo: repoName,
                path: filePath,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            this.info(`${filePath} sha: ${fileSHA.data.sha}`);

            const blob = await this.octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
                owner: repoOwner,
                repo: repoName,
                file_sha: fileSHA.data.sha,
                headers: {
                'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            const sha = fileSHA.data.sha;
            const fileContent = Buffer.from(blob.data.content, "base64").toString("utf-8");
            return {fileContent, sha};
        } catch (error) {
            this.error(`Couldn't retrive file content. ${error}`);
            throw error;
        }

    };

    __updateKey(fileContent, parentKey, childKey, value) {
        try {
            Object.keys(fileContent[parentKey]).forEach(element => {
                if (fileContent[parentKey][element][childKey]) {
                    fileContent[parentKey][element][childKey] = value;
                } else {
                    this.error(`No such keys ${parentKey}.${element}.${childKey}`)
                };
            });
            return fileContent
        } catch (error) {
            this.error(`Couldn't update given key. ${error}`);
            throw error;
        }

    };

    async updateFile(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey) {
        try {
            const fileContent = (await this.getFileContent(repoOwner, repoName, filePath)).fileContent;
            let yamlContent = YAML.parse(fileContent);
            const fileSHA =  (await this.getFileContent(repoOwner, repoName, filePath)).sha;
            const newFileContent = YAML.stringify(this.__updateKey(yamlContent, parentKey, childKey, newValue));

            const FileUpdated = await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner:  repoOwner,
                repo: repoName,
                path: filePath,
                branch: tgtBranch,
                message: 'Commit by zsvs/updateFileContent',
                sha: fileSHA,
                committer: {
                  name: 'zsvs',
                  email: 'stepanezc@gmail.com'
                },
                content: Buffer.from(newFileContent).toString("base64")
              });

            this.info(`File path: ${FileUpdated.data.content.path}`);
            return FileUpdated.data.commit.sha;
        } catch (error) {
            this.error(`Couldn't update file. ${error}`);
            throw error;
        }
    };

    async updateFiles(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey) {
        try {
            const latestSHA = await this.octokit.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner: repoOwner,
                repo: repoName,
                ref: `heads/${tgtBranch}`,
              });

            let files = filePath.split(" ");
            console.log(files);
            let blobsList = [];
            const blobFactory = new FileFactory();
            for (var file of files) {
                let currentFileData = await this.getFileContent(repoOwner, repoName, file);
                let yamlContent = YAML.parse(currentFileData.fileContent);
                const newFileContent = YAML.stringify(this.__updateKey(yamlContent, parentKey, childKey, newValue));
                let blobInstance = blobFactory.createInstance(file, newFileContent);
                this.warning(`Blob Instance: ${blobInstance.getBlob()}`);
                blobsList.push(blobInstance.getBlob());
                console.log(blobsList);
            }

            this.warning(`Blobs list: ${blobsList}`);

            const tree = await this.octokit.request('POST /repos/{owner}/{repo}/git/trees', {
                owner: repoOwner,
                repo: repoName,
                base_tree: latestSHA.data.object.sha,
                tree: blobsList,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
              });

            const commit = await this.octokit.request('POST /repos/{owner}/{repo}/git/commits', {
                owner: repoOwner,
                repo: repoName,
                message: 'Commit by zsvs/updateFileContent',
                tree: tree.data.sha,
                parents: [latestSHA.data.object.sha],
              });

              await this.octokit.request('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                owner: repoOwner,
                repo: repoName,
                ref: `heads/${tgtBranch}`,
                sha: commit.data.sha,
              });

        } catch (error) {
            this.error(`Couldn't update files. ${error}`);
            throw error;
        }
    };

    async createPR(repoOwner, repoName, tgtBranch, title, message) {
        try {
            const prURL = await this.octokit.request('POST /repos/{owner}/{repo}/pulls', {
                owner: repoOwner,
                repo: repoName,
                title: title,
                body: message,
                head: `${repoOwner}:${tgtBranch}`,
                base: 'main',
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
              });
            return prURL.data.url
        } catch (error) {
            this.error(`Couldn't create PR. ${error}`);
            throw error;
        }

    };

    async run(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey, pr_title, pr_message) {
        try {
            this.info(`Github env:\n SERVER_URL: ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}`)
            const listBranches = await this.getListBranches(repoOwner, repoName);
            this.warning(`List of branches ${listBranches}`);
            if (listBranches.includes(tgtBranch)){
                this.warning(`Branch ${tgtBranch} is already exists`);
                this.notice(`Update file: ${filePath}`);
                if (filePath.split(" ").length == 1) {
                    this.warning(`SHA of updated file: ${await this.updateFile(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey)}`);
                    this.warning(`Creating PR: ${await this.createPR(repoOwner, repoName, tgtBranch, pr_title, pr_message)}`);
                } else if (filePath.split(" ").length > 1) {
                    this.warning(`SHA of updated files: ${await this.updateFiles(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey)}`);
                    this.warning(`Creating PR: ${await this.createPR(repoOwner, repoName, tgtBranch, pr_title, pr_message)}`);
                };

            } else {
                this.info("Start Creating branch");
                this.info(`File path: ${filePath}`)
                this.warning(`ref of branch: ${await this.createBranch(repoOwner, repoName, tgtBranch)}`);
                if (filePath.split(" ").length == 1) {
                    this.warning(`SHA of updated file: ${await this.updateFile(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey)}`);
                    this.warning(`Creating PR: ${await this.createPR(repoOwner, repoName, tgtBranch, pr_title, pr_message)}`);
                } else if (filePath.split(" ").length > 1) {
                    this.warning(`SHA of updated files: ${await this.updateFiles(repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey)}`);
                    this.warning(`Creating PR: ${await this.createPR(repoOwner, repoName, tgtBranch, pr_title, pr_message)}`);
                };

            }
        } catch (error) {
            throw error;
        }
    };
}
module.exports = updateFileContent;