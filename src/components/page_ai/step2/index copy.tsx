import React, { useEffect, useState } from 'react'
import Recorder from 'recorder-js'

function Step2() {
  const [messages, setMessages] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const audioElement = null

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = handleDataAvailable
      mediaRecorder.onstop = handleRecorderStop
    }

    return () => {
      if (mediaRecorder) {
        mediaRecorder.ondataavailable = null
        mediaRecorder.onstop = null
      }
    }
  }, [mediaRecorder])

  const handleDataAvailable = (event) => {
    const chunks = []
    chunks.push(event.data)

    const audioBlob = new Blob(chunks, { type: 'audio/wav' })
    const audioUrl = URL.createObjectURL(audioBlob)

    setMessages(prevMessages => [
      ...prevMessages,
      { sender: 'user', content: audioUrl },
    ])
  }

  const handleRecorderStop = async () => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = null
      mediaRecorder.onstop = null

      const audioBlob = mediaRecorder.getBlob()
      const formData = new FormData()
      formData.append('file', audioBlob)

      try {
        const response = await fetch('https://ai.kidkid.tech/api/nls/speech-recognition/one-sentence', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        console.log(data)
      }
      catch (error) {
        console.error('请求错误:', error)
      }
    }
  }

  const handlePressStart = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new Recorder(mediaStream, { mimeType: 'audio/wav' })

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

  const handlePlayAudio = (url) => {
    if (audioElement) {
      audioElement.src = url
      audioElement.play()
    }
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
              <div
                className="w-10 rounded-full bg-gray-300 flex justify-center items-center"
                style={{ display: 'flex' }}
              ></div>
            </div>
            <div
              className="chat-bubble bg-green-400"
              onClick={() => {
                handlePlayAudio(message.content)
              }}
            ></div>
            <audio controls src={message.content}></audio>
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
          className="w-16 h-16 flex items-center justify-center"
          style={{ backgroundColor: isRecording ? 'green' : 'red' }}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
        ></div>
      </div>
    </div>
  )
}

export default Step2
