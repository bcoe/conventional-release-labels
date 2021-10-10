# Conventional Release Labels

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Action that automatically adds labels to pull requests based on [Conventional Commits](https://conventionalcommits.org). These labels can be used in conjunction GitHub's
[automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes):

<img width="675" src="/screenshot.png">

## Setting up action

Create a `.github/workflows/conventional-label.yaml`:

```yaml
on:
  pull_request:
    types: [ opened, edited ]
name: conventional-release-labels
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: bcoe/conventional-release-labels@v1
```

Create a `.github/release.yaml`:

```yaml
changelog:
  exclude:
    labels:
      - ignore-for-release
    authors:
      - octocat
  categories:
    - title: Breaking Changes 🛠
      labels:
        - breaking
    - title: Exciting New Features 🎉
      labels:
        - feature
    - title: Fixes 🔧
      labels:
        - fix
    - title: Other Changes
      labels:
        - "*"
```

## Configuration

| input | description |
|:---:|---|
| `token` | A GitHub secret token, the action defaults to using the special `secrets.GITHUB_TOKEN` |
| `type_labels` | Mapping from Conventional Commit `types` to pull request labels `{"feat": "feature", "fix": "fix", "breaking": "breaking"}` |

Enjoy 🎉

## Related Tools

| tool | description |
|:---:|---|
| [release-please-action](https://github.com/google-github-actions/release-please-action)   |  fully automated releases with Conventional Commits |

## License

Apache Version 2.0
