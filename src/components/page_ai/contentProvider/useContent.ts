import { useContext } from 'react'

import type { Context } from './contentProvider'
import { ContentContext } from './contentProvider'

export default (): Context => useContext(ContentContext)
