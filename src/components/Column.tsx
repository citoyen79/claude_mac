import { Card, Column as ColumnType } from '../types'
import { CardItem } from './CardItem'

interface Props {
  column: ColumnType
  cards: Card[]
  onCardClick: (id: string) => void
  onAddCard: () => void
}

const columnColors: Record<string, string> = {
  todo: '#E2E8F0',
  'in-progress': '#FEF3C7',
  hold: '#FEE2E2',
  done: '#D1FAE5',
  backup: '#E0E7FF',
}

const columnHeaderColors: Record<string, string> = {
  todo: '#64748B',
  'in-progress': '#D97706',
  hold: '#DC2626',
  done: '#059669',
  backup: '#4F46E5',
}

export function Column({ column, cards, onCardClick, onAddCard }: Props) {
  return (
    <div
      className="w-72 shrink-0 flex flex-col rounded-xl overflow-hidden"
      style={{ backgroundColor: columnColors[column.id] ?? '#ebecf0', maxHeight: '100%' }}
    >
      {/* Column header */}
      <div
        className="px-3 py-2.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: columnColors[column.id] ?? '#ebecf0' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: columnHeaderColors[column.id] ?? '#888' }}
          />
          <span
            className="text-sm font-bold"
            style={{ color: columnHeaderColors[column.id] ?? '#555' }}
          >
            {column.title}
          </span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60"
          style={{ color: columnHeaderColors[column.id] ?? '#555' }}
        >
          {cards.length}
        </span>
      </div>

      {/* Cards list */}
      <div className="flex-1 px-2 pb-2 overflow-y-auto space-y-2 min-h-0 pt-1">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onClick={() => onCardClick(card.id)}
          />
        ))}
        {cards.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-400">
            카드가 없습니다
          </div>
        )}
      </div>

      {/* Add card button */}
      <div className="px-2 pb-2 shrink-0">
        <button
          onClick={onAddCard}
          className="w-full py-1.5 px-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-white/60 flex items-center gap-1.5 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>카드 추가</span>
        </button>
      </div>
    </div>
  )
}
