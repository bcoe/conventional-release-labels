const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const { readFile } = fs.promises
const { parser } = require('@conventional-commits/parser')

const api = module.exports = {
  addLabel,
  isPullRequest,
  main
}

async function main () {
  const { visit } = await import('unist-util-visit')
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
  const titleAst = parser(payload.pull_request.title)
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

  if (cc.type === 'feat') {
    await api.addLabel(cc.type, payload)
  }
}

function isPullRequest (payload) {
  return !!payload.pull_request
}

async function addLabel (type, payload) {
  const octokit = getOctokit()
  await octokit.rest.issues.addLabels({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    labels: ['feature']
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
