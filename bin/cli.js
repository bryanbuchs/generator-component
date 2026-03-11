#!/usr/bin/env node

/**
 * CLI Executable for Drupal SDC + Storybook Component Generator
 * 
 * Entry point for the `generator-component` command.
 * 
 * This wrapper:
 * 1. Imports the main generator function
 * 2. Calls it and handles any errors
 * 3. Provides user-friendly error messages
 * 4. Sets appropriate exit codes for shell integration
 * 
 * Usage:
 *   generator-component          # Run interactive generator
 * 
 * The generator will guide you through creating a component with:
 * - Component name and Storybook group
 * - Field definitions (types, required flags)
 * - Style format selection (LESS, CSS, or none)
 * - Optional behavior.js inclusion
 * 
 * All generated files go to: ./components/{component-tag}/
 */

import { generateComponent } from '../lib/index.js'

function isPromptCancellationError (error) {
  if (!error) return false

  if (error.code === 'ERR_USE_AFTER_CLOSE') return true

  const message = `${error.message || ''}`.toLowerCase()
  return message.includes('cancelled')
}

function exitWithoutError () {
  process.stdout.write('\n')
  process.exit(0)
}

process.on('SIGINT', exitWithoutError)

process.on('uncaughtException', error => {
  if (isPromptCancellationError(error)) {
    exitWithoutError()
    return
  }

  console.error('Error:', error.message)
  process.exit(1)
})

generateComponent().catch(error => {
  if (isPromptCancellationError(error)) {
    exitWithoutError()
    return
  }

  console.error('Error:', error.message)
  process.exit(1)
})
