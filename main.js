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
    Array.from(document.querySelectorAll('.woth'))
      .forEach((el) => el.classList.remove('woth'));
    Array.from(document.querySelectorAll('.woth-on'))
      .forEach((el) => {
        el.classList.remove('woth-on')
        el.classList.add('woth-off')
        el.innerHTML = '☆'
      });
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
    input.checked = true
  }
  input.onchange = () => { onCheck(input) }
  return input
}

const createLabel = (id, value) => {
  const label = document.createElement('label')
  label.setAttribute('for', id)
  label.className = 'check-label'
  label.innerHTML = value
  return label
}

const createTitleCheckbox = (areaName, areaChecks) => {
  const input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  input.id = areaName + 'Title'
  input.setAttribute('style', 'display: none;')
  if (localStorage.getItem(areaName)) {
    input.checked = true
  }
  input.onchange = () => {
    if (input.checked) {
      localStorage.setItem(areaName, true)
    } else {
      localStorage.removeItem(areaName)
    }
    areaChecks.forEach(check => {
      const childCheckbox = document.getElementById(areaName + ' ' + check)
      if (input.checked && childCheckbox.checked) {
        return
      }
      childCheckbox.checked = input.checked
      onCheck(childCheckbox)
    })
  }
  return input
}

const createWothButton = (areaName) => {
  const wothButton = document.createElement('button')
  wothButton.innerHTML = '☆'
  wothButton.className = 'woth-button woth-off'
  if (localStorage.getItem(areaName + 'WOTH')) {
    wothButton.classList.remove('woth-off')
    wothButton.classList.add('woth-on')
    wothButton.innerHTML = '★'
  }
  wothButton.onclick = () => {
    if (wothButton.innerHTML === '☆') {
      wothButton.innerHTML = '★'
      wothButton.classList.remove('woth-off')
      wothButton.classList.add('woth-on')
      document.getElementById(areaName).classList.add('woth')
      localStorage.setItem(areaName + 'WOTH', true)
    } else {
      wothButton.innerHTML = '☆'
      wothButton.classList.remove('woth-on')
      wothButton.classList.add('woth-off')
      document.getElementById(areaName).classList.remove('woth')
      localStorage.removeItem(areaName + 'WOTH')
    }
  }
  return wothButton
}

fetch('data/s3.json')
  .then(response => response.json())
  .then(fullChecklist => {
    totalChecks = Object.values(fullChecklist).flat().length
    document.getElementById('totalChecks').innerHTML = totalChecks

    Object.keys(fullChecklist).forEach((areaName) => {
      const areaChecks = fullChecklist[areaName]
      const list = document.createElement('ul')

      areaChecks.forEach(checkName => {
        const id = areaName + ' ' + checkName
        const line = document.createElement('li')
        const checkbox = createCheckbox(id)
        const label = createLabel(id, checkName)
        line.append(checkbox, label)
        list.append(line)
      })

      const areaTitle = document.createElement('h2')
      areaTitle.innerHTML = `<label for="${areaName}Title">${areaName}</label>`
      areaTitle.prepend(createTitleCheckbox(areaName, areaChecks))
      areaTitle.append(createWothButton(areaName))

      const card = document.createElement('div')
      card.id = areaName
      card.className = 'card'
      if (localStorage.getItem(areaName + 'WOTH')) {
        card.classList.add('woth')
      }
      card.append(areaTitle, list)

      document.getElementById('masonry').append(card)
    })
  })

