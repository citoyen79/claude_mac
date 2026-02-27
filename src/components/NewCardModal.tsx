import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { ColumnId, COLUMNS } from '../types'

interface Props {
  initialColumnId: ColumnId
  onClose: () => void
}

export function NewCardModal({ initialColumnId, onClose }: Props) {
  const { state, dispatch } = useApp()
  const [title, setTitle] = useState('')
  const [projectTypeId, setProjectTypeId] = useState(
    state.projectTypes[0]?.id ?? ''
  )
  const [columnId, setColumnId] = useState<ColumnId>(initialColumnId)

  const selectedType = state.projectTypes.find((pt) => pt.id === projectTypeId)

  // Preview of items that will be auto-generated
  const previewItems = selectedType
    ? selectedType.moduleIds.flatMap((moduleId) => {
        const module = state.modules.find((m) => m.id === moduleId)
        return module
          ? module.defaultItems.map((text) => ({
              text,
              moduleName: module.name,
            }))
          : []
      })
    : []

  function handleCreate() {
    if (!title.trim() || !projectTypeId) return
    dispatch({
      type: 'ADD_CARD',
      payload: { title: title.trim(), projectTypeId, columnId },
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">새 카드 만들기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              카드 제목 *
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="카드 제목을 입력하세요"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              프로젝트 유형 *
            </label>
            {state.projectTypes.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">
                설정 페이지에서 프로젝트 유형을 먼저 추가해주세요.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {state.projectTypes.map((pt) => (
                  <button
                    key={pt.id}
                    onClick={() => setProjectTypeId(pt.id)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                      projectTypeId === pt.id
                        ? 'text-white shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                    style={
                      projectTypeId === pt.id
                        ? { borderColor: pt.color, backgroundColor: pt.color }
                        : {}
                    }
                  >
                    {pt.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              시작 컬럼
            </label>
            <div className="flex gap-2">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setColumnId(col.id)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                    columnId === col.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-200 text-gray-500 hover:border-blue-300'
                  }`}
                >
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewItems.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                자동 생성 할일 미리보기 ({previewItems.length}개)
              </label>
              <div className="border border-gray-100 rounded-xl p-3 max-h-48 overflow-y-auto bg-gray-50 space-y-1">
                {previewItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-sm py-0.5"
                  >
                    <span className="text-gray-300 shrink-0">☐</span>
                    <span className="text-xs font-semibold text-gray-400 shrink-0 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      {item.moduleName}
                    </span>
                    <span className="text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || !projectTypeId}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            카드 만들기
          </button>
        </div>
      </div>
    </div>
  )
}
