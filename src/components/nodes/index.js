import { TextMessageNode } from "./text-message-node"
import { QuestionNode } from "./question-node"
import { ConditionalNode } from "./conditional-node"
import  EndChatNode  from "./end-chat-node"
import { RouterNode } from "./router-node"

export const nodeTypes = {
  textMessage: TextMessageNode,
  question: QuestionNode,
  conditional: ConditionalNode,
  endChat: EndChatNode,
  router: RouterNode,
}

export { TextMessageNode, QuestionNode, ConditionalNode, EndChatNode, RouterNode }
