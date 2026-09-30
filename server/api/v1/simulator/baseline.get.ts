import * as simulatorService from '../../../modules/simulator/simulator.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return simulatorService.baseline(user.id)
})
