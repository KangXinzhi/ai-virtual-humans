import fs from "fs";
import path from "path";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";

const chat = new ChatOpenAI({ temperature: 1 });
const directoryPath = "src/files";
const loadDocs = async (filePath: string) => {
  const extname = path.extname(filePath);
  let loader;

  switch (extname) {
    case ".txt":
      loader = new TextLoader(filePath);
      break;
    case ".json":
      loader = new JSONLoader(filePath);
      break;
    case ".pdf":
      loader = new PDFLoader(filePath);
      break;
    case ".docx":
      loader = new DocxLoader(filePath);
      break;
    default:
      console.log(`Unsupported file type: ${extname}`);
      return [];
  }

  return loader.load();
};

const loadAllDocs = async () => {
  const files = fs.readdirSync(directoryPath);
  const promises = files.map(async file => {
    const filePath = path.join(directoryPath, file);
    return loadDocs(filePath);
  });
  const docsArray = await Promise.all(promises);
  return docsArray.flat();
};

let docsModal = await loadAllDocs();


docsModal = docsModal.map(item => {
  // 单独处理pdf文件中的大量的\n
  if (item?.metadata?.pdf) {
    const newItem = { ...item };
    newItem.pageContent = newItem.pageContent.replace(/\n/g, '');
    // console.log(newItem);
    return newItem;
  }
  return item;
});

console.log('docsModal',docsModal);

// Load the docs into the vector store
const vectorStore = await HNSWLib.fromDocuments(docsModal, new OpenAIEmbeddings());

const QUESTION = '我刚刚问了你哪些人呢？';

// 搜出相关的文档
const result = await vectorStore.similaritySearchWithScore(QUESTION, 2);
const docs = result.map(res => res[0]);

console.log("docs", docs);

const res = await chat.call([
  new HumanChatMessage(
    `Now, I will show you ${docs.length} context
    ------
    ${docs.map((doc, index) => (
      `${index + 1} context:
       ${doc.pageContent}}
      `
    ))}
    ------
    I'll give you a question.
    with these context, I want you to tell me:
    if the can answer the question please answer question 
    if cannot answer the question please  answer question by you own knowledge
    If I ask a question in Chinese, please answer it in Chinese. If I ask a question in English, please answer it in English.
    Please answer the question directly, without stating the basis for the above
    `
  ),
  new AIChatMessage('Sure, please show me your question'),
  new HumanChatMessage(QUESTION)
]);


console.log(res);