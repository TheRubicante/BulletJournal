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
  const isCurrentMonth =
  date.getMonth() === state.currentDate.getMonth();

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
  div.className = "day" + (isCurrentMonth ? "" : " other-month");

  div.innerHTML = `
    <strong>${key}</strong>

    ${createDropdown("mood", entry, key)}
    ${createDropdown("color", entry, key)}

    ${createPeopleGroups(entry, key)}

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

function createPeopleGroups(entry, dateKey) {
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

  let days = [];

  if (state.view === "week") {
    days = generateWeek(state.currentDate);
  } else {
    days = generateMonth(state.currentDate);
  }

  days.forEach(day => {
    grid.appendChild(createDayCell(day));
  });
}



function renderHeader() {
  const header = document.getElementById("weekdayHeader");
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  header.innerHTML = days.map(d => `<div>${d}</div>`).join("");
}


function updateLabel() {
  const label = document.getElementById("currentLabel");

  if (state.view === "week") {
    const start = getStartOfWeek(state.currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    label.textContent =
      `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  } else {
    label.textContent = state.currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
  }
}




function generateMonth(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  const end = new Date(lastOfMonth);
  end.setDate(end.getDate() + (6 - end.getDay())); // forward to Saturday

  const days = [];
  let current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  renderHeader();
  updateLabel();
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

  document.getElementById("prevBtn").onclick = () => {
    if (state.view === "week") {
      state.currentDate.setDate(state.currentDate.getDate() - 7);
    } else {
      state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    }

    updateLabel();
    render();
  };

  document.getElementById("nextBtn").onclick = () => {
    if (state.view === "week") {
      state.currentDate.setDate(state.currentDate.getDate() + 7);
    } else {
      state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    }

    updateLabel();
    render();
  };

  document.getElementById("toggleView").onclick = () => {
    console.log("Toggle clicked");

    state.view = state.view === "week" ? "month" : "week";

    updateLabel();
    render();
  };
});