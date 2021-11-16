import React from "react"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void
  rollState: RolllStateType
  updateRollState?: (roll: string) => void
}
export const RollStateSwitcher: React.FC<Props> = ({ updateRollState, initialState = "unmark", size = 40,
onStateChange, rollState }) => {
  // const [rollState, setRollState] = useState(initialState)

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    if (onStateChange) {
      onStateChange(next)
    }
    if (next) {
      updateRollState?.(next)
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
