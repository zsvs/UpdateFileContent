const github = require('@actions/github');

// const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
// const owner = 'zsvs';
// const repo = 'OctokitAction';
// const filePath = "dist/index.js"
// const main = async (user, repoOwner, path) =>{
//     const fileSHA = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
//         owner: user,
//         repo: repoOwner,
//         path: path,
//         headers: {
//             'X-GitHub-Api-Version': '2022-11-28'
//         }
//         });
//         console.log(`${path} sha: ${fileSHA.data.sha}`);

//     const blob = await octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
//         owner: user,
//         repo: repoOwner,
//         file_sha: fileSHA.data.sha,
//         headers: {
//           'X-GitHub-Api-Version': '2022-11-28'
//         }
//       });
//     // console.log(Buffer.from(blob.data.content, "base64").toString("utf-8"));
//     const fileContent = Buffer.from(blob.data.content, "base64").toString("utf-8");
//     console.log(fileContent.replace("module.exports = __webpack_exports__;", "YAAAAY I CHANGE IT"));
// }

// main(owner, repo, filePath);

class UpdateFileContent {
    constructor() {
        this.inputs = {};
    };

    setup(inputs) {
        for(const [key, value] of Object.entries(inputs)) {
            this.inputs[key] = value;
        };
        this.octokit = github.getOctokit(this.inputs.GITHUB_TKN);
    };

    setLogger({notice, info, output, warning, error}) {
        this.notice = notice;
        this.info = info;
        this.output = output;
        this.warning = warning;
        this.error = error;
    };
    async CreateBranch(repoOwner, repoName, tgtBranch) {
        try {

            const owner = repoOwner; // this.inputs.OWNER;
            const repo =  repoName; // this.inputs.REPO;
            const targetBranch = tgtBranch; // this.inputs.TARGET_BRANCH;

            const MainBranchName = await this.octokit.request("GET /repos/{owner}/{repo}", {
                owner: owner,
                repo: repo,
            });

            const MainBranchSHA = await this.octokit.request("GET /repos/{owner}/{repo}/git/refs/{ref}", {
                owner: owner,
                repo: repo,
                ref: `heads/${MainBranchName.data.default_branch}`
            });
            const NewBranchCreation = await  this.octokit.request('POST /repos/{owner}/{repo}/git/refs', {
                owner: owner,
                repo: repo,
                ref: `refs/heads/${targetBranch}`,
                sha: MainBranchSHA.data.object.sha
            });

            this.info(`HTTP status of main branch: ${MainBranchSHA.status}`);
            this.info(`SHA of main branch: ${MainBranchSHA.data.object.sha}`);
            return NewBranchCreation.data.ref;

        } catch (error) {
            throw error;
        }
    };

    async UpdateFile(repoOwner, repoName, tgtBranch, filePath, oldVersion, newVersion) {
        try {

            const owner = repoOwner;                 // this.inputs.OWNER;
            const repo = repoName;                   // this.inputs.REPO;
            const targetBranch = tgtBranch;          // this.inputs.TARGET_BRANCH;
            const file = filePath;                   // this.inputs.FILES;

            this.warning(`Content b64:${Buffer.from(mycontent).toString("base64")}`);
            const fileSHA = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: owner,
                repo: repo,
                path: file,
                ref: targetBranch,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
              });

            console.log(`${path} sha: ${fileSHA.data.sha}`);

            const blob = await octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
                owner: user,
                repo: repoOwner,
                file_sha: fileSHA.data.sha,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
              });

            const fileContent = Buffer.from(blob.data.content, "base64").toString("utf-8");
            const newFileContent = fileContent.replace(oldVersion, newVersion);

            const FileUpdated = await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner: owner,
                repo: repo,
                path: file,
                branch: targetBranch,
                message: 'my commit message',
                sha: fileSHA.data.sha,
                committer: {
                  name: 'zsvs',
                  email: 'stepanezc@gmail.com'
                },
                content: Buffer.from(newFileContent).toString("base64")
              });

            this.info(`File path: ${FileUpdated.data.content.path}`);
            return FileUpdated.data.commit.sha;
        } catch (error) {
            this.error(`Couldn't update file. Error: ${error}`)
        }
    }
}
module.exports = UpdateFileContent;