import React, { useRef, useState } from 'react'

function Step2() {
  const [messages, setMessages] = useState<{ sender: string; content: string | Blob }[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePressStart = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' })
      const chunks: BlobPart[] = []

      recorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data)
      })

      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        // const file = new File([audioBlob], 'name.wav')
        // console.log('file', file)
        // 添加录制的音频消息到消息列表
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'user', content: audioUrl },
        ])
      })

      recorder.start()
      setIsRecording(true)
      setMediaRecorder(recorder)
    }
    catch (error) {
      console.error('无法获取音频流:', error)
    }
  }

  const handlePressEnd = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handlePlayAudio = (url: string) => {
    let audio = audioRef && audioRef.current
    audio = new Audio(url)
    audio.play()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="p-4 mb-4 overflow-y-scroll h-[80vh] bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${message.sender === 'user' ? 'chat-start' : 'chat-end'}`}
          >
            <div className="chat-image avatar">
              <div className="w-10 rounded-full bg-gray-300 flex justify-center items-center" style={{ display: 'flex' }}>
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6952" width="80%" height="80%"><path d="M512 85.333333a85.333333 85.333333 0 0 1 85.333333 85.333334c0 31.573333-17.066667 59.306667-42.666666 73.813333V298.666667h42.666666a298.666667 298.666667 0 0 1 298.666667 298.666666h42.666667a42.666667 42.666667 0 0 1 42.666666 42.666667v128a42.666667 42.666667 0 0 1-42.666666 42.666667h-42.666667v42.666666a85.333333 85.333333 0 0 1-85.333333 85.333334H213.333333a85.333333 85.333333 0 0 1-85.333333-85.333334v-42.666666H85.333333a42.666667 42.666667 0 0 1-42.666666-42.666667v-128a42.666667 42.666667 0 0 1 42.666666-42.666667h42.666667a298.666667 298.666667 0 0 1 298.666667-298.666666h42.666666V244.48c-25.6-14.506667-42.666667-42.24-42.666666-73.813333a85.333333 85.333333 0 0 1 85.333333-85.333334M320 554.666667A106.666667 106.666667 0 0 0 213.333333 661.333333 106.666667 106.666667 0 0 0 320 768a106.666667 106.666667 0 0 0 106.666667-106.666667A106.666667 106.666667 0 0 0 320 554.666667m384 0a106.666667 106.666667 0 0 0-106.666667 106.666666 106.666667 106.666667 0 0 0 106.666667 106.666667 106.666667 106.666667 0 0 0 106.666667-106.666667 106.666667 106.666667 0 0 0-106.666667-106.666666z" fill="#fff" p-id="6953"></path></svg>
              </div>
            </div>
            <div className="chat-bubble bg-green-400" onClick={() => { handlePlayAudio(message.content as string) }}>
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4998" width="1.5rem" height="1.5rem"><path d="M297.505158 370.251921c-1.220914-1.220914-2.55998-2.252783-3.796648-3.434312L150.388997 510.144999l147.116161 147.116161c79.25699-79.25699 79.25699-207.752248 0-287.009239zM472.899255 194.865701c-1.213037-1.213037-2.489089-2.331551-3.710003-3.528834l-63.778955 63.778955c1.228791 1.189406 2.496965 2.315798 3.710002 3.528835 140.672887 140.672887 140.672887 369.566634 0 510.231644l63.778956 63.778955c175.835201-175.835201 175.835201-461.954354 0-637.789555z" fill="" p-id="4999"></path><path d="M664.236121 3.528834c-1.213037-1.213037-2.489089-2.323674-3.710002-3.528834l-63.778956 63.778956c1.220914 1.197283 2.496965 2.315798 3.710003 3.528834 246.175583 246.175583 246.175583 646.729794 0 892.905378l63.778955 63.778955c281.345774-281.345774 281.345774-739.117514 0-1020.463289z" fill="" p-id="5000"></path></svg>
            </div>
            <audio controls src={message.content}/>
          </div>
        ))}
      </div>
      {isRecording && (
        <span className="absolute left-[50%] top-[50%] flex items-center justify-center">
          <div className="animate-ping rounded-full bg-green-500 w-12 h-12 absolute -left-6 -top-6"></div>
          <div className="rounded-full bg-green-400 w-12 h-12 absolute -left-6 -top-6"></div>
        </span>
      )}
      <div className="flex items-center justify-center">
        <div
          className="w-16 h-16 flex items-center justify-center bg-green-400 rounded-full cursor-pointer"
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
        >
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="28496" width="3rem" height="3rem"><path d="M841.142857 402.285714v73.142857c0 169.142857-128 308.553143-292.571428 326.838858V877.714286h146.285714c20.004571 0 36.571429 16.566857 36.571428 36.571428s-16.566857 36.571429-36.571428 36.571429H329.142857c-20.004571 0-36.571429-16.566857-36.571428-36.571429s16.566857-36.571429 36.571428-36.571428h146.285714v-75.446857c-164.571429-18.285714-292.571429-157.696-292.571428-326.838858v-73.142857c0-20.004571 16.566857-36.571429 36.571428-36.571428s36.571429 16.566857 36.571429 36.571428v73.142857c0 141.129143 114.870857 256 256 256s256-114.870857 256-256v-73.142857c0-20.004571 16.566857-36.571429 36.571429-36.571428s36.571429 16.566857 36.571428 36.571428z m-146.285714-219.428571v292.571428c0 100.571429-82.285714 182.857143-182.857143 182.857143s-182.857143-82.285714-182.857143-182.857143V182.857143c0-100.571429 82.285714-182.857143 182.857143-182.857143s182.857143 82.285714 182.857143 182.857143z" fill="#ffffff" p-id="28497"></path></svg>
        </div>
      </div>
    </div>
  )
}

export default Step2
