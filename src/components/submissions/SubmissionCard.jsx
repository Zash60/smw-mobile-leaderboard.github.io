import { useState } from 'react'
import { Modal } from '../layout/Modal'

export function SubmissionCard({ 
  submission, 
  onVerify, 
  onReject, 
  onDelete, 
  onEdit,
  categories,
  gameId 
}) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editData, setEditData] = useState({})

  const statusColors = {
    pending: 'border-l-amber-400',
    verified: 'border-l-green-400',
    rejected: 'border-l-red-400'
  }

  const statusLabels = {
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected'
  }

  const categoryTitle = submission.subcategory 
    ? `${submission.category.name} - ${submission.subcategory.name}`
    : submission.category.name

  const handleEdit = () => {
    setEditData({
      player: submission.player,
      time: submission.time,
      date: submission.date,
      videoUrl: submission.videoUrl,
      mainCategory: submission.category.id,
      subCategory: submission.subcategory?.valueId || ''
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    const categoryData = categories.find(c => c.id === editData.mainCategory)
    const subVar = categoryData?.variables?.data?.find(v => v['is-subcategory'])
    const subValue = subVar?.values.values[editData.subCategory]

    onEdit(submission.id, {
      player: editData.player,
      time: editData.time,
      date: editData.date,
      videoUrl: editData.videoUrl,
      category: { id: categoryData.id, name: categoryData.name },
      subcategory: subValue ? {
        variableId: subVar.id,
        valueId: editData.subCategory,
        name: subValue.label
      } : null
    })
    setEditModalOpen(false)
  }

  return (
    <>
      <div className={`card p-4 border-l-4 ${statusColors[submission.status]}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium">{submission.player}</div>
            <div className="text-sm text-gray-500">{submission.time} · {submission.date}</div>
          </div>
          <span className={`
            text-xs px-2 py-1 rounded-full
            ${submission.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
            ${submission.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
            ${submission.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
          `}>
            {statusLabels[submission.status]}
          </span>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {categoryTitle}
        </div>

        <a 
          href={submission.videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          Watch video
        </a>

        <div className="flex flex-wrap gap-2 mt-4">
          {submission.status === 'pending' && (
            <button onClick={() => onVerify(submission.id)} className="btn btn-success text-sm">
              Approve
            </button>
          )}
          {(submission.status === 'pending' || submission.status === 'verified') && (
            <button onClick={() => onReject(submission.id)} className="btn btn-secondary text-sm">
              Reject
            </button>
          )}
          <button onClick={handleEdit} className="btn btn-warning text-sm">
            Edit
          </button>
          <button onClick={() => onDelete(submission.id)} className="btn btn-danger text-sm">
            Delete
          </button>
        </div>
      </div>

      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Run">
        <EditForm
          data={editData}
          categories={categories}
          onChange={setEditData}
          onSave={handleSaveEdit}
          onClose={() => setEditModalOpen(false)}
        />
      </Modal>
    </>
  )
}

function EditForm({ data, categories, onChange, onSave, onClose }) {
  const selectedCategory = categories.find(c => c.id === data.mainCategory)
  const subcategoryVar = selectedCategory?.variables?.data?.find(v => v['is-subcategory'])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select 
          className="select"
          value={data.mainCategory || ''}
          onChange={(e) => {
            const cat = categories.find(c => c.id === e.target.value)
            const subVar = cat?.variables?.data?.find(v => v['is-subcategory'])
            const firstSubId = subVar ? Object.keys(subVar.values.values)[0] : ''
            onChange({ ...data, mainCategory: e.target.value, subCategory: firstSubId })
          }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {subcategoryVar && (
        <div>
          <label className="block text-sm font-medium mb-1">Subcategory</label>
          <select 
            className="select"
            value={data.subCategory || ''}
            onChange={(e) => onChange({ ...data, subCategory: e.target.value })}
          >
            {Object.entries(subcategoryVar.values.values).map(([id, val]) => (
              <option key={id} value={id}>{val.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Player</label>
        <input
          type="text"
          className="input"
          value={data.player || ''}
          onChange={(e) => onChange({ ...data, player: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Time</label>
        <input
          type="text"
          className="input"
          value={data.time || ''}
          onChange={(e) => onChange({ ...data, time: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          className="input"
          value={data.date || ''}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Video URL</label>
        <input
          type="url"
          className="input"
          value={data.videoUrl || ''}
          onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={onClose} className="btn btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={onSave} className="btn btn-primary flex-1">
          Save
        </button>
      </div>
    </div>
  )
}
