import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";

const chat = new ChatOpenAI({ temperature: 1 });
// Create docs with a loader
const loader = new TextLoader("src/files/index.txt");
const docsModal = await loader.load();

// Load the docs into the vector store
const vectorStore = await HNSWLib.fromDocuments(docsModal, new OpenAIEmbeddings());

const QUESTION = '谁是二郎？';

// 搜出相关的文档
const result = await vectorStore.similaritySearchWithScore(QUESTION, 15);
const docs = result.map(res => res[0]);

// console.log(docs);
// 让GPT决定哪些资料有用
let positiveRes = await Promise.all(docs.map(async (docpiece) => {
  const res = await chat.call([
    new HumanChatMessage(
      `Now, I will show you a context
    ------
    ${docpiece.pageContent}
    ------
    I'll give you a question.
    Ignoring all your previous knowledge, with these context, I want you to tell me:
    zeta. can answer the question
    theta. cannot answer the question
    just return me the option value, don't add any extra text.
    `
    ),
    new AIChatMessage('Sure, please show me your question'),
    new HumanChatMessage(QUESTION)
  ]);
  console.log(res);
  if (res.text.indexOf('zeta') !== -1 || (res.text.indexOf('theta') === -1 && res.text.indexOf('cannot') === -1)) {
    return docpiece;
  }
}));

positiveRes = positiveRes.filter(r => r);

if (positiveRes.length === 0) {
  console.log('没有在文档里找到相关资料');
}

// 将有用的资料拿去生成最终答案
const finalRes = await chat.call([
  new HumanChatMessage(
    `
Now, I will show you a context
------
${positiveRes.slice(0, 3).map(item => item?.pageContent).join('\n')}
------
I'll give you a question.
Ignoring all your previous knowledge, with these context,
Please answer the question
请用中文回答
        `
  ),
  new AIChatMessage('Sure, please show me your question'),
  new HumanChatMessage(QUESTION)
]);
console.log(finalRes);