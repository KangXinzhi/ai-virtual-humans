import { useState, useEffect, useCallback } from 'react'
import { World, Model, OrbitCamera, Editor, usePreload } from 'lingo3d-react'
import SpeechRecognitionSingleton from './utils/SpeechRecognitionSingleton'
import SpeechSynthesisSingleton from './utils/SpeechSynthesisSingleton'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

const recognition = SpeechRecognitionSingleton.getInstance()
const synth = SpeechSynthesisSingleton.getInstance()

function AiVirtualHuman() {
  const [msg, setMsg] = useState('')
  const [outMessage, setOutputMessage] = useState('')
  const [tempMsg, setTempMsg] = useState('')
  const [openMic, setOpenMic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pose, setPose] = useState('idle')
  const [showAiVirtualHumanIframe, setShowAiVirtualHumanIframe] = useState(false)
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
    setIsLoading(true)
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

  recognition.onend = handleSend

  useEffect(() => {
    if (!recognition)
      return
    if (openMic) {
      setPose("idle")
      synth.cancel()
      recognition.start()
    } else {
      recognition.stop()
    }
  }, [openMic])

  useEffect(() => {
    return (() => {
      setPose("idle")
      synth.cancel()
    })
  }, [])

  //监听父页面 传过来的postmessage
  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (e.origin.includes("http://localhost:3000") || e.origin.includes("https://classroom.dev.uskid.com") || e.origin.includes("https://classroom.kidkid.com")) {
        const { showAiVirtualHumanIframe } = e.data;
        showAiVirtualHumanIframe !== undefined && setShowAiVirtualHumanIframe(showAiVirtualHumanIframe)
      }
    });
  }, []);

  useEffect(() => {
    if (!showAiVirtualHumanIframe) {
      setPose("idle")
      synth.cancel()
    }
  }, [showAiVirtualHumanIframe])

  return (
    <div>
      <World

        skybox={'bg.png'}
      >
        <Model
          src="map.glb"
          scale={2}
          physics="map"
          innerRotationY={180}
          y={-135}
          x={10}
          rotationY={50}
        />
        <Model
          src="Girl.fbx"
          scale={4}
          animations={{
            idle: "Idle.fbx",
            talking: "Talking.fbx",
          }}
          physics="character"
          animation={pose}
          rotationY={pose === 'idle' ? 0 : -30}
          x={pose === 'idle' ? 0 : 30}
        />
        <OrbitCamera
          active
          rotationX={-20}
          y={-70}
          x={10}
        />

        {/* <Editor /> */}
      </World>


      <div className="w-[240px] h-full absolute right-[50%] translate-x-[50%]  top-0 text-white bg-opacity-0 flex flex-col items-center">
        <div className="flex flex-row items-center justify-center">
          {isLoading ? (
            <div className='absolute bottom-[4%]'>
              <LoadingSpinner />
              {message && (
                <div className="bg-white bg-opacity-10 p-4 rounded-lg max-h-[30vh] overflow-y-scroll">
                  <p className="text-white">{message}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="absolute bottom-[10%] text-lg cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out"
              onClick={openMic ? handlePressEnd : handlePressStart}
            >

              {openMic ? (
                <span className='flex justify-between items-center'>
                  <svg viewBox="0 0 1024 1024" p-id="5048" width="20" height="20">
                    <path d="M678.528 642.304c0 17.6-14.4 32-32 32h-268.992a32 32 0 0 1-32-32V381.696a32 32 0 0 1 32-32h268.992c17.6 0 32 14.4 32 32v260.608z" fill="#ffffff" p-id="5049">
                    </path>
                    <path d="M1015.552 512.128a502.656 502.656 0 0 0-503.68-503.68 502.208 502.208 0 0 0-356.096 147.264 502.016 502.016 0 0 0-147.328 356.416 500.288 500.288 0 0 0 146.816 356.736 499.584 499.584 0 0 0 356.544 146.688c277.312-2.816 503.744-226.24 503.744-503.424z m-947.968 0a444.288 444.288 0 0 1 444.288-444.544c246.976 0 447.296 200.128 447.296 444.544 0 244.032-200.32 444.416-447.296 444.416a442.304 442.304 0 0 1-444.288-444.416z" fill="#ffffff" p-id="5050" data-spm-anchor-id="a313x.7781069.0.i3" >
                    </path>
                  </svg>
                  <span className='w-2' />
                  结束
                </span>) : (
                <span className='flex justify-between items-center'>
                  <svg
                    viewBox="0 0 1024 1024"
                    p-id="7747"
                    width="20"
                    height="20"
                  >
                    <path d="M511.999762 652.57394c130.500404 0 235.650867-105.138556 235.650867-235.650867V235.639436A235.186495 235.186495 0 0 0 511.999762 0.000476a235.162681 235.162681 0 0 0-235.650867 235.63896v181.27173A235.174588 235.174588 0 0 0 511.999762 652.57394zM348.850442 235.639436c0-90.623958 72.513455-163.137412 163.14932-163.137412s163.149319 72.513455 163.149319 163.137412v181.27173c0 90.635865-72.513455 163.149319-163.149319 163.14932a162.470622 162.470622 0 0 1-163.14932-163.14932V235.639436z" p-id="7748" fill="#ffffff"></path><path d="M887.224145 478.553556c0-1.80986 1.80986-5.441486 1.80986-7.251345a36.36389 36.36389 0 0 0-36.256727-36.256728c-18.12241 0-34.434961 14.502691-36.244821 32.625101C791.146795 614.507353 664.26611 725.087395 511.999762 725.087395S232.852729 614.51926 207.467066 467.670584c-1.80986-18.12241-18.134317-32.625101-36.24482-32.625101a36.36389 36.36389 0 0 0-36.256727 36.256728v5.429578c29.005382 170.388758 168.578898 302.722836 340.777516 319.035387v170.06727H245.902769a29.076824 29.076824 0 1 0 0 58.153647h532.205892a29.076824 29.076824 0 1 0 0-58.153647H548.256489V795.779083c172.210525-16.312551 311.784041-148.646629 338.967656-317.225527z" p-id="7749" fill="#ffffff">
                    </path>
                  </svg>
                  <span className='w-2' />
                  提问
                </span>)}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

const App = () => {
  const progress = usePreload(
    ["bg.png", "Girl.fbx", "Idle.fbx", "Talking.fbx", "map.glb"],
    "6.67mb"
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
