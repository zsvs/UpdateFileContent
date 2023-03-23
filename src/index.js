const core = require("@actions/core");
const UpdateFileContent = require("./UpdateFileContent");
// blablabla
(async () =>{
    try {
        const inputs = {
            REPO: core.getInput("repo").trim(),
            OWNER: core.getInput("owner").trim(),
            GITHUB_TKN: core.getInput("github_tkn").trim(),
            TARGET_BRANCH: core.getInput("target_branch").trim(),
            FILE: core.getInput("file").trim(),
            OLD_VERSION: core.getInput("old_version").trim(),
            NEW_VERSION: core.getInput("new_version").trim()

        };

        const action = new UpdateFileContent(inputs.GITHUB_TKN);
        action.setLogger({
            notice: core.notice,
            info: core.info,
            output: core.setOutput,
            warning: core.warning,
            error: core.error,
        });

        await action.run(inputs.OWNER, inputs.REPO, inputs.TARGET_BRANCH, inputs.FILE, inputs.OLD_VERSION, inputs.NEW_VERSION);

    } catch (error) {
        console.error(error);
        core.setFailed(error);
        throw error;
    }
})();