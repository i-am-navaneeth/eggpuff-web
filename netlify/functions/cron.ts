import { checkScoreAndNotify } from '../../lib/scoreWatcher'

export default async () => {
  await checkScoreAndNotify()

  return {
    statusCode: 200,
    body: 'Cron executed',
  }
}