export function initializeDashboard() {
  if (document.documentElement.dataset.dashboardInitialized === "true") return;
  document.documentElement.dataset.dashboardInitialized = "true";
  const courses = [...document.querySelectorAll(".course-card")];
  const searchInput = document.querySelector("#course-search");
  const filterSelects = [...document.querySelectorAll("[data-filter]")];
  const clearFilters = document.querySelector(".clear-filters");
  const emptyState = document.querySelector("#empty-state");
  const resultCount = document.querySelector("#result-count");
  const primaryNav = document.querySelector("#primary-nav");
  const activeNavMarker = document.createElement("span");
  activeNavMarker.className = "nav-active-marker";
  activeNavMarker.setAttribute("aria-hidden", "true");
  primaryNav.prepend(activeNavMarker);

  function moveActiveNavMarker() {
    const activeLink = document.querySelector(".sidebar .nav-link.active");
    if (!activeLink) return;
    const markerHeight = 52;
    const navTop = primaryNav.getBoundingClientRect().top;
    const activeTop = activeLink.getBoundingClientRect().top;
    activeNavMarker.style.setProperty("--marker-y", `${activeTop - navTop + (activeLink.offsetHeight - markerHeight) / 2}px`);
  }
  moveActiveNavMarker();
  window.addEventListener("resize", moveActiveNavMarker);

  function transitionPageTitle(title) {
    const heading = document.querySelector("#page-title");
    if (heading.textContent === title) return;
    heading.textContent = title;
    heading.classList.remove("title-arrive");
    void heading.offsetWidth;
    heading.classList.add("title-arrive");
    heading.addEventListener("animationend", () => heading.classList.remove("title-arrive"), { once: true });
  }

  const filterMenus = filterSelects.map((select, menuIndex) => {
    const oldWrapper = select.closest(".filter-control");
    const label = oldWrapper.querySelector(".visually-hidden").textContent.trim();
    const icon = oldWrapper.querySelector(".filter-icon");
    const wrapper = document.createElement("div");
    wrapper.className = "filter-control";
    wrapper.dataset.filterControl = select.dataset.filter;

    const trigger = document.createElement("button");
    trigger.className = "filter-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-label", label);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", `filter-menu-${menuIndex}`);
    const valueLabel = document.createElement("span");
    valueLabel.className = "filter-value";
    trigger.append(valueLabel, icon);

    const menu = document.createElement("div");
    menu.className = "filter-menu";
    menu.id = `filter-menu-${menuIndex}`;
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", label);
    menu.hidden = true;
    const options = [...select.options].map((option) => {
      const item = document.createElement("div");
      item.className = "filter-option";
      item.setAttribute("role", "option");
      item.dataset.value = option.value;
      item.tabIndex = -1;
      item.innerHTML = `<span class="filter-option-check" aria-hidden="true">✓</span><span>${option.textContent}</span>`;
      menu.append(item);
      return item;
    });

    select.hidden = true;
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    wrapper.append(trigger, select, menu);
    oldWrapper.replaceWith(wrapper);

    const syncSelection = () => {
      const selectedOption = [...select.options].find((option) => option.value === select.value);
      valueLabel.textContent = selectedOption?.textContent || "Select";
      options.forEach((option) => {
        const selected = option.dataset.value === select.value;
        option.setAttribute("aria-selected", String(selected));
        option.tabIndex = selected ? 0 : -1;
      });
    };
    const close = (restoreFocus = false) => {
      menu.hidden = true;
      wrapper.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    };
    const open = () => {
      filterMenus.forEach((other) => other.close());
      menu.hidden = false;
      wrapper.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      options.find((option) => option.dataset.value === select.value)?.focus();
    };
    const selectOption = (option) => {
      select.value = option.dataset.value;
      syncSelection();
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close(true);
    };

    trigger.addEventListener("click", () => menu.hidden ? open() : close());
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        open();
      }
    });
    options.forEach((option, index) => {
      option.addEventListener("click", () => selectOption(option));
      option.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
        else if (event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = options.length - 1;
        else if (event.key === "Escape") { event.preventDefault(); close(true); return; }
        else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectOption(option); return; }
        else if (event.key === "Tab") { close(); return; }
        else return;
        event.preventDefault();
        options[nextIndex].focus();
      });
    });
    select.addEventListener("change", syncSelection);
    syncSelection();
    return { wrapper, close };
  });

  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".filter-control")) filterMenus.forEach((menu) => menu.close());
  });

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
    filterSelects.forEach((select) => {
      select.value = "all";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
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

  const courseSection = document.querySelector(".course-section");
  const mainPanel = document.querySelector(".main-panel");
  const workspacePanel = document.createElement("section");
  workspacePanel.id = "workspace-panel";
  workspacePanel.className = "workspace-panel";
  workspacePanel.hidden = true;
  workspacePanel.setAttribute("aria-live", "polite");
  mainPanel.append(workspacePanel);

  const messageContacts = [
    { name: "Sophia Chen", avatar: "assets/avatar-sophia.png", preview: "Are you joining the study group?", messages: [
      { from: "them", text: "Hey! Are you joining the study group today?" },
      { from: "you", text: "Yes, I’ll be there after class." },
    ] },
    { name: "James Miller", avatar: "assets/avatar-james.png", preview: "Thanks for sharing the notes.", messages: [
      { from: "them", text: "Thanks for sharing the operating systems notes." },
      { from: "you", text: "No problem. The process scheduling section is useful." },
    ] },
    { name: "Isabella Garcia", avatar: "assets/avatar-isabella.jpg", preview: "See you in design class!", messages: [
      { from: "them", text: "Are you bringing your poster draft to class?" },
      { from: "you", text: "Yes, I have a couple of versions to review." },
    ] },
  ];
  let activeContact = messageContacts[0].name;
  let selectedDate = new Date(2025, 11, 14);
  const dateFormatter = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" });
  let scheduleItems = [
    { time: "09:00 AM", title: "Artificial Intelligence lecture", place: "Room 204" },
    { time: "11:30 AM", title: "Operating Systems lab", place: "Computer Lab" },
    { time: "02:00 PM", title: "Web Programming project review", place: "Online classroom" },
  ];
  const defaultTasks = [
    { title: "Review neural network notes", done: false },
    { title: "Finish operating systems lab", done: false },
    { title: "Submit web programming assignment", done: true },
    { title: "Prepare graphic design draft", done: false },
  ];
  let todoTasks;
  try {
    todoTasks = JSON.parse(localStorage.getItem("classroom-tasks") || "null") || defaultTasks;
  } catch {
    todoTasks = defaultTasks;
  }

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  let activeSection = "Dashboard";
  let activeCourse = null;
  const courseContent = {
    "Artificial Intelligence": {
      teacher: "Mr. Felix", level: "Intermediate", art: "course-art-lavender.svg",
      syllabus: [
        { title: "AI foundations and search", description: "Learn how intelligent agents represent problems and choose actions." , lessons: ["Agents and environments", "Uninformed search", "Heuristics and A* search"] },
        { title: "Machine learning", description: "Build a practical foundation in learning from data." , lessons: ["Supervised learning", "Model evaluation", "Decision trees and ensembles"] },
        { title: "Neural networks", description: "Explore the building blocks behind modern deep learning." , lessons: ["Perceptrons", "Backpropagation", "Convolutional networks"] },
        { title: "Responsible AI", description: "Evaluate how intelligent systems affect people and communities." , lessons: ["Bias and fairness", "Explainability", "AI project presentations"] },
      ],
      assignments: [["Search algorithms worksheet", "Dec 18", "10 pts"], ["Train a classification model", "Dec 22", "25 pts"], ["Responsible AI reflection", "Jan 05", "15 pts"]],
      materials: [["AI course slides", "PDF · 18 pages", "Lecture slides covering agents, search, and core AI concepts."], ["Python notebook: search", "Notebook · 4 exercises", "Starter exercises for breadth-first, depth-first, and A* search."], ["Reading: responsible AI", "Article · 12 min", "A short reading about fairness and transparency in AI systems."]],
    },
    "Operating Systems": {
      teacher: "Ms. Nancy", level: "Intermediate", art: "course-art-mint.svg",
      syllabus: [
        { title: "Processes and threads", description: "Understand how an operating system schedules work." , lessons: ["Process states", "Threads and concurrency", "CPU scheduling"] },
        { title: "Synchronization", description: "Coordinate shared resources safely across concurrent programs." , lessons: ["Critical sections", "Locks and semaphores", "Deadlocks"] },
        { title: "Memory management", description: "See how virtual memory makes efficient use of physical memory." , lessons: ["Address translation", "Paging", "Page replacement"] },
        { title: "Files and storage", description: "Explore how files are organized and stored on disk." , lessons: ["File systems", "Directories", "Disk scheduling"] },
      ],
      assignments: [["Process scheduling lab", "Dec 19", "20 pts"], ["Synchronization exercises", "Dec 23", "15 pts"], ["File system report", "Jan 06", "25 pts"]],
      materials: [["OS lecture notes", "PDF · 32 pages", "Class notes for processes, scheduling, and synchronization."], ["Scheduling simulator", "Interactive · 6 scenarios", "Compare how common CPU scheduling algorithms handle workloads."], ["Lab environment guide", "Guide · 5 steps", "Set up the tools needed for the operating systems labs."]],
    },
    "Web Programming": {
      teacher: "Ms. Williams", level: "Beginner", art: "course-art-peach.svg",
      syllabus: [
        { title: "Semantic HTML", description: "Structure meaningful pages with accessible HTML elements." , lessons: ["Document structure", "Forms and validation", "Accessible landmarks"] },
        { title: "CSS and layout", description: "Create flexible layouts that work across screen sizes." , lessons: ["Selectors and cascade", "Flexbox and Grid", "Responsive breakpoints"] },
        { title: "JavaScript essentials", description: "Add useful behavior to the pages you build." , lessons: ["Values and functions", "DOM events", "Working with forms"] },
        { title: "Build and publish", description: "Bring the pieces together in a polished web project." , lessons: ["Project planning", "Accessibility review", "Deployment checklist"] },
      ],
      assignments: [["Accessible profile page", "Dec 17", "15 pts"], ["Responsive landing page", "Dec 21", "25 pts"], ["Interactive project", "Jan 04", "30 pts"]],
      materials: [["HTML reference sheet", "PDF · 8 pages", "A quick reference to semantic elements and common attributes."], ["CSS layout sandbox", "Interactive · 10 examples", "Experiment with responsive Grid and Flexbox layouts."], ["JavaScript DOM guide", "Guide · 7 sections", "Examples for selecting elements and responding to user input."]],
    },
    "Cloud Computing": {
      teacher: "Mr. Alex", level: "Intermediate", art: "course-art-blue.svg",
      syllabus: [
        { title: "Cloud concepts", description: "Compare cloud service models and deployment choices." , lessons: ["Cloud characteristics", "IaaS, PaaS, and SaaS", "Public and private clouds"] },
        { title: "Compute and networking", description: "Design the network and compute resources for a cloud app." , lessons: ["Virtual machines", "Virtual networks", "Load balancing"] },
        { title: "Storage and databases", description: "Choose storage that fits application data and access patterns." , lessons: ["Object storage", "Managed databases", "Backup and recovery"] },
        { title: "Deploy and scale", description: "Deliver reliable services that can grow with demand." , lessons: ["Containers", "Monitoring", "Cost and reliability review"] },
      ],
      assignments: [["Cloud model comparison", "Dec 20", "10 pts"], ["Deploy a web service", "Dec 27", "30 pts"], ["Architecture diagram", "Jan 08", "20 pts"]],
      materials: [["Cloud architecture notes", "PDF · 24 pages", "Reference notes on compute, networking, and storage choices."], ["Deployment walkthrough", "Video · 16 min", "Follow a sample service from local development to cloud hosting."], ["Architecture checklist", "Checklist · 12 items", "Questions to review before publishing a cloud architecture."]],
    },
    "Software Engineering": {
      teacher: "Ms. Susan", level: "Advanced", art: "course-art-peach.svg",
      syllabus: [
        { title: "Requirements and planning", description: "Turn user needs into clear, testable requirements." , lessons: ["Stakeholder interviews", "User stories", "Estimation and planning"] },
        { title: "Architecture and design", description: "Organize software so teams can change it with confidence." , lessons: ["Design principles", "Architecture patterns", "UML and interfaces"] },
        { title: "Testing and quality", description: "Find defects early and build confidence in each release." , lessons: ["Unit and integration tests", "Code review", "Continuous integration"] },
        { title: "Team delivery", description: "Coordinate work from a first commit through release." , lessons: ["Agile workflows", "Release planning", "Project retrospective"] },
      ],
      assignments: [["Requirements specification", "Dec 18", "20 pts"], ["Architecture proposal", "Dec 24", "25 pts"], ["Team project release", "Jan 10", "35 pts"]],
      materials: [["Software design handbook", "PDF · 40 pages", "Examples of maintainable design and common architecture patterns."], ["Testing kata", "Code exercise · 5 tasks", "Practice writing focused tests around a small feature."], ["Sprint planning board", "Template · 1 board", "A starter board for planning a small team project."]],
    },
    "Graphic Designing": {
      teacher: "Ms. Betsy", level: "Beginner", art: "course-art-color.svg",
      syllabus: [
        { title: "Design principles", description: "Use hierarchy, balance, and spacing to guide attention." , lessons: ["Visual hierarchy", "Alignment and balance", "Gestalt principles"] },
        { title: "Color and typography", description: "Build clear visual systems with purposeful type and color." , lessons: ["Color relationships", "Type pairing", "Readable contrast"] },
        { title: "Layout and composition", description: "Arrange images and text for different formats." , lessons: ["Grid systems", "Image composition", "Poster layout"] },
        { title: "Portfolio project", description: "Present a complete visual concept with a clear rationale." , lessons: ["Design brief", "Iteration and critique", "Portfolio presentation"] },
      ],
      assignments: [["Color palette study", "Dec 19", "10 pts"], ["Editorial poster", "Dec 26", "25 pts"], ["Portfolio presentation", "Jan 09", "30 pts"]],
      materials: [["Typography specimen", "PDF · 10 pages", "A visual guide to type anatomy, pairing, and hierarchy."], ["Color palette workbook", "Workbook · 6 exercises", "Practice building accessible, balanced color palettes."], ["Poster critique guide", "Checklist · 9 prompts", "Use these prompts to review composition and communicate feedback."]],
    },
  };

  function renderMessages() {
    const contact = messageContacts.find((item) => item.name === activeContact) || messageContacts[0];
    workspacePanel.innerHTML = `
      <div class="workspace-heading"><p class="eyebrow">Stay connected</p><span class="workspace-count">${messageContacts.length} classmates</span></div>
      <div class="messages-layout">
        <div class="conversation-list" aria-label="Conversations">
          ${messageContacts.map((item) => `<button class="conversation-item${item.name === contact.name ? " active" : ""}" type="button" data-chat-user="${escapeHtml(item.name)}" aria-pressed="${item.name === contact.name}"><img src="${item.avatar}" alt=""><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.preview)}</small></span><i class="online-dot" aria-label="Online"></i></button>`).join("")}
        </div>
        <div class="chat-panel">
          <header class="chat-header"><img src="${contact.avatar}" alt=""><span><strong>${escapeHtml(contact.name)}</strong><small>Online now</small></span><i class="online-dot" aria-label="Online"></i></header>
          <div class="chat-messages" aria-live="polite">${contact.messages.map((message) => `<p class="message-bubble ${message.from === "you" ? "mine" : "theirs"}">${escapeHtml(message.text)}</p>`).join("")}</div>
          <form class="message-form"><label class="visually-hidden" for="message-input">Write a message</label><input id="message-input" name="message" placeholder="Write a message…" autocomplete="off" required><button type="submit">Send</button></form>
        </div>
      </div>`;

    workspacePanel.querySelectorAll("[data-chat-user]").forEach((button) => button.addEventListener("click", () => {
      activeContact = button.dataset.chatUser;
      renderMessages();
    }));
    workspacePanel.querySelector(".message-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.elements.message;
      const bubble = document.createElement("p");
      bubble.className = "message-bubble mine";
      bubble.textContent = input.value.trim();
      if (!bubble.textContent) return;
      workspacePanel.querySelector(".chat-messages").append(bubble);
      contact.messages.push({ from: "you", text: bubble.textContent });
      contact.preview = bubble.textContent;
      input.value = "";
      workspacePanel.querySelector(".chat-messages").scrollTop = workspacePanel.querySelector(".chat-messages").scrollHeight;
      input.focus();
    });
  }

  function renderFriends() {
    const friends = [
      ...messageContacts.map((contact) => ({ ...contact, status: "Online" })),
      { name: "William Brown", avatar: "assets/avatar-william.jpg", preview: "", status: "Online" },
      { name: "Maya Patel", avatar: "assets/course-os.png", preview: "", status: "Away" },
      { name: "Noah Rivera", avatar: "assets/avatar-william.jpg", preview: "", status: "Online" },
    ];
    workspacePanel.innerHTML = `
      <div class="workspace-heading"><p class="eyebrow">Your classmates</p><span class="workspace-count">${friends.filter((friend) => friend.status === "Online").length} online</span></div>
      <label class="friend-search"><span class="visually-hidden">Search friends</span><input type="search" placeholder="Search classmates" autocomplete="off"></label>
      <div class="friends-grid">${friends.map((friend) => `<article class="friend-card" data-friend="${escapeHtml(friend.name.toLowerCase())}"><img src="${friend.avatar}" alt=""><span class="friend-details"><strong>${escapeHtml(friend.name)}</strong><small><i class="online-dot ${friend.status === "Away" ? "away" : ""}"></i>${friend.status}</small></span><button type="button" class="friend-message" data-message-user="${escapeHtml(friend.name)}">Message</button></article>`).join("")}</div>`;
    workspacePanel.querySelectorAll(".friend-card").forEach((card) => {
      const name = card.querySelector(".friend-details strong").textContent;
      card.dataset.profileTrigger = "";
      card.dataset.profileName = name;
      card.tabIndex = 0;
      card.setAttribute("role", "group");
      card.setAttribute("aria-label", `View ${name}'s profile`);
    });
    const search = workspacePanel.querySelector(".friend-search input");
    search.addEventListener("input", () => workspacePanel.querySelectorAll(".friend-card").forEach((card) => {
      card.hidden = !card.dataset.friend.includes(search.value.trim().toLowerCase());
    }));
    workspacePanel.querySelectorAll("[data-message-user]").forEach((button) => button.addEventListener("click", () => {
      const friend = button.dataset.messageUser;
      if (!messageContacts.some((item) => item.name === friend)) {
        messageContacts.push({ name: friend, avatar: button.closest(".friend-card").querySelector("img").src, preview: "Start a conversation", messages: [] });
      }
      activeContact = friend;
      activateSection("Messages");
    }));
  }

  function renderSchedule() {
    workspacePanel.innerHTML = `
      <div class="workspace-heading"><p class="eyebrow">Your agenda</p><span class="workspace-count">${escapeHtml(dateFormatter.format(selectedDate))}</span></div>
      <div class="schedule-toolbar"><p>Upcoming classes and reminders</p><button type="button" class="primary-action" id="add-reminder">Add reminder</button></div>
      <form class="reminder-form" hidden><label>Reminder title<input name="title" placeholder="e.g. Study group" required maxlength="80"></label><label>Time<input name="time" type="time" required></label><button type="submit" class="primary-action">Save reminder</button></form>
      <ol class="agenda-list">${scheduleItems.map((item, index) => `<li class="agenda-item"><time>${escapeHtml(item.time)}</time><span class="agenda-marker" aria-hidden="true"></span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.place)}</small></div><button type="button" class="agenda-remove" data-remove-event="${index}" aria-label="Remove ${escapeHtml(item.title)}">Remove</button></li>`).join("")}</ol>`;
    const reminderForm = workspacePanel.querySelector(".reminder-form");
    workspacePanel.querySelector("#add-reminder").addEventListener("click", () => {
      reminderForm.hidden = false;
      reminderForm.querySelector('input[name="title"]').focus();
    });
    reminderForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(reminderForm);
      const title = String(data.get("title")).trim();
      if (!title) return;
      const [hour, minute] = data.get("time").split(":").map(Number);
      const label = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(2025, 0, 1, hour, minute));
      scheduleItems.push({ time: label, title, place: "Personal reminder" });
      renderSchedule();
      showToast("Reminder added to your schedule.");
    });
    workspacePanel.querySelectorAll("[data-remove-event]").forEach((button) => button.addEventListener("click", () => {
      scheduleItems.splice(Number(button.dataset.removeEvent), 1);
      renderSchedule();
      showToast("Schedule item removed.");
    }));
  }

  function saveTasks() {
    try { localStorage.setItem("classroom-tasks", JSON.stringify(todoTasks)); } catch { /* Storage may be unavailable in private browsing. */ }
  }

  function renderTodos() {
    const completed = todoTasks.filter((task) => task.done).length;
    workspacePanel.innerHTML = `
      <div class="workspace-heading todo-heading"><p class="eyebrow">Keep making progress</p><span class="workspace-count">${completed} of ${todoTasks.length} complete</span></div>
      <div class="todo-progress" role="progressbar" aria-label="Tasks completed" aria-valuemin="0" aria-valuemax="${todoTasks.length}" aria-valuenow="${completed}"><span style="width:${todoTasks.length ? (completed / todoTasks.length) * 100 : 0}%"></span></div>
      <form class="todo-form"><label class="visually-hidden" for="new-task">Add a task</label><input id="new-task" name="task" placeholder="Add a task…" maxlength="100" required><button type="submit" class="primary-action">Add task</button></form>
      <ul class="todo-list">${todoTasks.map((task, index) => `<li class="todo-item${task.done ? " done" : ""}"><label><input type="checkbox" data-task-index="${index}" ${task.done ? "checked" : ""}><span>${escapeHtml(task.title)}</span></label><button type="button" data-delete-task="${index}" aria-label="Delete ${escapeHtml(task.title)}">Delete</button></li>`).join("")}</ul>`;
    workspacePanel.querySelectorAll("[data-task-index]").forEach((checkbox) => checkbox.addEventListener("change", () => {
      todoTasks[Number(checkbox.dataset.taskIndex)].done = checkbox.checked;
      saveTasks();
      renderTodos();
    }));
    workspacePanel.querySelectorAll("[data-delete-task]").forEach((button) => button.addEventListener("click", () => {
      todoTasks.splice(Number(button.dataset.deleteTask), 1);
      saveTasks();
      renderTodos();
    }));
    workspacePanel.querySelector(".todo-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const title = event.currentTarget.elements.task.value.trim();
      if (!title) return;
      todoTasks.unshift({ title, done: false });
      saveTasks();
      renderTodos();
      workspacePanel.querySelector("#new-task").focus();
    });
  }

  function renderSettings() {
    let preferences = {};
    try { preferences = JSON.parse(localStorage.getItem("classroom-preferences") || "{}"); } catch { /* Use default preferences. */ }
    workspacePanel.innerHTML = `
      <div class="workspace-heading"><p class="eyebrow">Make it yours</p></div>
      <section class="settings-group"><h3>Accessibility</h3><label class="setting-row"><span><strong>Larger text</strong><small>Increase text size across the dashboard</small></span><input type="checkbox" data-preference="largeText" ${preferences.largeText ? "checked" : ""}></label><label class="setting-row"><span><strong>Reduce motion</strong><small>Limit animated transitions</small></span><input type="checkbox" data-preference="reduceMotion" ${preferences.reduceMotion ? "checked" : ""}></label><label class="setting-row"><span><strong>High contrast</strong><small>Strengthen text and surface contrast</small></span><input type="checkbox" data-preference="highContrast" ${preferences.highContrast ? "checked" : ""}></label></section>
      <p class="settings-note">Your accessibility preferences are saved in this browser.</p>`;
    Object.entries({ largeText: "large-text", reduceMotion: "reduce-motion", highContrast: "high-contrast" }).forEach(([key, className]) => {
      document.documentElement.classList.toggle(`pref-${className}`, Boolean(preferences[key]));
    });
    workspacePanel.querySelectorAll("[data-preference]").forEach((input) => input.addEventListener("change", () => {
      preferences[input.dataset.preference] = input.checked;
      document.documentElement.classList.toggle(`pref-${{ largeText: "large-text", reduceMotion: "reduce-motion", highContrast: "high-contrast" }[input.dataset.preference]}`, input.checked);
      try { localStorage.setItem("classroom-preferences", JSON.stringify(preferences)); } catch { /* Preference still applies for this session. */ }
    }));
  }

  renderSettings();

  function readCourseState(courseName) {
    try {
      return JSON.parse(localStorage.getItem(`course-state:${courseName}`) || "null") || { completed: [], submitted: [] };
    } catch {
      return { completed: [], submitted: [] };
    }
  }

  function saveCourseState(courseName, state) {
    try { localStorage.setItem(`course-state:${courseName}`, JSON.stringify(state)); } catch { /* Keep the current session interactive if storage is unavailable. */ }
  }

  function renderCourse(courseName, selectedTab = "syllabus") {
    const course = courseContent[courseName];
    if (!course) return;
    const state = readCourseState(courseName);
    const completedCount = state.completed.length;
    const courseKey = escapeHtml(courseName);
    courseSection.hidden = true;
    workspacePanel.hidden = false;
    transitionPageTitle("Course details");
    workspacePanel.innerHTML = `
      <button type="button" class="course-back">‹ <span>Back to all courses</span></button>
      <section class="course-detail-hero">
        <img src="assets/${course.art}" alt="" class="course-detail-art">
        <div class="course-detail-copy"><span class="course-detail-kicker">CSE B 2022 BATCH · ${escapeHtml(course.level)}</span><h2>${courseKey}</h2><p>Created by <strong>${escapeHtml(course.teacher)}</strong></p></div>
        <div class="course-progress"><strong class="course-progress-count">${completedCount} / ${course.syllabus.length} modules</strong><div class="todo-progress" role="progressbar" aria-label="Syllabus progress" aria-valuemin="0" aria-valuemax="${course.syllabus.length}" aria-valuenow="${completedCount}"><span style="width:${(completedCount / course.syllabus.length) * 100}%"></span></div><small>Course progress</small></div>
      </section>
      <div class="course-tabs" role="tablist" aria-label="${courseKey} course sections">
        <button type="button" role="tab" id="tab-syllabus" aria-controls="course-panel" tabindex="${selectedTab === "syllabus" ? "0" : "-1"}" class="course-tab${selectedTab === "syllabus" ? " active" : ""}" aria-selected="${selectedTab === "syllabus"}" data-course-tab="syllabus">Syllabus <span>${course.syllabus.length}</span></button>
        <button type="button" role="tab" id="tab-assignments" aria-controls="course-panel" tabindex="${selectedTab === "assignments" ? "0" : "-1"}" class="course-tab${selectedTab === "assignments" ? " active" : ""}" aria-selected="${selectedTab === "assignments"}" data-course-tab="assignments">Assignments <span>${course.assignments.length}</span></button>
        <button type="button" role="tab" id="tab-materials" aria-controls="course-panel" tabindex="${selectedTab === "materials" ? "0" : "-1"}" class="course-tab${selectedTab === "materials" ? " active" : ""}" aria-selected="${selectedTab === "materials"}" data-course-tab="materials">Study Materials <span>${course.materials.length}</span></button>
      </div>
      <div class="course-tab-panel" id="course-panel" role="tabpanel" tabindex="0" aria-labelledby="tab-${selectedTab}">
        ${selectedTab === "syllabus" ? `<div class="module-list">${course.syllabus.map((module, index) => `<details class="module-card" ${index === 0 ? "open" : ""}><summary><span class="module-number">${String(index + 1).padStart(2, "0")}</span><span class="module-summary"><strong>${escapeHtml(module.title)}</strong><small>${module.lessons.length} lessons</small></span><span class="module-toggle-icon">⌄</span></summary><div class="module-body"><p>${escapeHtml(module.description)}</p><ul>${module.lessons.map((lesson) => `<li>${escapeHtml(lesson)}</li>`).join("")}</ul><label class="module-complete"><input type="checkbox" data-module-index="${index}" ${state.completed.includes(index) ? "checked" : ""}><span>Mark module complete</span></label></div></details>`).join("")}</div>` : ""}
        ${selectedTab === "assignments" ? `<div class="course-content-list">${course.assignments.map((assignment, index) => `<article class="course-content-card assignment-card"><span class="content-type">Assignment · ${escapeHtml(assignment[2])}</span><div><h3>${escapeHtml(assignment[0])}</h3><p>Due ${escapeHtml(assignment[1])}</p></div><button type="button" class="assignment-submit${state.submitted.includes(index) ? " submitted" : ""}" data-submit-assignment="${index}" ${state.submitted.includes(index) ? "disabled" : ""}>${state.submitted.includes(index) ? "Submitted ✓" : "Mark submitted"}</button></article>`).join("")}</div>` : ""}
        ${selectedTab === "materials" ? `<div class="course-content-list">${course.materials.map((material, index) => `<article class="course-content-card material-card"><span class="material-icon" aria-hidden="true">${material[1].startsWith("PDF") ? "PDF" : material[1].startsWith("Video") ? "▶" : material[1].startsWith("Notebook") ? "{ }" : "↗"}</span><div><span class="content-type">${escapeHtml(material[1])}</span><h3>${escapeHtml(material[0])}</h3><p>${escapeHtml(material[2])}</p></div><button type="button" class="material-open" data-material-index="${index}">Preview</button></article>`).join("")}</div>` : ""}
      </div>`;

    workspacePanel.querySelector(".course-back").addEventListener("click", () => {
      activeCourse = null;
      activateSection("All Courses");
    });
    const tabs = [...workspacePanel.querySelectorAll("[data-course-tab]")];
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        const nextTab = tab.dataset.courseTab;
        renderCourse(courseName, nextTab);
        requestAnimationFrame(() => workspacePanel.querySelector(`[data-course-tab="${nextTab}"]`)?.focus());
      });
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        const nextTab = tabs[nextIndex].dataset.courseTab;
        renderCourse(courseName, nextTab);
        requestAnimationFrame(() => workspacePanel.querySelector(`[data-course-tab="${nextTab}"]`)?.focus());
      });
    });
    workspacePanel.querySelectorAll("[data-module-index]").forEach((checkbox) => checkbox.addEventListener("change", () => {
      const index = Number(checkbox.dataset.moduleIndex);
      state.completed = checkbox.checked ? [...new Set([...state.completed, index])] : state.completed.filter((item) => item !== index);
      saveCourseState(courseName, state);
      const total = state.completed.length;
      workspacePanel.querySelector(".course-progress-count").textContent = `${total} / ${course.syllabus.length} modules`;
      const progress = workspacePanel.querySelector('[role="progressbar"]');
      progress.setAttribute("aria-valuenow", String(total));
      progress.querySelector("span").style.width = `${(total / course.syllabus.length) * 100}%`;
    }));
    workspacePanel.querySelectorAll("[data-submit-assignment]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.submitAssignment);
      state.submitted = [...new Set([...state.submitted, index])];
      saveCourseState(courseName, state);
      button.disabled = true;
      button.classList.add("submitted");
      button.textContent = "Submitted ✓";
      showToast("Assignment marked as submitted.");
    }));
    workspacePanel.querySelectorAll("[data-material-index]").forEach((button) => button.addEventListener("click", () => {
      const material = course.materials[Number(button.dataset.materialIndex)];
      document.querySelector("#dialog-title").textContent = material[0];
      document.querySelector("#dialog-description").textContent = material[2];
      document.querySelector("#course-dialog .eyebrow").textContent = "Study material preview";
      const action = document.querySelector("#dialog-action");
      action.textContent = "Close preview";
      action.dataset.action = "close-preview";
      document.querySelector("#course-dialog").showModal();
    }));
  }

  function renderSection(section) {
    activeSection = section;
    const isCourseView = section === "Dashboard" || section === "All Courses";
    courseSection.hidden = !isCourseView || Boolean(activeCourse);
    workspacePanel.hidden = isCourseView && !activeCourse;
    if (isCourseView && activeCourse) {
      renderCourse(activeCourse);
      return;
    }
    transitionPageTitle(section === "Dashboard" ? "My Courses" : section);
    document.querySelector("#course-heading").textContent = section === "All Courses" ? "All courses" : "Course list";
    if (section === "Messages") renderMessages();
    if (section === "Friends") renderFriends();
    if (section === "Schedule") renderSchedule();
    if (section === "To-do") renderTodos();
    if (section === "Settings") renderSettings();
  }

  function activateSection(section, keepCourse = false) {
    if (!keepCourse) activeCourse = null;
    document.querySelectorAll(".nav-link[data-section]").forEach((item) => {
      const active = item.dataset.section === section;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    moveActiveNavMarker();
    renderSection(section);
    setMobileNav(false, true);
  }

  const mobileMenu = document.querySelector(".mobile-menu");
  function setMobileNav(open, restoreFocus = false) {
    mobileMenu.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    document.querySelector(".sidebar").classList.toggle("nav-open", open);
    if (restoreFocus) mobileMenu.focus();
  }

  document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      activateSection(link.dataset.section);
    });
  });

  mobileMenu.addEventListener("click", () => {
    const open = mobileMenu.getAttribute("aria-expanded") !== "true";
    setMobileNav(open);
  });
  document.addEventListener("pointerdown", (event) => {
    if (mobileMenu.getAttribute("aria-expanded") === "true" && !event.target.closest(".sidebar")) setMobileNav(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.getAttribute("aria-expanded") === "true") setMobileNav(false, true);
  });

  const notificationButton = document.querySelector(".notification-button");
  const notificationDot = document.querySelector(".notification-dot");
  const notificationStatus = document.querySelector("#notification-status");
  const notificationItems = [
    { id: "assignment", kind: "assignment", title: "New assignment posted", source: "Web Programming", message: "Responsive landing page is ready. Due Dec 21.", time: "10 min ago", unread: true },
    { id: "study-group", kind: "people", title: "Study group invite", source: "Sophia Chen", message: "Sophia invited you to a study group this afternoon.", time: "1 hour ago", unread: true },
    { id: "os-notes", kind: "course", title: "Course announcement", source: "Operating Systems", message: "Synchronization lab notes have been updated.", time: "Yesterday", unread: true },
    { id: "ai-syllabus", kind: "course", title: "Syllabus updated", source: "Artificial Intelligence", message: "A new module on responsible AI is available.", time: "Yesterday", unread: false },
  ];
  const notificationsDialog = document.createElement("dialog");
  notificationsDialog.className = "notifications-dialog";
  notificationsDialog.setAttribute("aria-labelledby", "notifications-title");
  notificationsDialog.innerHTML = `
    <section class="notifications-panel">
      <header class="notifications-header">
        <div><p class="eyebrow">Your updates</p><h2 id="notifications-title" tabindex="-1">Notifications</h2><p class="notifications-summary"></p></div>
        <button class="notifications-close" type="button" aria-label="Close notifications">×</button>
      </header>
      <div class="notifications-toolbar"><span>Recent activity</span><button class="mark-all-read" type="button">Mark all as read</button></div>
      <div class="notifications-list"></div>
      <p class="notifications-empty" hidden>You’re all caught up. New course updates will show here.</p>
    </section>`;
  document.body.append(notificationsDialog);

  const notificationsList = notificationsDialog.querySelector(".notifications-list");
  const notificationsSummary = notificationsDialog.querySelector(".notifications-summary");
  const markAllReadButton = notificationsDialog.querySelector(".mark-all-read");
  const notificationSymbol = { assignment: "A", people: "S", course: "C" };
  const renderNotifications = () => {
    const unreadCount = notificationItems.filter((item) => item.unread).length;
    notificationDot.hidden = unreadCount === 0;
    notificationButton.setAttribute("aria-label", unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications");
    notificationStatus.textContent = unreadCount ? `${unreadCount} unread notifications.` : "You are all caught up on notifications.";
    notificationsSummary.textContent = unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You’re up to date";
    markAllReadButton.hidden = unreadCount === 0;
    notificationsList.innerHTML = notificationItems.map((item) => `
      <article class="notification-item${item.unread ? " unread" : ""}" data-notification-id="${item.id}">
        <span class="notification-symbol ${item.kind}" aria-hidden="true">${notificationSymbol[item.kind]}</span>
        <div class="notification-copy"><div class="notification-title-row"><h3>${item.title}</h3><time>${item.time}</time></div><p class="notification-source">${item.source}</p><p class="notification-message">${item.message}</p>
          ${item.unread ? `<button class="notification-mark-read" type="button" data-mark-notification="${item.id}">Mark as read</button>` : ""}
        </div>
        <button class="notification-dismiss" type="button" data-dismiss-notification="${item.id}" aria-label="Dismiss ${item.title}">×</button>
      </article>`).join("");
    notificationsDialog.querySelector(".notifications-empty").hidden = notificationItems.length > 0;
  };
  const closeNotifications = () => {
    if (notificationsDialog.open) notificationsDialog.close();
  };
  renderNotifications();
  notificationButton.addEventListener("click", () => {
    if (notificationsDialog.open) closeNotifications();
    else {
      notificationsDialog.showModal();
      notificationsDialog.querySelector("#notifications-title").focus();
    }
  });
  notificationsDialog.querySelector(".notifications-close").addEventListener("click", closeNotifications);
  notificationsDialog.addEventListener("click", (event) => {
    if (event.target === notificationsDialog) { closeNotifications(); return; }
    const markButton = event.target.closest("[data-mark-notification]");
    const dismissButton = event.target.closest("[data-dismiss-notification]");
    if (markButton) {
      const notification = notificationItems.find((item) => item.id === markButton.dataset.markNotification);
      if (notification) notification.unread = false;
      renderNotifications();
    } else if (dismissButton) {
      const index = notificationItems.findIndex((item) => item.id === dismissButton.dataset.dismissNotification);
      if (index >= 0) notificationItems.splice(index, 1);
      renderNotifications();
    }
  });
  markAllReadButton.addEventListener("click", () => {
    notificationItems.forEach((item) => { item.unread = false; });
    renderNotifications();
  });
  notificationsDialog.addEventListener("close", () => notificationButton.focus());

  const profileDirectory = {
    "Lena Williams": { id: "1094881999", program: "Computer Science · CSE B 2022", email: "lena.williams@classroom.edu", courses: "6 enrolled courses", focus: "Interested in collaborative learning and user-centered design." },
    "Sophia Chen": { id: "1094882001", program: "Computer Science · CSE B 2022", email: "sophia.chen@classroom.edu", courses: "5 enrolled courses", focus: "Currently studying artificial intelligence and web programming." },
    "James Miller": { id: "1094672000", program: "Computer Science · CSE B 2022", email: "james.miller@classroom.edu", courses: "4 enrolled courses", focus: "Currently studying operating systems and cloud computing." },
    "Isabella Garcia": { id: "1094342003", program: "Computer Science · CSE B 2022", email: "isabella.garcia@classroom.edu", courses: "5 enrolled courses", focus: "Interested in visual design and frontend development." },
    "William Brown": { id: "1094620002", program: "Computer Science · CSE B 2022", email: "william.brown@classroom.edu", courses: "4 enrolled courses", focus: "Currently studying software engineering and systems." },
    "Maya Patel": { id: "1094882007", program: "Computer Science · CSE B 2022", email: "maya.patel@classroom.edu", courses: "3 enrolled courses", focus: "Interested in interface design and creative coding." },
    "Noah Rivera": { id: "1094882011", program: "Computer Science · CSE B 2022", email: "noah.rivera@classroom.edu", courses: "4 enrolled courses", focus: "Currently studying programming and cloud technologies." },
  };
  const profileSummary = document.querySelector(".profile-summary");
  profileSummary.dataset.profileTrigger = "";
  profileSummary.dataset.profileName = "Lena Williams";
  profileSummary.tabIndex = 0;
  profileSummary.setAttribute("role", "button");
  profileSummary.setAttribute("aria-label", "View Lena Williams's profile");
  document.querySelectorAll(".user-row").forEach((row) => {
    const name = row.querySelector(".user-copy strong").textContent;
    row.dataset.profileTrigger = "";
    row.dataset.profileName = name;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `View ${name}'s profile`);
  });

  const profileDialog = document.createElement("dialog");
  profileDialog.className = "profile-dialog";
  profileDialog.setAttribute("aria-labelledby", "profile-card-name");
  profileDialog.innerHTML = `
    <div class="profile-card-banner"><button class="profile-card-close" type="button" aria-label="Close profile">×</button></div>
    <section class="profile-card-content">
      <img class="profile-card-avatar" alt="">
      <div class="profile-card-heading"><h2 id="profile-card-name"></h2><span class="profile-card-status"><i></i>Classmate</span></div>
      <p class="profile-card-program"></p><p class="profile-card-focus"></p>
      <dl class="profile-card-details"><div><dt>Student ID</dt><dd data-profile-id></dd></div><div><dt>Email</dt><dd data-profile-email></dd></div><div><dt>Courses</dt><dd data-profile-courses></dd></div></dl>
      <button class="profile-card-done" type="button">Close profile</button>
    </section>`;
  document.body.append(profileDialog);
  let profileOpener = null;
  const closeProfile = () => { if (profileDialog.open) profileDialog.close(); };
  const openProfile = (trigger) => {
    const name = trigger.dataset.profileName;
    const details = profileDirectory[name] || {};
    const avatar = trigger.querySelector("img")?.getAttribute("src") || "assets/avatar-william.jpg";
    const rowId = trigger.querySelector(".user-copy small")?.textContent || details.id || "—";
    const status = trigger.querySelector(".online-dot.away") ? "Away" : trigger.querySelector(".online-dot") ? "Online" : "Student";
    profileOpener = trigger;
    profileDialog.querySelector(".profile-card-avatar").src = avatar;
    profileDialog.querySelector(".profile-card-avatar").alt = `${name} profile photo`;
    profileDialog.querySelector("#profile-card-name").textContent = name;
    profileDialog.querySelector(".profile-card-status").innerHTML = `<i class="${status === "Away" ? "away" : ""}"></i>${status}`;
    profileDialog.querySelector(".profile-card-program").textContent = details.program || "Computer Science · CSE B 2022";
    profileDialog.querySelector(".profile-card-focus").textContent = details.focus || "Classmate in the Google Classroom learning community.";
    profileDialog.querySelector("[data-profile-id]").textContent = rowId;
    profileDialog.querySelector("[data-profile-email]").textContent = details.email || `${name.toLowerCase().replaceAll(" ", ".")}@classroom.edu`;
    profileDialog.querySelector("[data-profile-courses]").textContent = details.courses || "Enrolled courses";
    profileDialog.showModal();
    profileDialog.querySelector("#profile-card-name").focus();
  };
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-profile-trigger]");
    if (!trigger || event.target.closest(".friend-message")) return;
    openProfile(trigger);
  });
  document.addEventListener("keydown", (event) => {
    const trigger = event.target.closest("[data-profile-trigger]");
    if (!trigger || event.target !== trigger || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    openProfile(trigger);
  });
  profileDialog.querySelectorAll(".profile-card-close, .profile-card-done").forEach((button) => button.addEventListener("click", closeProfile));
  profileDialog.addEventListener("click", (event) => { if (event.target === profileDialog) closeProfile(); });
  profileDialog.addEventListener("close", () => { if (profileOpener?.isConnected) profileOpener.focus(); });

  const seeAllButton = document.querySelector(".see-all");
  const onlineUserList = document.querySelector(".user-list");
  onlineUserList.id = "online-users-list";
  seeAllButton.setAttribute("aria-controls", onlineUserList.id);
  seeAllButton.addEventListener("click", () => {
    const expanded = seeAllButton.getAttribute("aria-expanded") === "true";
    seeAllButton.setAttribute("aria-expanded", String(!expanded));
    seeAllButton.textContent = expanded ? "See all" : "Show less";
    onlineUserList.classList.toggle("is-expanded", !expanded);
    document.querySelectorAll(".extra-user").forEach((row) => { row.hidden = expanded; });
  });

  const courseDialog = document.querySelector("#course-dialog");
  courses.forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", `Open ${card.dataset.course} course overview`);
    const openCourse = () => {
      activeCourse = card.dataset.course;
      activateSection("All Courses", true);
      requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 600px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
        else workspacePanel.scrollTop = 0;
      });
    };
    card.addEventListener("click", openCourse);
    card.addEventListener("keydown", (event) => {
      if (event.target !== card || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      openCourse();
    });
  });
  document.querySelector("#dialog-action").addEventListener("click", () => {
    courseDialog.close();
    document.querySelector("#course-dialog .eyebrow").textContent = "Course overview";
    document.querySelector("#dialog-action").textContent = "Continue learning";
    delete document.querySelector("#dialog-action").dataset.action;
  });

  const calendarTitle = document.querySelector("#calendar-title");
  const calendarGrid = document.querySelector(".calendar-grid");
  const calendarDays = document.querySelector("#calendar-days");
  const selectedDateLabel = document.querySelector("#selected-date");
  let visibleMonth = new Date(2025, 11, 1);
  let rangeStart = new Date(2025, 11, 11);
  let rangeEnd = new Date(2025, 11, 14);
  let choosingRangeEnd = false;
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

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
      const hasCompleteRange = Boolean(rangeStart && rangeEnd);
      const earlierRangeDate = hasCompleteRange && rangeStart > rangeEnd ? rangeEnd : rangeStart;
      const laterRangeDate = hasCompleteRange && rangeStart > rangeEnd ? rangeStart : rangeEnd;
      const isRangeStart = hasCompleteRange && date.toDateString() === earlierRangeDate.toDateString() && earlierRangeDate < laterRangeDate;
      const isRangeEnd = hasCompleteRange && date.toDateString() === laterRangeDate.toDateString() && earlierRangeDate < laterRangeDate;
      const isSameDateRange = hasCompleteRange && earlierRangeDate.toDateString() === laterRangeDate.toDateString();
      const isRangeMiddle = hasCompleteRange && date > earlierRangeDate && date < laterRangeDate;
      const isRangeEndpoint = hasCompleteRange && (date.toDateString() === earlierRangeDate.toDateString() || date.toDateString() === laterRangeDate.toDateString());
      const isPendingStart = choosingRangeEnd && !rangeEnd && rangeStart.toDateString() === date.toDateString();
      const isMarked = isRangeStart || isRangeEnd || isSameDateRange || isPendingStart;
      button.type = "button";
      button.className = `calendar-day${isMarked ? " marked" : ""}${isRangeStart ? " range-start" : ""}${isRangeEnd ? " range-end" : ""}${isRangeMiddle ? " range-middle" : ""}${isSelected ? " selected" : ""}`;
      const dayLabel = document.createElement("span");
      dayLabel.textContent = String(day);
      button.append(dayLabel);
      button.setAttribute("aria-label", dateFormatter.format(date));
      if (isSelected || isRangeEndpoint || isRangeMiddle || isPendingStart) button.setAttribute("aria-pressed", "true");
      button.addEventListener("click", () => {
        selectedDate = date;
        if (!choosingRangeEnd) {
          rangeStart = date;
          rangeEnd = null;
          choosingRangeEnd = true;
          selectedDateLabel.textContent = `Range starts ${dateFormatter.format(date)}. Choose an end date.`;
        } else {
          rangeEnd = date;
          choosingRangeEnd = false;
          const startLabel = dateFormatter.format(rangeStart);
          const endLabel = dateFormatter.format(rangeEnd);
          selectedDateLabel.textContent = `Selected date range: ${rangeStart <= rangeEnd ? `${startLabel} through ${endLabel}` : `${endLabel} through ${startLabel}`}.`;
        }
        renderCalendar();
        if (activeSection === "Schedule") renderSchedule();
      });
      calendarDays.append(button);
    }
  }

  function animateCalendar(direction) {
    const directionName = direction > 0 ? "next" : "previous";
    calendarGrid.dataset.direction = directionName;
    calendarTitle.dataset.direction = directionName;
    calendarDays.classList.remove("calendar-changing");
    calendarTitle.classList.remove("calendar-changing");
    void calendarDays.offsetWidth;
    calendarDays.classList.add("calendar-changing");
    calendarTitle.classList.add("calendar-changing");
    calendarDays.addEventListener("animationend", () => {
      calendarDays.classList.remove("calendar-changing");
      calendarTitle.classList.remove("calendar-changing");
    }, { once: true });
  }

  document.querySelectorAll("[data-month-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.monthStep);
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + direction, 1);
      renderCalendar();
      animateCalendar(direction);
    });
  });
  renderCalendar();

}
