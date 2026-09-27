import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initialDb } from './seed.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(here, '../data/db.json')

function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2))
  }
}

export function readDb() {
  ensureDb()
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
}

export function writeDb(next) {
  fs.writeFileSync(dbPath, JSON.stringify(next, null, 2))
  return next
}

export function updateDb(updater) {
  const current = readDb()
  const next = updater(structuredClone(current))
  return writeDb(next)
}
