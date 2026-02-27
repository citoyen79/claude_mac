import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { COLUMNS, ColumnId } from '../types'
import { Column } from './Column'
import { NewCardModal } from './NewCardModal'
import { CardModal } from './CardModal'

export function Board() {
  const { state } = useApp()
  const [addCardColumnId, setAddCardColumnId] = useState<ColumnId | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const selectedCard = selectedCardId
    ? state.cards.find((c) => c.id === selectedCardId)
    : null

  return (
    <div
      className="flex-1 min-h-0 overflow-x-auto p-5"
      style={{ backgroundColor: '#0079BF' }}
    >
      <div className="flex gap-4 h-full">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={state.cards.filter((c) => c.columnId === col.id)}
            onCardClick={setSelectedCardId}
            onAddCard={() => setAddCardColumnId(col.id)}
          />
        ))}
      </div>

      {addCardColumnId && (
        <NewCardModal
          initialColumnId={addCardColumnId}
          onClose={() => setAddCardColumnId(null)}
        />
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </div>
  )
}
