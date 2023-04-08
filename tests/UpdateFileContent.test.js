const github = require("@actions/github");
const YAML = require("yaml");
const core = require("@actions/core");
const updateFileContent = require("../src/UpdateFileContent");

describe("UpdateFileContent methods tests", () => {
    let octokit;
    let fileContent;
    beforeEach(() => {
        jest.clearAllMocks();

        YAML.parse = jest.fn();
        YAML.stringify = jest.fn(obj => [obj]);

        mockToken = "Some_fancy_token";
        github.getOctokit = jest.fn((someValue) => `Octokit creation mock ${someValue}`);
        action = new updateFileContent(mockToken);

        core.info = jest.fn((someValue) => `Core info mock ${someValue}`);
        core.warning = jest.fn((someValue) => `Core warning mock ${someValue}`);
        core.error = jest.fn((someValue) => `Core error mock ${someValue}`);
        core.notice = jest.fn((someValue) => `Core notice mock ${someValue}`);

        action.setLogger({
            notice: core.notice,
            info: core.info,
            output: core.setOutput,
            warning: core.warning,
            error: core.error,
        });
        octokit = {
            request: jest.fn(),
          };

    });
    test("instance creation ", () => {
        expect(action.octokit).toBe("Octokit creation mock Some_fancy_token");
    });

    test("__updateKey test", () => {
        const parentKey = "front";
        const childKey = "tag";
        const value = 2;
        const fileContent = {"front":
                                {"first_child_key":
                                        {"tag": 1}
                                }
                            };
        const newContent = action.__updateKey(fileContent, parentKey, childKey, value);
        expect(newContent.front.first_child_key.tag).toBe(2);
    });

    test("getListBranches test", async () => {
        action.octokit = octokit;
        // Mock the response from the GitHub API
        octokit.request.mockResolvedValueOnce({
            data: [
                { name: "branch1" },
                { name: "branch2" },
            ],
        });

        // Call the getListBranches method
        const branches = await action.getListBranches("repoOwner", "repoName");

        // Check the returned branches
        expect(branches).toEqual(["branch1", "branch2"]);
    });

    test("createBranch test", async () => {
        action.octokit = octokit;
        octokit.request
            .mockResolvedValueOnce({ data: { default_branch: "main" } })
            .mockResolvedValueOnce({ data: { object: { sha: "abcdef1234567890" } } })
            .mockResolvedValueOnce({ data: { ref: "refs/heads/newBranch" } });
        const newBranchRef = await action.createBranch("repoOwner", "repoName", "newBranch");
        expect(newBranchRef).toBe("refs/heads/newBranch");

        // Check that the GitHub API was called with the correct parameters
        expect(octokit.request).toHaveBeenCalledWith("GET /repos/{owner}/{repo}", {
            owner: "repoOwner",
            repo: "repoName",
        });
        expect(octokit.request).toHaveBeenCalledWith("GET /repos/{owner}/{repo}/git/refs/{ref}", {
            owner: "repoOwner",
            repo: "repoName",
            ref: "heads/main",
        });
        expect(octokit.request).toHaveBeenCalledWith("POST /repos/{owner}/{repo}/git/refs", {
            owner: "repoOwner",
            repo: "repoName",
            ref: "refs/heads/newBranch",
            sha: "abcdef1234567890",
        });
    });

    test("getFileContent test", async () => {
        const octokit = {
            request: jest.fn().mockReturnValueOnce({ data: { sha: "file_sha" } })
        };

        action.octokit = octokit;
        // Mocking octokit request for getting file content
        octokit.request.mockReturnValueOnce({ data: { content: "VGVzdA==", sha: "file_sha" } });

        // Test
        const file = await action.getFileContent("repoOwner", "repoName", "filePath");
        expect(file.fileContent).toBe("Test");
        expect(file.sha).toBe("file_sha");
        expect(action.info).toHaveBeenCalledWith("filePath sha: file_sha");
    });

    test("updateFile test", async () => {
        const parentKey = "front";
        const childKey = "tag";
        const value = 2;

        const octokit = {
            request: jest.fn()
        };

        // Creating an instance of the updateFileContent class
        action.octokit = octokit;

        // Mocking getFileContent
        action.getFileContent = jest.fn().mockReturnValue({ data: { content: "VGVzdA==", sha: "file_sha" } });
        action.__updateKey = jest.fn().mockReturnValue("fileContent");


        octokit.request.mockReturnValueOnce({ data:
            {
                commit: { sha: "commit_sha" },
                content: { path: "filePath_mock" },
            }
        });

        // Test repoOwner, repoName, tgtBranch, filePath, newValue, parentKey, childKey
        const file = await action.updateFile("repoOwner", "repoName", "newBranch", "filePath", value, parentKey, childKey);
        expect(file).toBe("commit_sha");
        expect(action.info).toHaveBeenCalledWith("File path: filePath_mock");
    });

    test("updateFiles test", async () => {
        const parentKey = "front";
        const childKey = "tag";
        const value = 2;
        YAML.stringify = jest.fn(obj => obj);
        const octokit = {
            request: jest.fn()
        };
        const mockblobsList = [
            {
                path: "file1",
                mode: "100644",
                type: "blob",
                content: "fileContent"
            },
            {
                path: "file2",
                mode: "100644",
                type: "blob",
                content: "fileContent"
            },
        ];
        action.getFileContent = jest.fn().mockReturnValue({ data: { content: "VGVzdA==", sha: "file_sha" } });
        action.__updateKey = jest.fn().mockReturnValue("fileContent");
        action.octokit = octokit;
        octokit.request
            .mockResolvedValueOnce({ data: {object: { sha: "latest_sha" } }})
            .mockResolvedValueOnce({data: {sha: "tree_sha"}})
            .mockResolvedValueOnce({data: {sha: "commit_sha"}})
            .mockResolvedValueOnce({ data:
                {
                    commit: { sha: "commit_sha" },
                    content: { path: "filePath_mock" },
                }
            });

        const files = await action.updateFiles("repoOwner", "repoName", "newBranch", "file1 file2", value, parentKey, childKey);
        expect(octokit.request).toHaveBeenNthCalledWith(1, "GET /repos/{owner}/{repo}/git/ref/{ref}", {
            owner: "repoOwner",
            repo: "repoName",
            ref: "heads/newBranch"
        });

        expect(octokit.request).toHaveBeenNthCalledWith(2, "POST /repos/{owner}/{repo}/git/trees", {
            owner: "repoOwner",
            repo: "repoName",
            base_tree: "latest_sha",
            tree: mockblobsList,
            headers: {
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })

        expect(octokit.request).toHaveBeenNthCalledWith(3, "POST /repos/{owner}/{repo}/git/commits", {
            owner: "repoOwner",
            repo: "repoName",
            message: "Commit by zsvs/updateFileContent",
            tree: "tree_sha",
            parents: ["latest_sha"],
        });

        expect(octokit.request).toHaveBeenNthCalledWith(4, "PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
            owner: "repoOwner",
            repo: "repoName",
            ref: "heads/newBranch",
            sha: "commit_sha",
          });
        expect(files).toBe("commit_sha");
    });

    test("createPR test", async () => {
        const octokit = {
            request: jest.fn()
        };
        action.octokit = octokit;
        octokit.request
            .mockResolvedValueOnce({ data: { url: "https://some.fancy.url" }});

        prURL = await action.createPR("repoOwner", "repoName", "tgtBranch", "mock_title_message", "mock_message_body");
        expect(prURL).toBe("https://some.fancy.url");
        expect(octokit.request).toHaveBeenCalledWith("POST /repos/{owner}/{repo}/pulls", {
            owner: "repoOwner",
            repo: "repoName",
            title: "mock_title_message",
            body: "mock_message_body",
            head: "repoOwner:tgtBranch",
            base: "main",
            headers: {
              "X-GitHub-Api-Version": "2022-11-28"
            }
        });
    });
});
