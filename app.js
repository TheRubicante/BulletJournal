let state = {
  view: "week",
  currentDate: new Date(),
  data: JSON.parse(localStorage.getItem("tracker")) || {}
};

function save() {
  localStorage.setItem("tracker", JSON.stringify(state.data));
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getStartOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function generateWeek(date) {
  const start = getStartOfWeek(date);
  let days = [];

  for (let i = 0; i < 7; i++) {
    let d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  return days;
}

function createDayCell(date) {
  const key = formatDate(date);

  if (!state.data[key]) {
    state.data[key] = {
      mood: "",
      color: "",
      people: {},
      oCount: "",
      note: ""
    };
  }

  const entry = state.data[key];

  const div = document.createElement("div");
  div.className = "day";

  div.innerHTML = `
    <strong>${key}</strong>

    ${createDropdown("mood", entry, key)}
    ${createDropdown("color", entry, key)}

    ${createPeopleGroups(entry)}

    <input placeholder="O count" value="${entry.oCount}" 
      onchange="updateField('${key}', 'oCount', this.value)" />

    <textarea placeholder="Notes"
      onchange="updateField('${key}', 'note', this.value)">
      ${entry.note}
    </textarea>
  `;

  return div;
}

function createDropdown(type, entry, dateKey) {
  let options = CONFIG.dropdowns[type];

  return `
    <select onchange="updateField('${dateKey}', '${type}', this.value)">
      <option value="">${type}</option>
      ${options.map(o =>
        `<option value="${o}" ${entry[type] === o ? "selected" : ""}>${o}</option>`
      ).join("")}
    </select>
  `;
}

function createPeopleGroups(entry) {
  return Object.entries(CONFIG.people).map(([name, cfg]) => {

    if (!entry.people[name]) {
      entry.people[name] = new Array(cfg.count).fill(false);
    }

    return `
      <div>
        <small>${name}</small>
        <div class="people-group">
          ${entry.people[name].map((val, i) => `
            <input type="checkbox"
              ${val ? "checked" : ""}
              onchange="updateCheckbox('${dateKey}', '${name}', ${i}, this.checked)"
              style="accent-color:${cfg.color}"
            />
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function updateField(dateKey, field, value) {
  state.data[dateKey][field] = value;
  save();
}

function updateCheckbox(dateKey, person, index, value) {
  state.data[dateKey].people[person][index] = value;
  save();
}

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  let days = generateWeek(state.currentDate);

  days.forEach(day => {
    grid.appendChild(createDayCell(day));
  });
}

render();

document.getElementById("legendToggle").onclick = () => {
  document.getElementById("legend").classList.toggle("hidden");
};

document.getElementById("legend").innerHTML = `
  <h3>Sample Day</h3>
  <p>Mood, Color = dropdowns</p>
  <p>Checkbox rows = per person tracking</p>
  <p>O Count = numeric input</p>
  <p>Notes = free text</p>
`;

function renderHeader() {
  const header = document.getElementById("weekdayHeader");
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  header.innerHTML = days.map(d => `<div>${d}</div>`).join("");
}

renderHeader();
render();

function updateLabel() {
  const label = document.getElementById("currentLabel");

  const start = getStartOfWeek(state.currentDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  label.textContent =
    `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

document.getElementById("prevBtn").onclick = () => {
  state.currentDate.setDate(state.currentDate.getDate() - 7);
  updateLabel();
  render();
};

document.getElementById("nextBtn").onclick = () => {
  state.currentDate.setDate(state.currentDate.getDate() + 7);
  updateLabel();
  render();
};

updateLabel();