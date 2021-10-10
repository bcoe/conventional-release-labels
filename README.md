# Conventional Release Labels

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Automatically adds labels to pull requests based on [Conventional Commits](https://conventionalcommits.org). These labels can be used with GitHub's
[automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes).

## Configuration

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

Enjoy!

## License

Apache Version 2.0
