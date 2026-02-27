import { useApp } from '../store/AppContext'
import { Card } from '../types'

interface Props {
  card: Card
  onClick: () => void
}

export function CardItem({ card, onClick }: Props) {
  const { state } = useApp()
  const projectType = state.projectTypes.find(
    (pt) => pt.id === card.projectTypeId
  )

  const totalItems = card.todoItems.length
  const completedItems = card.todoItems.filter((item) => item.completed).length
  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  const isComplete = totalItems > 0 && completedItems === totalItems

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer p-3 transition-all hover:-translate-y-0.5 border border-transparent hover:border-blue-100"
    >
      {projectType && (
        <div
          className="text-xs text-white font-semibold px-2 py-0.5 rounded-full inline-block mb-2"
          style={{ backgroundColor: projectType.color }}
        >
          {projectType.name}
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-800 leading-snug">
        {card.title}
      </h3>

      {card.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {card.description}
        </p>
      )}

      {totalItems > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isComplete ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {isComplete ? '완료!' : `${completedItems} / ${totalItems}`}
            </span>
            <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: isComplete ? '#00875a' : '#0052cc',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
