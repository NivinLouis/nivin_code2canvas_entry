const courses = [...document.querySelectorAll(".course-card")];
const searchInput = document.querySelector("#course-search");
const filterSelects = [...document.querySelectorAll("[data-filter]")];
const clearFilters = document.querySelector(".clear-filters");
const emptyState = document.querySelector("#empty-state");
const resultCount = document.querySelector("#result-count");

function filterCourses() {
  const query = searchInput.value.trim().toLowerCase();
  const filters = Object.fromEntries(filterSelects.map((select) => [select.dataset.filter, select.value]));
  let visibleCount = 0;

  courses.forEach((card) => {
    const matchesQuery = card.dataset.course.toLowerCase().includes(query);
    const matchesLevel = filters.level === "all" || card.dataset.level === filters.level;
    const matchesLanguage = filters.language === "all" || card.dataset.language === filters.language;
    const matchesType = filters.type === "all" || card.dataset.type === filters.type;
    const matchesTime = filters.time === "all" || card.dataset.time === filters.time;
    const visible = matchesQuery && matchesLevel && matchesLanguage && matchesType && matchesTime;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
  resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "course" : "courses"} shown`;
  clearFilters.hidden = !query && filterSelects.every((select) => select.value === "all");
}

searchInput.addEventListener("input", filterCourses);
filterSelects.forEach((select) => select.addEventListener("change", filterCourses));
clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  filterSelects.forEach((select) => { select.value = "all"; });
  filterCourses();
  searchInput.focus();
});

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelectorAll(".nav-link[data-section]").forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    });
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
    const section = link.dataset.section;
    document.querySelector("#page-title").textContent = section === "Dashboard" ? "My Courses" : section;
    if (section !== "Dashboard" && section !== "All Courses") showToast(`${section} is ready to explore.`);
    if (section === "Dashboard" || section === "All Courses") {
      document.querySelector("#course-heading").textContent = section === "All Courses" ? "All courses" : "Course list";
    }
    document.querySelector(".sidebar").classList.remove("nav-open");
    document.querySelector(".mobile-menu").setAttribute("aria-expanded", "false");
  });
});

const mobileMenu = document.querySelector(".mobile-menu");
mobileMenu.addEventListener("click", () => {
  const open = mobileMenu.getAttribute("aria-expanded") !== "true";
  mobileMenu.setAttribute("aria-expanded", String(open));
  document.querySelector(".sidebar").classList.toggle("nav-open", open);
});

document.querySelector(".notification-button").addEventListener("click", () => {
  document.querySelector("#notification-status").textContent = "You are all caught up on notifications.";
  document.querySelector(".notification-dot").hidden = true;
  showToast("You are all caught up on notifications.");
});

document.querySelector(".see-all").addEventListener("click", () => {
  const button = document.querySelector(".see-all");
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  button.textContent = expanded ? "See all" : "Show less";
  document.querySelectorAll(".extra-user").forEach((row) => { row.hidden = expanded; });
});

const courseDialog = document.querySelector("#course-dialog");
const courseDescriptions = {
  "Artificial Intelligence": "Explore intelligent systems, machine learning fundamentals, and practical AI applications.",
  "Operating Systems": "Study processes, memory, file systems, and the foundations that power modern computers.",
  "Web Programming": "Build accessible websites with modern HTML, CSS, JavaScript, and responsive design.",
  "Cloud Computing": "Learn cloud architecture, deployment models, and the services behind scalable applications.",
  "Software Engineering": "Practice the methods teams use to plan, build, test, and maintain software.",
  "Graphic Designing": "Develop visual communication skills through layout, color, typography, and digital tools."
};
document.querySelectorAll(".course-open").forEach((button) => {
  button.addEventListener("click", () => {
    const title = button.closest(".course-card").dataset.course;
    document.querySelector("#dialog-title").textContent = title;
    document.querySelector("#dialog-description").textContent = courseDescriptions[title];
    courseDialog.showModal();
  });
});
document.querySelector("#dialog-action").addEventListener("click", () => {
  courseDialog.close();
  showToast("Course materials will be available here.");
});

const calendarTitle = document.querySelector("#calendar-title");
const calendarGrid = document.querySelector(".calendar-grid");
const calendarDays = document.querySelector("#calendar-days");
const selectedDateLabel = document.querySelector("#selected-date");
let visibleMonth = new Date(2025, 11, 1);
let selectedDate = new Date(2025, 11, 14);
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const dateFormatter = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" });

function renderCalendar() {
  calendarTitle.textContent = monthFormatter.format(visibleMonth);
  calendarGrid.setAttribute("aria-label", `${monthFormatter.format(visibleMonth)} calendar`);
  calendarDays.replaceChildren();
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const isReferenceMonth = visibleMonth.getFullYear() === 2025 && visibleMonth.getMonth() === 11;
  // The supplied reference places December 1 under Saturday and shows the 11–14 range.
  const mondayOffset = isReferenceMonth ? 5 : (firstDay.getDay() + 6) % 7;

  for (let blank = 0; blank < mondayOffset; blank += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-spacer";
    spacer.setAttribute("aria-hidden", "true");
    calendarDays.append(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const button = document.createElement("button");
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isRangeStart = isReferenceMonth && day === 11;
    const isRangeEnd = isReferenceMonth && day === 14;
    const isMarked = isRangeStart || isRangeEnd;
    const isRangeMiddle = isReferenceMonth && (day === 12 || day === 13);
    button.type = "button";
    button.className = `calendar-day${isMarked ? " marked" : ""}${isRangeStart ? " range-start" : ""}${isRangeEnd ? " range-end" : ""}${isRangeMiddle ? " range-middle" : ""}${isSelected ? " selected" : ""}`;
    const dayLabel = document.createElement("span");
    dayLabel.textContent = String(day);
    button.append(dayLabel);
    button.setAttribute("aria-label", dateFormatter.format(date));
    if (isSelected) button.setAttribute("aria-pressed", "true");
    button.addEventListener("click", () => {
      selectedDate = date;
      selectedDateLabel.textContent = `Selected: ${dateFormatter.format(date)}`;
      renderCalendar();
    });
    calendarDays.append(button);
  }
}

document.querySelectorAll("[data-month-step]").forEach((button) => {
  button.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + Number(button.dataset.monthStep), 1);
    renderCalendar();
  });
});
renderCalendar();
