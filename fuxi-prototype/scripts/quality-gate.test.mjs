import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { runQualityGate } from './quality-gate.cjs'

function makeProject({ html = '<!doctype html><script src="./assets/app.js"></script>', profile = 'static-html', spec = 'static-html', script = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fuxi-quality-gate-'))
  fs.mkdirSync(path.join(root, 'dist', 'assets'), { recursive: true })
  fs.writeFileSync(path.join(root, 'README.md'), [
    `prototype_spec: ${spec}`,
    'runtime: static-html',
    `runtime_profile: ${profile}`,
    'fuxi_adapter: fuxi-prototype',
    'entry_file: index.html',
    '',
    'Purpose: quality gate fixture.'
  ].join('\n'))
  fs.writeFileSync(path.join(root, 'dist', 'index.html'), html)
  if (script) fs.writeFileSync(path.join(root, 'dist', 'assets', 'app.js'), 'console.log("fixture")')
  return root
}

test('returns UNVERIFIED with a passing structural check for a valid alignment artifact', () => {
  const root = makeProject({ script: true })
  try {
    const report = runQualityGate({ projectDir: root, profile: 'static-html', spec: 'static-html', mode: 'alignment' })
    assert.equal(report.status, 'UNVERIFIED')
    assert.equal(report.failures.length, 0)
    assert.equal(report.entryFile, 'dist/index.html')
    assert(report.unverified.some(item => item.code === 'BUILD_NOT_PROVEN'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('fails when a deployable asset is missing', () => {
  const root = makeProject()
  try {
    const report = runQualityGate({ projectDir: root, profile: 'static-html', spec: 'static-html' })
    assert.equal(report.status, 'FAIL')
    assert(report.failures.some(item => item.code === 'RESOURCE_MISSING'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('fails when README profile or spec conflicts with the selected contract', () => {
  const root = makeProject({ profile: 'vue3-element-plus', spec: 'tiangong' })
  try {
    const report = runQualityGate({ projectDir: root, profile: 'vue3-skyui', spec: 'static-html' })
    assert.equal(report.status, 'FAIL')
    assert(report.failures.some(item => item.code === 'PROFILE_MISMATCH'))
    assert(report.failures.some(item => item.code === 'PROFILE_SPEC_MISMATCH'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('fails on absolute or source-only HTML references', () => {
  const root = makeProject({ html: '<!doctype html><script src="/src/main.js"></script>' })
  try {
    const report = runQualityGate({ projectDir: root })
    assert.equal(report.status, 'FAIL')
    assert(report.failures.some(item => item.code === 'NON_DEPLOYABLE_REFERENCE'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('keeps implementation-proof component compliance explicitly UNVERIFIED', () => {
  const root = makeProject({ profile: 'vue3-element-plus', spec: 'tiangong', html: '<!doctype html><button>提交</button>' })
  fs.mkdirSync(path.join(root, 'src'), { recursive: true })
  fs.writeFileSync(path.join(root, 'src', 'App.vue'), '<template><button>提交</button></template>')
  try {
    const report = runQualityGate({ projectDir: root, profile: 'vue3-element-plus', spec: 'tiangong', mode: 'implementation-proof' })
    assert.equal(report.status, 'UNVERIFIED')
    assert(report.unverified.some(item => item.code === 'COMPONENT_PROFILE_UNVERIFIED'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
