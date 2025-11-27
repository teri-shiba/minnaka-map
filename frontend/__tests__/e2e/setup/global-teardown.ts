import { execSync } from 'node:child_process'

export default async function globalTeardown() {
  try {
    if (process.env.CI) {
      execSync(
        'cd ../backend && bundle exec rails e2e:teardown RAILS_ENV=test',
        { stdio: 'inherit' },
      )
    }
    else {
      execSync(
        'docker compose exec -T backend rails e2e:teardown RAILS_ENV=test',
        { stdio: 'inherit' },
      )
    }
  }
  catch (error) {
    console.error('Failed to cleanup E2E test data:', error)
  }
}
