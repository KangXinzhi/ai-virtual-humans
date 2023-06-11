import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import './App.css'
import { World, Cube, Model, OrbitCamera, Skybox, useLoop, Editor } from 'lingo3d-react'
import SpeechRecognitionSingleton from './utils/SpeechRecognitionSingleton'
import SpeechSynthesisSingleton from './utils/SpeechSynthesisSingleton'
import LoadingSpinner from './components/LoadingSpinner'
import { debounce } from './utils'

const recognition = SpeechRecognitionSingleton.getInstance()
const synth = SpeechSynthesisSingleton.getInstance()


function App() {
  const [msg, setMsg] = useState('')
  const [outMessage, setOutputMessage] = useState('')
  const [tempMsg, setTempMsg] = useState('')
  const [openMic, setOpenMic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pose, setPose] = useState('idle')
  let final_transcript = ""

  const onSpeechEnd = () => {
    setPose('idle')
    console.log('Speech completed')
    // 在这里执行后续操作
  }

  const handleSend = () => {
    if (isLoading || !msg) return

    setIsLoading(true)
    // setPose('talking')
    // synth.speak('谷歌展出了他们的智能语音助理', onSpeechEnd)

    // 将api_url替换为你的API接口地址
    const api_url = 'https://ai.kidkid.tech/api/get-answer'

    // synth.speak('请耐心等候', onSpeechEnd)
    // 发送POST请求
    fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: msg }),
    })
      .then(response => response.json())
      .then((data) => {
        // 处理响应数据
        console.log(data)
        setPose('talking')
        // synth.speak(JSON.stringify(data.text),onSpeechEnd)
        synth.speak('谷歌展出了他们的智能语音助理', onSpeechEnd)
        setOutputMessage(JSON.stringify(data.text))
        setIsLoading(false)

      })
      .catch((error) => {
        console.error(error)
        setPose('talking')
        synth.speak('网络有些问题，请稍后重试', onSpeechEnd)
        setIsLoading(false)
      })
  }

  const handlePressStart = async () => {
    setMsg('')
    setOutputMessage('')
    setOpenMic(true)
  };

  const handlePressEnd = () => {
    console.log('handlePressEnd')
    if (tempMsg) {
      setMsg(msg + tempMsg)
    }
    setTempMsg('')
    handleSend()
    setOpenMic(false)
  };


  recognition.onresult = function (event: any) {
    let interim_transcript = "";

    // Loop through the results from the speech recognition object.
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    if (final_transcript) {
      setTempMsg('')
      setMsg(msg + final_transcript)
    }

    if (interim_transcript) {
      setTempMsg(`${interim_transcript}`)
    }

    console.log('final_transcript', final_transcript, 'interim_transcript', interim_transcript)
  }

  useEffect(() => {
    if (!recognition)
      return
    if (openMic){
      recognition.start()
    }else{
      recognition.abort()
    }
      
  }, [openMic])

  return (
    <div>
      <World skybox={'sky1.jpg'}>
        <Model
          src="Girl.fbx"
          scale={8}
          animations={{ idle: 'Idle.fbx', talking: 'Talking.fbx', waving: 'Waving.fbx',asking: 'Asking.fbx' }}
          animation={pose}
          x={-300}
          y={-100}
          z={100}
          rotationY={50}
        />
        {/* <OrbitCamera  
          active
          // rotationY={320} 
          // rotationX={10} 
          // rotationZ={-20} 
        /> */}
        {/* <Editor/> */}
      </World>

      <div className=" w-[30vw] h-full absolute right-0 top-0 bg-black text-white bg-opacity-30 ">
        {openMic && (
          <span className="absolute left-[50%] top-[50%] flex items-center justify-center">
            <div className="animate-ping rounded-full bg-green-500 w-12 h-12 absolute -left-6 -top-6"></div>
            <div className="rounded-full bg-green-400 w-12 h-12 absolute -left-6 -top-6"></div>
          </span>
        )}
        <div className="p-4">
          <div className="flex items-start">
            <span className="mr-2 font-bold">问题：{msg}{tempMsg}</span>
          </div>
          <hr className="my-2" />
          {isLoading && (<LoadingSpinner />)}
          <div className="whitespace-pre-wrap">{outMessage}</div>
        </div>
        {!isLoading && (
          <div className="box-border absolute bottom-0 w-full h-[300px]  flex items-center justify-center">
            <div
              className="w-16 h-16 flex items-center justify-center bg-green-400 rounded-full cursor-pointer"
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
            >
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="28496" width="2.5rem" height="2.5rem"><path d="M841.142857 402.285714v73.142857c0 169.142857-128 308.553143-292.571428 326.838858V877.714286h146.285714c20.004571 0 36.571429 16.566857 36.571428 36.571428s-16.566857 36.571429-36.571428 36.571429H329.142857c-20.004571 0-36.571429-16.566857-36.571428-36.571429s16.566857-36.571429 36.571428-36.571428h146.285714v-75.446857c-164.571429-18.285714-292.571429-157.696-292.571428-326.838858v-73.142857c0-20.004571 16.566857-36.571429 36.571428-36.571428s36.571429 16.566857 36.571429 36.571428v73.142857c0 141.129143 114.870857 256 256 256s256-114.870857 256-256v-73.142857c0-20.004571 16.566857-36.571429 36.571429-36.571428s36.571429 16.566857 36.571428 36.571428z m-146.285714-219.428571v292.571428c0 100.571429-82.285714 182.857143-182.857143 182.857143s-182.857143-82.285714-182.857143-182.857143V182.857143c0-100.571429 82.285714-182.857143 182.857143-182.857143s182.857143 82.285714 182.857143 182.857143z" fill="#ffffff" p-id="28497"></path></svg>
            </div>
          </div>
        )}
      </div>
    </div>


  )
}

export default App
