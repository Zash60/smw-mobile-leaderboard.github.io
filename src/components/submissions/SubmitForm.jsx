import { useState, useEffect } from 'react'
import { Modal } from '../layout/Modal'

export function SubmitForm({ 
  isOpen, 
  onClose, 
  categories, 
  onSubmit,
  gameId 
}) {
  const [formData, setFormData] = useState({
    mainCategory: '',
    subCategory: '',
    player: '',
    time: '',
    date: '',
    videoUrl: ''
  })

  useEffect(() => {
    if (isOpen && categories.length > 0 && !formData.mainCategory) {
      const firstCat = categories[0]
      const subVar = firstCat.variables?.data?.find(v => v['is-subcategory'])
      const firstSubId = subVar ? Object.keys(subVar.values.values)[0] : ''
      
      setFormData(prev => ({
        ...prev,
        mainCategory: firstCat.id,
        subCategory: firstSubId
      }))
    }
  }, [isOpen, categories])

  const selectedCategory = categories.find(c => c.id === formData.mainCategory)
  const subcategoryVar = selectedCategory?.variables?.data?.find(v => v['is-subcategory'])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const categoryData = categories.find(c => c.id === formData.mainCategory)
    const subVar = categoryData?.variables?.data?.find(v => v['is-subcategory'])
    const subValue = subVar?.values.values[formData.subCategory]

    onSubmit({
      player: formData.player,
      time: formData.time,
      date: formData.date,
      videoUrl: formData.videoUrl,
      category: { 
        id: categoryData.id, 
        name: categoryData.name 
      },
      subcategory: subValue ? {
        variableId: subVar.id,
        valueId: formData.subCategory,
        name: subValue.label
      } : null
    })

    setFormData({
      mainCategory: '',
      subCategory: '',
      player: '',
      time: '',
      date: '',
      videoUrl: ''
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Run">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select 
            className="select"
            value={formData.mainCategory}
            onChange={(e) => {
              const cat = categories.find(c => c.id === e.target.value)
              const subVar = cat?.variables?.data?.find(v => v['is-subcategory'])
              const firstSubId = subVar ? Object.keys(subVar.values.values)[0] : ''
              setFormData({ ...formData, mainCategory: e.target.value, subCategory: firstSubId })
            }}
            required
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
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              required
            >
              {Object.entries(subcategoryVar.values.values).map(([id, data]) => (
                <option key={id} value={id}>{data.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Nickname</label>
          <input
            type="text"
            className="input"
            value={formData.player}
            onChange={(e) => setFormData({ ...formData, player: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time (e.g. 9:42.440)</label>
          <input
            type="text"
            className="input"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            placeholder="9:42.440"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Run Date</label>
          <input
            type="date"
            className="input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video URL</label>
          <input
            type="url"
            className="input"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            placeholder="https://youtube.com/..."
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            Submit
          </button>
        </div>
      </form>
    </Modal>
  )
}
