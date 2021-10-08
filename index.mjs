import * as core from '@actions/core'
import * as github from '@actions/github'
import esMain from 'es-main'
import { readFile } from 'fs/promises'
import { parser } from '@conventional-commits/parser'
import { visit } from 'unist-util-visit'

const api = {
  addLabel,
  isPullRequest,
  main
}

export {
  api
}

async function main () {
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
  return !!payload?.pull_request?.head
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

if (esMain(import.meta)) {
  main()
    .catch((err) => {
      core.setFailed(err.message)
    })
}
