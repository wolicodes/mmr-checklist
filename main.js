let totalChecked = 0;
let totalChecks = 0;

const updateCheckedCount = (direction) => {
  totalChecked += direction;
  document.getElementById('numberChecked').textContent = totalChecked.toString();
  document.getElementById('percentComplete').textContent = Math.floor((totalChecked * 100) / totalChecks).toString();
};

const onResetAll = () => {
  if (window.confirm('Are you sure?')) {
    localStorage.clear();
    document.querySelectorAll('input[type=checkbox]').forEach((el) => (el.checked = false));
    totalChecked = 0;
    document.getElementById('numberChecked').textContent = '0';
    document.getElementById('percentComplete').textContent = '0';
    Array.from(document.querySelectorAll('.woth')).forEach((el) => el.classList.remove('woth'));
    Array.from(document.querySelectorAll('.woth-on')).forEach((el) => {
      el.classList.remove('woth-on');
      el.classList.add('woth-off');
      el.textContent = '☆';
    });
  }
};

const onCheck = (elem) => {
  if (elem.checked) {
    localStorage.setItem(elem.id, elem.checked);
    updateCheckedCount(1);
  } else {
    localStorage.removeItem(elem.id);
    updateCheckedCount(-1);
  }
  document.querySelectorAll(`[data-check-name="${elem.dataset.checkName}"]`).forEach((duplicates) => {
    duplicates.checked = !!elem.checked;
  });
};

const createCheckbox = (id, checkName) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.dataset.checkName = checkName;
  input.id = id;
  if (localStorage.getItem(id)) {
    updateCheckedCount(1);
    input.checked = true;
  }
  input.onchange = () => {
    onCheck(input);
  };
  return input;
};

const createLabel = (id, checkName) => {
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.className = 'check-label';
  label.textContent = checkName;
  return label;
};

const createTitleCheckbox = (areaName, areaChecks) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.id = areaName + 'Title';
  input.setAttribute('style', 'display: none;');
  if (localStorage.getItem(areaName)) {
    input.checked = true;
  }
  input.onchange = () => {
    if (input.checked) {
      localStorage.setItem(areaName, 'true');
    } else {
      localStorage.removeItem(areaName);
    }
    areaChecks.forEach((check) => {
      const childCheckbox = document.getElementById(areaName + ' ' + check);
      if (input.checked && childCheckbox.checked) {
        return;
      }
      childCheckbox.checked = input.checked;
      onCheck(childCheckbox);
    });
  };
  return input;
};

const createWothButton = (areaName) => {
  const wothButton = document.createElement('button');
  wothButton.textContent = '☆';
  wothButton.className = 'woth-button woth-off';
  if (localStorage.getItem(areaName + 'WOTH')) {
    wothButton.classList.remove('woth-off');
    wothButton.classList.add('woth-on');
    wothButton.textContent = '★';
  }
  wothButton.onclick = () => {
    if (wothButton.textContent === '☆') {
      wothButton.textContent = '★';
      wothButton.classList.remove('woth-off');
      wothButton.classList.add('woth-on');
      document.getElementById(areaName).classList.add('woth');
      localStorage.setItem(areaName + 'WOTH', 'true');
    } else {
      wothButton.textContent = '☆';
      wothButton.classList.remove('woth-on');
      wothButton.classList.add('woth-off');
      document.getElementById(areaName).classList.remove('woth');
      localStorage.removeItem(areaName + 'WOTH');
    }
  };
  return wothButton;
};

const createAreaTitle = (areaName, areaChecks, emoji = null) => {
  const areaTitle = document.createElement('h2');
  const label = document.createElement('label');
  label.setAttribute('for', areaName + 'Title');
  label.textContent = emoji ? `${emoji} ${areaName}` : areaName;
  areaTitle.append(createTitleCheckbox(areaName, areaChecks), label, createWothButton(areaName));
  return areaTitle;
};

Promise.all([fetch('data/s3.json'), fetch('data/area-styles.json')])
  .then((response) => Promise.all([response[0].json(), response[1].json()]))
  .then((data) => {
    const fullChecklist = data[0];
    const styles = data[1];
    console.log(Object.values(fullChecklist).flat());
    console.log([...new Set(Object.values(fullChecklist).flat())]);
    totalChecks = [...new Set(Object.values(fullChecklist).flat())].length;
    document.getElementById('totalChecks').textContent = totalChecks.toString();

    Object.keys(fullChecklist).forEach((areaName) => {
      const areaChecks = fullChecklist[areaName];
      const list = document.createElement('ul');

      areaChecks.forEach((checkName) => {
        const id = areaName + ' ' + checkName;
        const line = document.createElement('li');
        const checkbox = createCheckbox(id, checkName);
        const label = createLabel(id, checkName);
        line.append(checkbox, label);
        list.append(line);
      });

      const areaTitle = createAreaTitle(areaName, areaChecks, styles[areaName]['emoji']);

      const card = document.createElement('div');
      card.id = areaName;
      card.className = 'card';
      if (localStorage.getItem(areaName + 'WOTH')) {
        card.classList.add('woth');
      }
      card.append(areaTitle, list);

      document.getElementById('masonry').append(card);
    });
  })
  .catch((err) => console.error(err));
