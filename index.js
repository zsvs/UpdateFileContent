const core = require("@actions/core");
const UpdateFileContent = require("./UpdateFileContent.js");

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

        const action = new UpdateFileContent();
        action.setup(inputs);
        action.setLogger({
            notice: core.notice,
            info: core.info,
            output: core.setOutput,
            warning: core.warning,
            error: core.error,
        });

        await action.run();

    } catch (error) {
        console.error(error);
        core.setFailed(error);
        throw error;
    }
})();