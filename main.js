let totalChecked = 0
let totalChecks = 0

const updateCheckedCount = (direction) => {
  totalChecked += direction
  document.getElementById('numberChecked').innerHTML = totalChecked
  document.getElementById('percentComplete').innerHTML = Math.floor(totalChecked * 100 / totalChecks)
}

const onResetAll = () => {
  if (window.confirm('Are you sure?')) {
    localStorage.clear()
    document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false)
    totalChecked = 0
    document.getElementById('numberChecked').innerHTML = 0
    document.getElementById('percentComplete').innerHTML = 0
  }
}

const onCheck = (elem) => {
  if (elem.checked) {
    localStorage.setItem(elem.id, elem.checked)
    updateCheckedCount(1)
  } else {
    localStorage.removeItem(elem.id)
    updateCheckedCount(-1)
  }
}

const createCheckbox = (id) => {
  const input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  input.id = id
  if (localStorage.getItem(id)) {
    updateCheckedCount(1)
    input.setAttribute('checked', totalChecked)
  }
  input.onchange = () => { onCheck(input) }
  return input
}

const createLabel = (id, value) => {
  const label = document.createElement('label')
  label.setAttribute('for', id)
  label.innerHTML = value
  return label
}

fetch('data/s3.json')
  .then(response => response.json())
  .then(fullChecklist => {
    totalChecks = Object.values(fullChecklist).flat().length
    document.getElementById('totalChecks').innerHTML = totalChecks

    Object.keys(fullChecklist).forEach((areaName) => {
      const list = document.createElement('ul')

      fullChecklist[areaName].forEach(checkName => {
        const id = areaName + ' ' + checkName
        const line = document.createElement('li')
        const checkbox = createCheckbox(id)
        const label = createLabel(id, checkName)
        line.append(checkbox, label)
        list.append(line)
      })

      const areaTitle = document.createElement('h2')
      areaTitle.innerHTML = areaName

      const card = document.createElement('div')
      card.className = 'card'
      card.append(areaTitle, list)

      document.getElementById('masonry').append(card)
    })
  })

