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

generateComponent().catch(error => {
  console.error('Error:', error.message)
  process.exit(1)
})
