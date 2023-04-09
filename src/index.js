const core = require("@actions/core");
const updateFileContent = require("./UpdateFileContent");

(async () =>{
    try {
        const inputs = {
            REPO: core.getInput("repo").trim(),
            OWNER: core.getInput("owner").trim(),
            GITHUB_TKN: core.getInput("github_tkn").trim(),
            TARGET_BRANCH: core.getInput("target_branch").trim(),
            FILE: core.getInput("file").trim(),
            NEW_VALUE: core.getInput("new_value").trim(),
            PARENT_KEY: core.getInput("parent_key").trim(),
            CHILD_KEY: core.getInput("child_key").trim(),
            PR_TITLE: core.getInput("pr_title").trim(),
            PR_MESSAGE: core.getInput("pr_message").trim()
        };

        const action = new updateFileContent(inputs.GITHUB_TKN);
        action.setLogger({
            notice: core.notice,
            info: core.info,
            output: core.setOutput,
            warning: core.warning,
            error: core.error,
        });

        await action.run(inputs.OWNER, inputs.REPO, inputs.TARGET_BRANCH, inputs.FILE, inputs.NEW_VALUE, inputs.PARENT_KEY, inputs.CHILD_KEY, inputs.PR_TITLE, inputs.PR_MESSAGE);

    } catch (error) {
        console.error(error);
        core.setFailed(error);
        throw error;
    }
})();