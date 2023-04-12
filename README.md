[![Unit tests](https://github.com/zsvs/UpdateFileContent/actions/workflows/unit-tests.yaml/badge.svg)](https://github.com/zsvs/UpdateFileContent/actions/workflows/unit-tests.yaml)

# UpdateFileContent

**`This action works only with YAML files.`**

Action performs operations at repository content. It will take the files name, repo name, owner of the repo, target branch(where the changes perform), PR title and message, and GitHub token as inputs for performing operations under files we want to change. It will update the given keys with the new value.

### `Notice:`
* We only need to provide the top key element of the YAML file and the element we want to change inside the first child key element. Action loop over all first child elements of the file, so we don't need to provide it.

## Example Usage:
### [Usage example workflow](.github/workflows/usage.yaml)

### Action usage:
```yaml
    - name: Update content
      uses: zsvs/UpdateFileContent@v1.0.0
      with:
        repo: ${{ inputs.repo }}
        owner: ${{ inputs.owner }}
        file: ${{ inputs.file }}
        new_value: ${{ inputs.new_value}}
        target_branch: ${{ inputs.target_branch }}
        parent_key: ${{ inputs.parent_key}}
        child_key: ${{ inputs.child_key }}
        pr_title: ${{ inputs.pr_title }}
        pr_message: ${{ inputs.pr_message }}
        github_tkn: ${{ secrets.PAT_TOKEN }}
```
### `parent_key` and `child_key` explanation:
``` yaml
front: # parent_key input
  default_values:
    name: front-end-deployment
    tag: 0.0.1 # child_key input
  new_values_1:
    name: front-end-deployment
    tag: 0.0.1
  new_values_2:
    name: front-end-deployment
    tag: 0.0.1
  new_values_3:
    name: front-end-deployment
    tag: 0.0.1
```
## Inputs

* `repo` - Repository name where we want to update a file content:
    - Required: true
    - Type: string
    - Example value: `TestUpdateContentAction`

* `github_tkn` - Github token with write permission (needed to perform operations with repo):
    - Required: true
    - Type: string

* `file` - File or list of files(with space as delimeter) that we want to update:
    - Required: true
    - Type: string
    - Example value: `test-data.yaml test-data2.yaml`

* `owner` - Repository owner user or organization:
    - Required: true
    - Type: string
    - Example value: `zsvs`

* `target_branch` - Branch where we want to update files. If branch does not exist action will create it:
    - Required: true
    - Type: string
    - Example value: `test`

* `parent_key` - Top parent element of YAML file (see section `Example usage`):
    - Required: true
    - Type: string
    - Example value: `front`

* `child_key` - Child element of given parent key (see section `Example usage`):
    - Required: true
    - Type: string
    - Example value: `tag`

* `new_value` - New value that we want to add in a `file`:
    - Required: true
    - Type: string
    - Example value: `1.0.0`

* `pr_title` - Pull request title text:
    - Required: true
    - Type: string
    - Example value: `Update tag value`

* `pr_message` - Pull request body message:
    - Required: true
    - Type: string
    - Example value: `This tag value has been updated by GH action!`

