import { useContent } from '../contentProvider'

const mockData = [
  {
    id: 1,
    title: 'Describe your favorite hobby',
    description: 'Talk about a hobby that you enjoy and explain why it is your favorite.',
  },
  {
    id: 2,
    title: 'Discuss the benefits of reading',
    description: 'Discuss the advantages and benefits of reading books, and how it can positively impact individuals.',
  },
  {
    id: 3,
    title: 'Describe a memorable travel experience',
    description: 'Share a travel experience that has left a lasting impression on you and explain why it was memorable.',
  },
  {
    id: 4,
    title: 'Discuss the importance of learning a foreign language',
    description: 'Discuss the advantages and significance of learning a foreign language, both academically and personally.',
  },
  {
    id: 5,
    title: 'Talk about a recent technological advancement',
    description: 'Choose a recent technological advancement and discuss its impact on society and people\'s lives.',
  },
  {
    id: 6,
    title: 'Describe a challenging situation you have faced',
    description: 'Describe a difficult situation you have encountered and explain how you handled it and what you learned from it.',
  },
]

export default function Step1() {
  const { handleChooseTheme } = useContent()

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-gray-200 mb-4 text-2xl p-4 font-bold mb-6">
        选择一个对话的主题
      </div>
      <div className="overflow-y-scroll">
        <div className="grid grid-cols-1 gap-4">
          {mockData.map(item => (
            <div key={item.id} className="bg-white rounded-md shadow-md p-4 cursor-pointer" onClick={() => { handleChooseTheme(item.description) }}>
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
