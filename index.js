const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const { readFile } = fs.promises
const { parser } = require('@conventional-commits/parser')

const api = module.exports = {
  addLabels,
  isPullRequest,
  main,
  removeLabels
}

async function main () {
  const { visit } = await import('unist-util-visit')
  const labelMap = JSON.parse(core.getInput('type_labels'))
  if (!process.env.GITHUB_EVENT_PATH) {
    console.warn('no event payload found')
    return
  }
  const payload = JSON.parse(
    await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')
  )
  if (!api.isPullRequest(payload)) {
    console.info('skipping non pull_request')
  }
  let titleAst
  try {
    titleAst = parser(payload.pull_request.title)
  } catch (err) {
    console.warn(err.message)
    return
  }
  const cc = {
    breaking: false
  }
  // <type>, "(", <scope>, ")", ["!"], ":", <whitespace>*, <text>
  visit(titleAst, (node) => {
    switch (node.type) {
      case 'type':
        cc.type = node.value
        break
      case 'scope':
        cc.scope = node.value
        break
      case 'breaking-change':
        cc.breaking = true
        break
      default:
        break
    }
  })

  const labels = []
  if (cc.breaking) labels.push(labelMap.breaking)
  if (labelMap[cc.type]) labels.push(labelMap[cc.type])
  if (labels.length) {
    await api.removeLabels(Object.values(labelMap), payload)
    await api.addLabels(labels, payload)
  }
}

function isPullRequest (payload) {
  return !!payload.pull_request
}

async function addLabels (labels, payload) {
  const octokit = getOctokit()
  await octokit.rest.issues.addLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    labels
  })
}

async function removeLabels (labels, payload) {
  const octokit = getOctokit()
  await octokit.rest.issues.removeLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    labels
  })
}

let cachedOctokit
function getOctokit () {
  if (!cachedOctokit) {
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)
    cachedOctokit = octokit
  }
  return cachedOctokit
}

main()
  .catch((err) => {
    core.setFailed(err.message)
  })
