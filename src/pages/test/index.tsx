import {
  Model,
  OrbitCamera,
  UI,
  World,
  useAnimation
  , usePreload, useWindowSize,
} from 'lingo3d-react'

function Game() {
  // starting animation, apple watch rotates from 180 to 45 degress in 5 seconds
  // 初始动画，苹果手表在5秒内从180度旋转到45度
  const anim = useAnimation({ from: 180, to: 45, duration: 5000 })

  const windowSize = useWindowSize()
  const fov = windowSize.width < windowSize.height ? 100 : 75

  return (
    // backgroud HTML
    // 背景 HTML
    <div
      className="bg-cover bg-center w-screen h-screen absolute overflow-hidden text-white"
      style={{ backgroundImage: 'url(bg.jpg)' }}
    >
      <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-t from-gray-700 to-black opacity-75" />
      <div className="relative">
        <div
          className="text-5xl font-bold text-center"
          style={{ transform: 'scale(2.5) translateY(50%)' }}
        >
          Apple
          <br />
          Watch
          <br />
          Series
        </div>
      </div>

      {/* 3d world */}
      {/* 3d 场景 */}
      <World color="transparent" defaultLight="studio" exposure={2}>
        {/* apple watch model */}
        {/* 苹果手表模型 */}
        <Model
          src="apple_watch/scene.gltf"
          rotationZ={anim}
          rotationX={45}
          boxVisible={false}
          metalnessFactor={1}
          roughnessFactor={0.5}
          y={-30}
        />

        {/* orbit camera's innerZ determines how far away camera is from the center of the subject */}
        {/* 轨道相机的innerZ确定相机距离目标的距离 */}
        <OrbitCamera active innerZ={150} autoRotate enableDamping fov={fov} />

        {/* foreground HTML is rendered in UI layer, which is always above 3d world */}
        {/* 前景HTML在UI层渲染，UI层总是在3d场景之上 */}
        <UI>
          <div className="absolute right-0 w-full p-6">
            <div className="text-center text-lg opacity-50">
              swipe to rotate
            </div>
            <div className="text-center text-xs">powered by Lingo3D</div>
          </div>
        </UI>
      </World>
    </div>
  )
}

// loading screen
// 加载画面
function Test() {
  const progress = usePreload(
    [
      'bg.jpg',
      'apple_watch/scene.bin',
      'apple_watch/scene.gltf',
      'apple_watch/textures/material_baseColor.jpeg',
    ],
    '573kb',
  )

  if (progress < 100) {
    return (
      <div className="w-screen h-screen absolute text-white flex justify-center items-center">
        loading, please wait
      </div>
    )
  }

  return <Game />
}

export default Test
