import React from 'react'

import { useContent } from '../contentProvider'
import Step1 from '../step1'
import Step2 from '../step2'

function CoolRadarChart() {
  const { step } = useContent()

  return (
    <div>
      <div>
        {step === 0 && <Step1 />}
        {step === 1 && <Step2 />}
      </div>
    </div >
  )
}

export default CoolRadarChart
