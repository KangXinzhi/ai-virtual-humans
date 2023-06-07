import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import formidable from 'formidable'
import Nls from 'alibabacloud-nls'

const sleep = waitTimeInMs => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
const URL = 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1'
const APPKEY = 'muJTPvu1G5ZFpFMN' // 获取Appkey请前往控制台：https://nls-portal.console.aliyun.com/applist
const TOKEN = '1e821a8c5de2410d90e160aae1e7a6ba' // 获取Token具体操作，请参见：https://help.aliyun.com/document_detail/450514.html

// set bodyparser
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    // const form = new formidable()

    formidable().parse(req, async (err, fields, files) => {
      console.log('err', err)
      console.log('fields', fields)

      console.log('files', files)
      const { file } = files
      const audioStream = fs.createReadStream(file.filepath, {
        encoding: 'binary',
        highWaterMark: 10240,
      })
      const b1 = []

      audioStream.on('data', (chunk) => {
        const b = Buffer.from(chunk, 'binary')
        b1.push(b)
      })

      audioStream.on('close', async () => {
        console.log(b1)
        console.log(b1.length)

        let closeSlogan = true
        while (closeSlogan) {
          const sr = new Nls.SpeechRecognition({
            url: URL,
            appkey: APPKEY,
            token: TOKEN,
          })

          sr.on('started', (msg) => {
            console.log('Client recv started:', msg)
          })

          sr.on('changed', (msg) => {
            console.log('Client recv changed:', msg)
          })

          sr.on('completed', (msg) => {
            console.log('Client recv completed:', msg)
          })

          sr.on('closed', () => {
            console.log('Client recv closed')
            closeSlogan = false
          })

          sr.on('failed', (msg) => {
            console.log('Client recv failed:', msg)
          })

          try {
            await sr.start(sr.defaultStartParams(), true, 6000)
          }
          catch (error) {
            console.log('error on start:', error)
            continue
          }

          try {
            for (const b of b1) {
              if (!sr.sendAudio(b))
                throw new Error('send audio failed')

              await sleep(20)
            }
          }
          catch (error) {
            console.log('sendAudio failed:', error)
            continue
          }

          try {
            console.log('close...')
            await sr.close()
          }
          catch (error) {
            console.log('error on close:', error)
            continue
          }
          await sleep(2000)
        }
      })
      resolve({ err, fields, files })
    })
  })

  // return the data back or just do whatever you want with it
  res.status(200).json({
    status: 'ok',
    data,
  })
}
