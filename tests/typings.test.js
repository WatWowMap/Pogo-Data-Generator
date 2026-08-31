const path = require('node:path')
const ts = require('typescript')

test('accepts partial special-move templates through the public input', () => {
  const projectRoot = path.resolve(__dirname, '..')
  const configPath = path.join(projectRoot, 'tsconfig.json')
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile)
  if (error) throw new Error(ts.formatDiagnostic(error, formatHost(projectRoot)))

  const parsed = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    projectRoot,
    {
      declaration: false,
      noEmit: true,
      rootDir: projectRoot,
    },
    configPath,
  )
  const fixture = path.join(
    projectRoot,
    'tests/fixtures/partialSpecialMoveTemplate.ts',
  )
  const program = ts.createProgram([fixture], parsed.options)
  const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)]

  expect(ts.formatDiagnostics(diagnostics, formatHost(projectRoot))).toBe('')
})

const formatHost = (projectRoot) => ({
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => projectRoot,
  getNewLine: () => '\n',
})
