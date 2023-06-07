import { HumanChatMessage } from 'langchain/schema'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { extractOuterObject } from '@/utils/api'

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.6,
  callbacks: [
    {
      handleLLMStart: async (llm, prompts) => {
        console.log(JSON.stringify(llm, null, 2))
        console.log(JSON.stringify(prompts, null, 2))
      },
      handleLLMEnd: async (output) => {
        console.log(JSON.stringify(output, null, 2))
      },
      handleLLMError: async (err) => {
        console.error(err)
      },
    },
  ],
  timeout: 180000,
})

async function check(answer) {
  const response = await chat.call([
    new HumanChatMessage(
      `
      帮我检查下英文作文，看看有无语法错误。例如：句子结构错误、缺少空格、缺少句号、单词拼写错误、单词单复数错误、大小写错误等方面问题。返回一个json。格式如下：
      {
        "revisedEssay":"xx\nxxxx"
        }
      这有一个例子，你可以学习下：
      作文: 'It is sad that taking risks brings a lot of benefit.\n However, it also has some drawbacks.'
      返回: {
          "revisedEssay":  "It is said that taking risks brings a lot of benefits.\n However, it also gives us some drawbacks."
        }
      要求: revisedEssay中的换行\n不可省略
      下面我提供我的英文作文：
      ----
      ${answer}
      ----
      请根据上面的例子和要求给我返回一个JSON。
    `),
  ])

  return response
}

export default async function handler(req, res) {
  try {
    const { answer } = req.body // 获取请求体中的data字段
    const scoreResponse = await check(answer)
    const checkMessage = extractOuterObject(scoreResponse.text)
    // 校验下返回的字段
    if (checkMessage && checkMessage.revisedEssay)
      res.status(200).json(checkMessage)
    else
      res.status(400).json({ error: 'check字段不正确' })
  }
  catch (error) {
    res.status(500).json({ error })
  }
}
