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
    document.querySelectorAll('.woth').forEach((el) => el.classList.remove('woth'));
    document.querySelectorAll('.woth-on').forEach((el) => {
      el.classList.remove('woth-on');
      el.classList.add('woth-off');
      el.textContent = '☆';
    });
  }
};

const onCheck = (elem) => {
  const checkName = elem.dataset.checkName;
  const areaName = elem.dataset.areaName;
  if (elem.checked) {
    localStorage.setItem(checkName, elem.checked);
    updateCheckedCount(1);
  } else {
    localStorage.removeItem(checkName);
    updateCheckedCount(-1);
  }
  document.querySelectorAll(`[data-check-name="${checkName}"]`).forEach((dupe) => {
    dupe.checked = elem.checked;
    const dupeArea = dupe.dataset.areaName;
    const dupeAreaTitle = document.getElementById(dupeArea + 'Title');
    dupeAreaTitle.checked = Array.from(document.querySelectorAll(`[data-area-name="${dupeArea}"]`)).every(
      (areaCheck) => areaCheck.checked
    );
  });
  const areaRelatedChecks = document.querySelectorAll(`[data-area-name="${areaName}"]`);
  const allChecked = Array.from(areaRelatedChecks).every((areaCheck) => areaCheck.checked);
  const areaTitleCheckbox = document.getElementById(areaName + 'Title');
  areaTitleCheckbox.checked = allChecked;
};

const createCheckbox = (id, checkName, areaName) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.dataset.checkName = checkName;
  input.dataset.areaName = areaName;
  input.id = id;
  if (localStorage.getItem(checkName)) {
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
  input.onchange = () => {
    const initialState = input.checked;
    for (const check of areaChecks) {
      const childCheckbox = document.getElementById(areaName + ' ' + check);
      if (initialState === childCheckbox.checked) {
        continue;
      }
      childCheckbox.checked = initialState;
      onCheck(childCheckbox); // this will mutate input.checked, that's why we store the initial state of the title checkbox
    }
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

const createAreaTitle = (areaName, areaChecks, allChecked, emoji = null) => {
  const areaTitle = document.createElement('h2');
  const label = document.createElement('label');
  label.setAttribute('for', areaName + 'Title');
  label.textContent = emoji ? `${emoji} ${areaName}` : areaName;
  const checkbox = createTitleCheckbox(areaName, areaChecks);
  checkbox.checked = allChecked;
  areaTitle.append(checkbox, label, createWothButton(areaName));
  return areaTitle;
};

Promise.all([fetch('data/s3.json'), fetch('data/area-styles.json')])
  .then((response) => Promise.all([response[0].json(), response[1].json()]))
  .then((data) => {
    const fullChecklist = data[0];
    const styles = data[1];
    totalChecks = [...new Set(Object.values(fullChecklist).flat())].length;
    document.getElementById('totalChecks').textContent = totalChecks.toString();

    for (const areaName of Object.keys(fullChecklist)) {
      const areaChecks = fullChecklist[areaName];
      const list = document.createElement('ul');
      let allChecked = true;

      for (checkName of areaChecks) {
        const id = areaName + ' ' + checkName;
        const line = document.createElement('li');
        const checkbox = createCheckbox(id, checkName, areaName);
        const label = createLabel(id, checkName);
        line.append(checkbox, label);
        list.append(line);
        if (!checkbox.checked) {
          allChecked = false;
        }
      }

      const areaTitle = createAreaTitle(areaName, areaChecks, allChecked, styles[areaName]['emoji']);

      const card = document.createElement('div');
      card.id = areaName;
      card.className = 'card';
      if (localStorage.getItem(areaName + 'WOTH')) {
        card.classList.add('woth');
      }
      card.append(areaTitle, list);

      document.getElementById('masonry').append(card);
    }
  })
  .catch((err) => console.error(err));
