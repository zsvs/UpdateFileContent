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

    async GetListBranches(repoOwner, repoName) {
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

    async CreateBranch(repoOwner, repoName, tgtBranch) {
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

    async UpdateFile(repoOwner, repoName, tgtBranch, filePath, oldVersion, newVersion) {
        try {

            const fileSHA = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner:  repoOwner,
                repo: repoName,
                path: filePath,
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
                owner:  repoOwner,
                repo: repoName,
                path: filePath,
                branch: tgtBranch,
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
    };

    async run(repoOwner, repoName, tgtBranch, filePath, oldVersion, newVersion) {
        try {
            this.info(`Github env:\n SERVER_URL: ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}`)
            const listBranches = await this.GetListBranches(repoOwner, repoName);
            this.warning(`List of branches ${listBranches}`);

            if (listBranches.includes(tgtBranch)){
                this.warning(`Branch ${tgtBranch} is already exists`);
                this.notice(`Update file: ${filePath}`);
                this.warning(`SHA of updated file: ${await this.UpdateFile(repoOwner, repoName, tgtBranch, filePath, oldVersion, newVersion)}`);
            } else {
                this.info("Start Creating branch");
                this.warning(`ref of branch: ${await this.CreateBranch(repoOwner, repoName, tgtBranch)}`);
                this.warning(`SHA of updated file: ${await this.UpdateFile(repoOwner, repoName, tgtBranch, filePath, oldVersion, newVersion)}`);
            }
        } catch (error) {
            throw error;
        }
    };
}
module.exports = UpdateFileContent;