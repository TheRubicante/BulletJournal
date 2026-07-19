function createTemplateId() {
  return "template_" + new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "");
}

function loadAppData() {
  const saved = JSON.parse(localStorage.getItem("journalApp"));

  if (saved) {
    return saved;
  }

  const templateId = createTemplateId();

  return {
    settings: {
      viewPreference: "month"
    },

    currentTemplateId: templateId,

    templates: {
      [templateId]: {
        created: new Date().toISOString(),
        named: false,

        layout: {
          dropdowns: [
            {
              id: "mood",
              label: "Energy",
              options: [
                "happy",
                "sad",
                "angry"
              ]
            },
            {
              id: "color",
              label: "Color",
              options: [
                "green",
                "red",
                "blue"
              ]
            },
            {
              id: "color",
              label: "Flavor",
              options: [
                "spicy",
                "umami",
                "gay"
              ]
            }
          ],

          habits: [
            {
              id: "rubi",
              label: "rubi",
              color: "green",
              items: [
                "Habit 1",
                "Habit 2",
                "Habit 3",
                "Habit 4",
                "Habit 5"
              ]
            },
            {
              id: "matt",
              label: "matt",
              color: "purple",
              items: [
                "Habit 1",
                "Habit 2",
                "Habit 3",
                "Habit 4",
                "Habit 5"
              ]
            },
            {
              id: "luke",
              label: "luke",
              color: "blue",
              items: [
                "Habit 1",
                "Habit 2",
                "Habit 3",
                "Habit 4",
                "Habit 5"
              ]
            },
            {
              id: "lisa",
              label: "lisa",
              color: "green",
              items: [
                "Habit 1",
                "Habit 2",
                "Habit 3",
                "Habit 4",
                "Habit 5"
              ]
            }
          ],

          counts: [],

          notes: true
        }
      }
    },

    days: {}
  };
}

let appData = loadAppData();

let state = {
  view: appData.settings.viewPreference,
  settings: appData.settings,
  currentDate: new Date(),
  lastSaved: localStorage.getItem("lastSaved") || null,
  currentTemplateId: appData.currentTemplateId,
  templates: appData.templates,
  data: appData.days
};

function getCurrentTemplate() {
  return state.templates[state.currentTemplateId];
}

function hexToRGBA(color, alpha) {
  const colors = {
    red: [255, 0, 0],
    purple: [128, 0, 128],
    blue: [0, 0, 255],
    green: [0, 128, 0]
  };

  const rgb = colors[color] || [0, 0, 0];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function save() {
  const appData = {
    settings: state.settings,
    currentTemplateId: state.currentTemplateId,
    templates: state.templates,
    days: state.data
  };

  localStorage.setItem(
    "journalApp",
    JSON.stringify(appData)
  );

  state.lastSaved = new Date().toLocaleString();

  localStorage.setItem(
    "lastSaved",
    state.lastSaved
  );

  updateLastSaved();
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

  const todayKey = formatDate(new Date());
  const isToday = key === todayKey;

  const isCurrentMonth =
    date.getMonth() === state.currentDate.getMonth();

  if (!state.data[key]) {
    state.data[key] = {
      templateId: state.currentTemplateId,
      mood: "",
      color: "",
      people: {},
      oCount: "",
      note: ""
    };
  }

  const entry = state.data[key];
 
  const div = document.createElement("div");

  let classNames = ["day"];

  if (!isCurrentMonth) {
    classNames.push("other-month");
  } else {
    classNames.push("current-month");
  }

  if (isToday) {
    classNames.push("today");
  }

  div.className = classNames.join(" ");
const template = getCurrentTemplate();

div.innerHTML = `
  <strong class="date-label">
  ${date.toLocaleString("default", { month: "short" })} ${date.getDate()}
</strong>

${template.layout.dropdowns
    .map(dropdown => createDropdown(dropdown, entry, key))
    .join("")}

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

function createDropdown(dropdown, entry, dateKey) {

  let options = dropdown.options;

  return `
    <select onchange="updateField('${dateKey}', '${dropdown.id}', this.value)">
      <option value="">${dropdown.label}</option>
      ${options.map(o =>
        `<option value="${o}" ${entry[dropdown.id] === o ? "selected" : ""}>${o}</option>`
      ).join("")}
    </select>
  `;
}

function createPeopleGroups(entry, dateKey) {
  const template = getCurrentTemplate();

  return template.layout.habits.map(group => {

    if (!entry.people[group.id]) {
      entry.people[group.id] = new Array(group.items.length).fill(false);
    }

    return `
  <div class="person-block">
    <div 
      class="people-group-box"
      style="
        border: 1px solid ${group.color};
        background: ${hexToRGBA(group.color, 0.12)};
      "
    >
      ${entry.people[group.id].map((val, i) => `
        <input type="checkbox"
          ${val ? "checked" : ""}
          onchange="updateCheckbox('${dateKey}', '${group.id}', ${i}, this.checked)"
          style="accent-color:${group.color}"
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

function updateLastSaved() {
  const label = document.getElementById("lastSaved");

  if (!label) return;

  label.textContent =
    state.lastSaved
      ? `Last Saved: ${state.lastSaved}`
      : "Last Saved: Never";
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
  updateLastSaved();

  document.getElementById("templateToggle").onclick = () => {
    document.getElementById("template").classList.toggle("hidden");
  };

  document.getElementById("template").innerHTML = `
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

    state.settings.viewPreference = state.view;
    save();

    updateLabel();
    render();
  };

});