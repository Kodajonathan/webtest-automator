class NotificationSystem {
  constructor() {
    this.container = document.getElementById("notificationContainer");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "notification-container";
      this.container.id = "notificationContainer";
      document.body.appendChild(this.container);
    }
  }

  getIcon(type) {
    const icons = {
      success:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    };
    return icons[type] || icons.info;
  }

  create(message, options = {}) {
    const config = {
      type: "info",
      title: "",
      duration: 4000,
      icon: null,
      ...options,
    };

    const notification = document.createElement("div");
    notification.className = `notification ${config.type}`;

    const iconHTML = config.icon
      ? `<span style="font-size: 20px;">${config.icon}</span>`
      : this.getIcon(config.type);

    notification.innerHTML = `
                    <div class="notification-icon">
                        ${iconHTML}
                    </div>
                    <div class="notification-content">
                        ${
                          config.title
                            ? `<div class="notification-title">${config.title}</div>`
                            : ""
                        }
                        <div class="notification-message">${message}</div>
                    </div>
                    <button class="notification-close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    ${
                      config.duration > 0
                        ? `<div class="notification-progress" style="animation-duration: ${config.duration}ms;"></div>`
                        : ""
                    }
                `;

    this.container.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => this.remove(notification));

    // Click to dismiss
    notification.addEventListener("click", (e) => {
      if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
        this.remove(notification);
      }
    });

    // Auto remove
    if (config.duration > 0) {
      setTimeout(() => this.remove(notification), config.duration);
    }

    return notification;
  }

  remove(notification) {
    if (!notification.classList.contains("removing")) {
      notification.classList.add("removing");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }
  }
}

// Initialize the notification system
const notificationSystem = new NotificationSystem();

// Global notify function
function notify(message, options = {}) {
  return notificationSystem.create(message, options);
}


// Simple usage
// notify('Hello World!');

// // With options
// notify('Success!', {
//     type: 'success',
//     title: 'Well done!',
//     duration: 5000
// });

// // Custom notification
// notify('Custom message', {
//     type: 'dark',
//     title: 'Custom Title',
//     duration: 0,  // Won't auto-close
//     icon: '🚀'
// });

