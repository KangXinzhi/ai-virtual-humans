import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { World, Model, OrbitCamera, Editor, usePreload } from 'lingo3d-react'
import SpeechRecognitionSingleton from './utils/SpeechRecognitionSingleton'
import SpeechSynthesisSingleton from './utils/SpeechSynthesisSingleton'
import LoadingSpinner from './components/LoadingSpinner'

const recognition = SpeechRecognitionSingleton.getInstance()
const synth = SpeechSynthesisSingleton.getInstance()

function AiVirtualHuman() {
  const [msg, setMsg] = useState('')
  const [outMessage, setOutputMessage] = useState('')
  const [tempMsg, setTempMsg] = useState('')
  const [openMic, setOpenMic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pose, setPose] = useState('idle')
  let final_transcript = ""

  const onSpeechEnd = useCallback(() => {
    setPose("idle");
  }, []);

  const onSpeechStart = useCallback(() => {
    setPose("talking");
  }, []);

  const handleSend = () => {
    console.log(msg)
    if (isLoading || !msg) return;
    setIsLoading(true);

    // 将api_url替换为你的API接口地址
    const api_url = "https://ai.kidkid.tech/api/get-answer";
    // synth.speak('请耐心等候', onSpeechEnd)
    // 发送POST请求
    fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: msg }),
    })
      .then((response) => response.json())
      .then((data) => {
        // 处理响应数据
        // synth.speak('谷歌展出了他们的智能语音助理', onSpeechEnd)
        setOutputMessage(data.data);
        synth.speak(data.data, onSpeechStart, onSpeechEnd);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        synth.speak("网络有些问题，请稍后重试", onSpeechStart, onSpeechEnd);
        setIsLoading(false);
      });
  };

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
    setOpenMic(false)
  };


  recognition.onresult = function (event: any) {
    let interim_transcript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
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
      setTempMsg(interim_transcript)
    }
  }

  useEffect(() => {
    if (!recognition)
      return
    if (openMic) {
      recognition.start()
    } else {
      recognition.abort()
      handleSend()
    }

  }, [openMic])

  return (
    <div>
      <World skybox={"sky1.jpg"}>
        <Model
          src="Girl.fbx"
          scale={7}
          animations={{
            idle: "Idle.fbx",
            talking: "Talking.fbx",
          }}
          animation={pose}
          x={-300}
          y={-100}
          z={100}
          rotationY={20}
        />
        {/* <OrbitCamera
          active
          rotationY={320}
          rotationX={10}
          rotationZ={-20}
        /> */}
        {/* <Editor /> */}
      </World>


      <div className="w-[30vw] min-w-[400px] h-full absolute right-0 top-0 bg-black text-white bg-opacity-10 flex items-center justify-center">
        {openMic && (
          <span className="absolute left-[50%] top-[50%] flex items-center justify-center">
            <div className="animate-ping rounded-full bg-yellow-500 w-12 h-12 absolute -left-6 -top-6"></div>
            <div className="rounded-full bg-yellow-400 w-12 h-12 absolute -left-6 -top-6"></div>
          </span>
        )}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-[80%] min-h-[400px] p-8 rounded-lg shadow-lg">
          <div className="text-white font-bold text-xl mb-4">
            创新伙伴AI助手
          </div>
          {msg ? (
            <div className="bg-white bg-opacity-10 p-4 rounded-lg max-h-[30vh] overflow-y-scroll">
              <p className="text-white mb-2">问题：</p>
              <p className="text-white">{msg}{tempMsg}</p>
            </div>
          ) : (
            <p className="text-white mb-2">请长按按钮，开始语音输入</p>
          )}
          {isLoading && <LoadingSpinner />}
          {outMessage && (
            <div className="mt-4 bg-white bg-opacity-10 p-4 rounded-lg max-h-[50vh] overflow-y-scroll">
              <p className="text-white mb-2">回答：</p>
              <p className="text-white whitespace-pre-wrap">{outMessage}</p>
            </div>
          )}
        </div>
        {!isLoading && (
          <div className="box-border absolute bottom-0 w-full h-[200px]  flex items-center justify-center">
            <div
              className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={openMic ? handlePressEnd : undefined}
            >
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="28496"
                width="2.5rem"
                height="2.5rem"
              >
                <path
                  d="M841.142857 402.285714v73.142857c0 169.142857-128 308.553143-292.571428 326.838858V877.714286h146.285714c20.004571 0 36.571429 16.566857 36.571428 36.571428s-16.566857 36.571429-36.571428 36.571429H329.142857c-20.004571 0-36.571429-16.566857-36.571428-36.571429s16.566857-36.571429 36.571428-36.571428h146.285714v-75.446857c-164.571429-18.285714-292.571429-157.696-292.571428-326.838858v-73.142857c0-20.004571 16.566857-36.571429 36.571428-36.571428s36.571429 16.566857 36.571429 36.571428v73.142857c0 141.129143 114.870857 256 256 256s256-114.870857 256-256v-73.142857c0-20.004571 16.566857-36.571429 36.571429-36.571428s36.571429 16.566857 36.571428 36.571428z m-146.285714-219.428571v292.571428c0 100.571429-82.285714 182.857143-182.857143 182.857143s-182.857143-82.285714-182.857143-182.857143V182.857143c0-100.571429 82.285714-182.857143 182.857143-182.857143s182.857143 82.285714 182.857143 182.857143z"
                  fill="#ffffff"
                  p-id="28497"
                ></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const App = () => {
  const progress = usePreload(
    ["sky1.jpg", "Girl.fbx", "Idle.fbx", "Talking.fbx"],
    "12.1mb"
  );
  if (progress < 100)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          left: 0,
          top: 0,
          backgroundColor: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        loading {Math.round(progress)}%
      </div>
    );

  return <AiVirtualHuman />;
};

export default App
