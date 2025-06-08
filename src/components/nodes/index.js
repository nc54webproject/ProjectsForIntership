import { TextMessageNode } from "./text-message-node"
import { QuestionNode } from "./question-node"
import { ConditionalNode } from "./conditional-node"
import  EndChatNode  from "./end-chat-node"
import { RouterNode } from "./router-node"
import { DelayNode } from "./delay-node"
import { CollectInputNode } from "./collect-input-node"
import { ApiIntegrationNode } from "./api-integration-node"
import { BroadcastNode } from "./broadcast-node"
import { TagNode } from "./tag-node"

export const nodeTypes = {
  textMessage: TextMessageNode,
  question: QuestionNode,
  conditional: ConditionalNode,
  endChat: EndChatNode,
  router: RouterNode,
  delay: DelayNode,
  collectInput: CollectInputNode,
  apiIntegration: ApiIntegrationNode,
  broadcast: BroadcastNode,
  tag: TagNode,
}

export { 
  TextMessageNode, 
  QuestionNode, 
  ConditionalNode, 
  EndChatNode, 
  RouterNode,
  DelayNode,
  CollectInputNode,
  ApiIntegrationNode,
  BroadcastNode,
  TagNode
}