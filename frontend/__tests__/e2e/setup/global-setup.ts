import { execSync } from 'node:child_process'

export default async function globalSetup() {
  try {
    execSync(
      'docker compose exec -T backend rails e2e:setup RAILS_ENV=test',
      { stdio: 'inherit' },
    )
  }
  catch (error) {
    console.error('Failed to setup E2E test data:', error)
    throw error
  }
}
