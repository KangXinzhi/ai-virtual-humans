import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";

const chat = new ChatOpenAI({ temperature: 0.5 });


export const chatLangChain = async (topic) => {
  const finalRes = await chat.call([
    new HumanChatMessage(`我的问题是：${topic}`)
  ]);

  return finalRes;
};