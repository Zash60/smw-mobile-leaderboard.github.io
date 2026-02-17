import { useState, useEffect } from 'react'

export function CategorySelector({ 
  categories, 
  gameId,
  onCategorySelect,
  loading 
}) {
  const [selectedMain, setSelectedMain] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)

  const isMainGame = gameId === 'smw'

  useEffect(() => {
    if (categories.length > 0 && !selectedMain) {
      handleMainSelect(categories[0], true)
    }
  }, [categories])

  const handleMainSelect = (category, isInitial = false) => {
    setSelectedMain(category)
    
    const subcategoryVar = category.variables?.data?.find(v => v['is-subcategory'])
    
    if (!subcategoryVar) {
      setSelectedSub(null)
      onCategorySelect({
        categoryId: category.id,
        variableId: null,
        valueId: null,
        title: category.name
      })
    } else {
      const [firstValueId, firstValueData] = Object.entries(subcategoryVar.values.values)[0]
      setSelectedSub(firstValueId)
      onCategorySelect({
        categoryId: category.id,
        variableId: subcategoryVar.id,
        valueId: firstValueId,
        title: `${category.name} - ${firstValueData.label}`
      })
    }
  }

  const handleSubSelect = (variable, valueId, valueLabel) => {
    setSelectedSub(valueId)
    onCategorySelect({
      categoryId: selectedMain.id,
      variableId: variable.id,
      valueId,
      title: `${selectedMain.name} - ${valueLabel}`
    })
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading categories...</div>
  }

  if (!isMainGame) {
    return (
      <ExtensionSelector 
        categories={categories} 
        onCategorySelect={onCategorySelect} 
      />
    )
  }

  const subcategoryVar = selectedMain?.variables?.data?.find(v => v['is-subcategory'])

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleMainSelect(category)}
            className={`
              px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap
              ${selectedMain?.id === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            {category.name}
          </button>
        ))}
      </div>

      {selectedMain && subcategoryVar && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(subcategoryVar.values.values).map(([valueId, valueData]) => (
            <button
              key={valueId}
              onClick={() => handleSubSelect(subcategoryVar, valueId, valueData.label)}
              className={`
                px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap
                ${selectedSub === valueId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}
            >
              {valueData.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ExtensionSelector({ categories, onCategorySelect }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const options = []
  categories.forEach(category => {
    const subVar = category.variables?.data?.find(v => v['is-subcategory'])
    
    if (subVar) {
      Object.entries(subVar.values.values).forEach(([valueId, valueData]) => {
        options.push({
          categoryId: category.id,
          variableId: subVar.id,
          valueId,
          text: `${category.name} - ${valueData.label}`
        })
      })
    } else {
      options.push({
        categoryId: category.id,
        variableId: null,
        valueId: null,
        text: category.name
      })
    }
  })

  useEffect(() => {
    if (options.length > 0) {
      const first = options[0]
      onCategorySelect({
        categoryId: first.categoryId,
        variableId: first.variableId,
        valueId: first.valueId,
        title: first.text
      })
    }
  }, [])

  const handleChange = (e) => {
    const index = parseInt(e.target.value)
    setSelectedIndex(index)
    const opt = options[index]
    onCategorySelect({
      categoryId: opt.categoryId,
      variableId: opt.variableId,
      valueId: opt.valueId,
      title: opt.text
    })
  }

  return (
    <select 
      className="select"
      value={selectedIndex}
      onChange={handleChange}
    >
      {options.map((opt, index) => (
        <option key={index} value={index}>
          {opt.text}
        </option>
      ))}
    </select>
  )
}
