$(document).ready(function () {
  $("#currentYear").html(new Date().getFullYear());
  // Initialize dashboard
  initializeDashboard();

  function initializeDashboard() {
    updateScriptsList();
    updateRecentTests();
    // updateActiveTests();
    // updateResultsTable();
    // startSystemLog();
  }

  let copyBtn = $("#copyScript");
  if (copyBtn) copyBtn.on("click", copyScript);

});

function copyScript() {
  const code = document.getElementById("generated-code").textContent;
  navigator.clipboard.writeText(code).then(() => {
    addLogEntry("success", "Test script copied to clipboard");
    notify('Test script copied to clipboard', {
    type: 'dark',
    title: 'Success!',
    duration: 6000,
    icon: '📋'
});
  });
}

let testData = {
  tests: [
    {
      id: 1,
      name: "Login Form Validation",
      status: "passed",
      duration: "2.3s",
      url: "https://example.com/login",
    },
    {
      id: 2,
      name: "Navigation Menu Test",
      status: "running",
      duration: "1.2s",
      url: "https://example.com",
    },
    {
      id: 3,
      name: "Contact Form Submission",
      status: "failed",
      duration: "0.8s",
      url: "https://example.com/contact",
    },
    {
      id: 4,
      name: "Product Search Functionality",
      status: "pending",
      duration: "-",
      url: "https://example.com/search",
    },
  ],
  scripts: [
    {
      name: "test_login.py",
      created: "2025-01-15",
      size: "2.1 KB",
      status: "active",
    },
    {
      name: "test_navigation.py",
      created: "2025-01-14",
      size: "1.8 KB",
      status: "active",
    },
    {
      name: "test_forms.py",
      created: "2025-01-13",
      size: "3.2 KB",
      status: "inactive",
    },
  ],
};

window.addLogEntry=function (type, message) {
  const logContainer = document.getElementById("systemLog");
  const timestamp = new Date().toLocaleTimeString();
  logContainer.innerHTML += `
                <div class="log-entry log-${type}">
                    [${timestamp}] ${message}
                </div>
            `;
  logContainer.scrollTop = logContainer.scrollHeight;
}

function getProgressColor(status) {
  const colors = {
    running: "bg-warning",
    passed: "bg-success",
    failed: "bg-danger",
    pending: "bg-secondary",
  };
  return colors[status] || "bg-secondary";
}

function getProgressWidth(status) {
  const widths = {
    running: Math.random() * 40 + 30,
    passed: 100,
    failed: Math.random() * 30 + 10,
    pending: 0,
  };
  return widths[status] || 0;
}

function updateRecentTests() {
  const container = document.getElementById("recentTests");
  container.innerHTML = testData.tests
    .map(
      (test) => `
                <div class="test-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${test.name}</h6>
                            <small class="text-muted">${test.url}</small>
                        </div>
                        <div class="text-end">
                            <span class="status-badge status-${test.status}">${
        test.status
      }</span>
                            <div class="small text-muted mt-1">${
                              test.duration
                            }</div>
                        </div>
                    </div>
                    <div class="progress mt-2" style="height: 4px;">
                        <div class="progress-bar ${getProgressColor(
                          test.status
                        )}" 
                             style="width: ${getProgressWidth(
                               test.status
                             )}%"></div>
                    </div>
                </div>
            `
    )
    .join("");
}

window.updateScriptsList=function() {
//get scripts
$.ajax({
   url: "/get-generated-scripts",
      type: "POST",
      processData: false,
      contentType: false,
      success: function (response) {  
        let $container=$("#scriptsList");
        let scripts=response.scripts;
        $container.html(scripts.map((script)=>`
        <div class="test-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">
                                <i class="fab fa-python text-warning me-2"></i>${
                                  script.filename
                                }
                            </h6>
                            <small class="text-muted">Created: ${
                              formatDate(script.modified)
                            } • Size:${formatFileSize(script.size)}</small>
                        </div>
                        <div class="d-flex gap-2">
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-light" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#"><i class="fas fa-edit me-2"></i>Edit</a></li>
                                    <li><a class="dropdown-item" href="#"><i class="fas fa-play me-2"></i>Run</a></li>
                                    <li><a class="dropdown-item" href="#"><i class="fas fa-download me-2"></i>Download</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#"><i class="fas fa-trash me-2"></i>Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
        `).join(""))
        console.log(response)    },
      error:function(error){  console.log(error)    }
});
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    // Option 1: Short format like "1/15/2025, 2:30 PM"
    return date.toLocaleString();
    
    // Option 2: Just date like "Jan 15, 2025"
    // return date.toLocaleDateString('en-US', { 
    //     year: 'numeric', 
    //     month: 'short', 
    //     day: 'numeric' 
    // });
    
    // Option 3: Relative time like "2 hours ago"
    // return getRelativeTime(date);
}
}
