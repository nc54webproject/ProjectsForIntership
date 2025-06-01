import { TextMessageNode } from "./text-message-node"
import { QuestionNode } from "./question-node"
import { ConditionalNode } from "./conditional-node"
import { DelayNode } from "./delay-node"

export const nodeTypes = {
  textMessage: TextMessageNode,
  question: QuestionNode,
  conditional: ConditionalNode,
  delay: DelayNode,
}

export { TextMessageNode, QuestionNode, ConditionalNode, DelayNode }
