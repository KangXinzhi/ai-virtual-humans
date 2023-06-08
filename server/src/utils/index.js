import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";

const chat = new ChatOpenAI({ temperature: 0.5 });


export const chatLangChain = async (topic, answer) => {
  // 将有用的资料拿去生成最终答案
  const finalRes = await chat.call([
   new HumanChatMessage(
    `
    如果你作为一个托福考试的阅卷老师，你要对学生的写作进行打分。
    题目要求如下：${topic}。
    你会从以下五个方面对学生的独立写作作文进行打分评测：
      1.论点清晰度：评估学生的观点是否明确、清晰，并能够在整篇作文中得到恰当的呈现。一个清晰的论点能够让读者准确理解学生的立场和主题。
      2.支持材料：评估学生是否能够提供充分、具体和相关的支持材料来支撑他们的观点。支持材料应该具备说服力，并与论点紧密相关，可以是事实、例子、数据或者个人经验。
      3.语法和词汇：评估学生的语法和词汇使用是否准确、恰当。学生应该避免语法错误、拼写错误和词汇重复，而应该展示对多样化语言表达方式的掌握。
      4.思维逻辑：评估学生的思维逻辑是否合理和连贯。学生的观点和支持材料应该能够形成一条清晰的思维线索，并能够在整篇作文中保持连贯性和一致性。
      5.组织结构：评估学生的写作是否有良好的组织结构，包括合适的段落划分和过渡，以及逻辑清晰的论证结构。一个良好的组织结构能够帮助读者理解和跟随学生的论证思路。

    接下来我会给你学生的回答，请根据上面的规则进行评分
    返回给我的结果是一个JSON文件，其中score对应每一项的评分，每一项的满分100分，evidence是您评分的依据和score中打的分数对应大约300字左右。，suggest是您给学生的意见和建议大约300字左右。
      {
        score: {
        '论点清晰度':'xx',
        '支持材料':'xx',
        '语法和词汇':'xx',
        '思维逻辑':'xx',
        '组织结构':'xx'
        },
        evidence: 'xxx',
        suggest: 'xxxx'
      }
      `
      ),
    new AIChatMessage('还有什么需要注意的地方么？'),
    new HumanChatMessage(`打分一定要严格，按照上面的标准打分，如果和题目不符直接打低分`),
    new AIChatMessage('好的没问题，我会严格打分，请给我发送材料和学生的回答，我将按照您的要求返回json给您'),
    new HumanChatMessage(`学生的回答是：${answer}`)
  ]);

  return finalRes;
}