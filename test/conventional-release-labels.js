const { describe, it, afterEach } = require('mocha')
const api = require('../index.js')
// import * as assert from 'assert'
// import * as core from '@actions/core'
const sinon = require('sinon')

const sandbox = sinon.createSandbox()
process.env.GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH || ''

describe('conventional-release-labels', () => {
  afterEach(() => {
    sandbox.restore()
  })
  it('it adds feature label', async () => {
    sandbox.stub(api, 'addLabel').resolves(undefined)
    sandbox.stub(process.env, 'GITHUB_EVENT_PATH').value('./test/fixtures/feature-pr.json')
    await api.main()
  })
})