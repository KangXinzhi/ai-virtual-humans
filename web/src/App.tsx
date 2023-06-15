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

  const message = msg + tempMsg

  let final_transcript = ""

  const onSpeechEnd = useCallback(() => {
    setPose("idle")
  }, []);

  const onSpeechStart = useCallback(() => {
    setPose("talking")
  }, []);

  const handleSend = () => {
    if (!message) {
      setIsLoading(false)
      return
    };
    setIsLoading(true);
    // 将api_url替换为你的API接口地址
    const api_url = "https://ai.kidkid.com/api/get-answer";
    // synth.speak('请耐心等候', onSpeechEnd)
    // 发送POST请求
    fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: message }),
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
    setTempMsg('')
    setOutputMessage('')
    setOpenMic(true)
  };

  const handlePressEnd = () => {
    console.log('handlePressEnd')
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

    if (interim_transcript) {
      setTempMsg(interim_transcript)
    }

    if (final_transcript) {
      setTempMsg('')
      setMsg(msg + final_transcript)
    }
  }

  useEffect(() => {
    if (!recognition)
      return
    if (openMic) {
      setPose("idle")
      synth.cancel()
      recognition.start()
    } else {
      recognition.abort()
      setIsLoading(true)
      setTimeout(() => {
        handleSend()
      }, 1000)
    }
  }, [openMic])

  useEffect(() => {
    return (() => {
      setPose("idle")
      synth.cancel()
    })
  }, [])

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
          y={-40}
          rotationY={pose === 'idle' ? 30 : 10}
        />
        {/* <OrbitCamera 
          // active
        // rotationY={320}
        // rotationX={10}
        // rotationZ={-20}
        // />
        */}
        {/* <Editor /> */}
      </World>


      <div className="w-[30vw] min-w-[400px] h-full absolute right-0 top-0 bg-black text-white bg-opacity-10 flex flex-col items-center justify-center">
        {openMic && (
          <span className="absolute left-[50%] top-[50%] flex items-center justify-center">
            <div className="animate-ping rounded-full bg-yellow-500 w-12 h-12 absolute -left-6 -top-6"></div>
            <div className="rounded-full bg-yellow-400 w-12 h-12 absolute -left-6 -top-6 flex justify-center items-center">
            </div>
          </span>
        )}
        <div className=" bg-gradient-to-r from-blue-500 to-purple-500 w-[80%] min-h-[50%] p-8 rounded-lg shadow-lg">
          <div className="text-white font-bold text-xl mb-4">
            创新伙伴AI助手
          </div>
          {message ? (
            <div className="bg-white bg-opacity-10 p-4 rounded-lg max-h-[30vh] overflow-y-scroll">
              <p className="text-white mb-2">问题：</p>
              <p className="text-white">{message}</p>
            </div>
          ) : (
            <p className="text-white mb-2">点击下方按钮，开始语音输入</p>
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
          <div className="w-full box-border absolute bottom-[10%] flex items-center justify-center">
            <div
              className="text-lg cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-full shadow-md transition duration-300 ease-in-out"
              onClick={openMic ? handlePressEnd : handlePressStart}
            >
              {openMic ? '结束说话' : '开始说话'}
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
    "6.89mb"
  );
  // if (progress < 100)
  //   return (
  //     <div
  //       style={{
  //         width: "100vw",
  //         height: "100vh",
  //         left: 0,
  //         top: 0,
  //         backgroundColor: "black",
  //         color: "white",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       loading {Math.round(progress)}%
  //     </div>
  //   );

  return <AiVirtualHuman />;
};

export default App
