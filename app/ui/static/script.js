        // Tab switching functionality
        function switchTab(tabId) {
            // Remove active class from all tabs and content
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
            document.getElementById(tabId).classList.add('active');
        }

        // Initialize tab switching
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('[data-tab]').forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tabId = this.getAttribute('data-tab');
                    switchTab(tabId);
                });
            });
        });

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
            
            // Initialize tab switching
            document.querySelectorAll('[data-tab]').forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tabId = this.getAttribute('data-tab');
                    switchTab(tabId);
                });
            });
            
            // Initialize sidebar toggle for mobile
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function() {
                    document.querySelector('.sidebar').classList.toggle('show');
                });
            }
            
            // Initialize form handlers
            const generateForm = document.getElementById('generateForm');
            if (generateForm) {
                generateForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    generateTestScript();
                });
            }
            
            // Initialize button handlers
            const copyBtn = document.getElementById('copyScript');
            const saveBtn = document.getElementById('saveScript');
            const runBtn = document.getElementById('runScript');
            
            if (copyBtn) copyBtn.addEventListener('click', copyScript);
            if (saveBtn) saveBtn.addEventListener('click', saveScript);
            if (runBtn) runBtn.addEventListener('click', runScript);
        });
        let testData = {
            tests: [
                { id: 1, name: 'Login Form Validation', status: 'passed', duration: '2.3s', url: 'https://example.com/login' },
                { id: 2, name: 'Navigation Menu Test', status: 'running', duration: '1.2s', url: 'https://example.com' },
                { id: 3, name: 'Contact Form Submission', status: 'failed', duration: '0.8s', url: 'https://example.com/contact' },
                { id: 4, name: 'Product Search Functionality', status: 'pending', duration: '-', url: 'https://example.com/search' }
            ],
            scripts: [
                { name: 'test_login.py', created: '2025-01-15', size: '2.1 KB', status: 'active' },
                { name: 'test_navigation.py', created: '2025-01-14', size: '1.8 KB', status: 'active' },
                { name: 'test_forms.py', created: '2025-01-13', size: '3.2 KB', status: 'inactive' }
            ]
        };

        // Initialize dashboard
        function initializeDashboard() {
            updateRecentTests();
            updateActiveTests();
            updateScriptsList();
            updateResultsTable();
            startSystemLog();
        }

        function updateRecentTests() {
            const container = document.getElementById('recentTests');
            container.innerHTML = testData.tests.map(test => `
                <div class="test-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${test.name}</h6>
                            <small class="text-muted">${test.url}</small>
                        </div>
                        <div class="text-end">
                            <span class="status-badge status-${test.status}">${test.status}</span>
                            <div class="small text-muted mt-1">${test.duration}</div>
                        </div>
                    </div>
                    <div class="progress mt-2" style="height: 4px;">
                        <div class="progress-bar ${getProgressColor(test.status)}" 
                             style="width: ${getProgressWidth(test.status)}%"></div>
                    </div>
                </div>
            `).join('');
        }

        function updateActiveTests() {
            const container = document.getElementById('activeTests');
            const activeTests = testData.tests.filter(test => test.status === 'running' || test.status === 'pending');
            
            if (activeTests.length === 0) {
                container.innerHTML = '<div class="text-center text-muted py-4">No active tests running</div>';
                return;
            }

            container.innerHTML = activeTests.map(test => `
                <div class="test-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">${test.name}</h6>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-light" onclick="viewTestDetails(${test.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="stopTest(${test.id})">
                                <i class="fas fa-stop"></i>
                            </button>
                        </div>
                    </div>
                    <div class="small text-muted mb-2">${test.url}</div>
                    <div class="progress">
                        <div class="progress-bar ${getProgressColor(test.status)}" 
                             style="width: ${Math.random() * 80 + 10}%"></div>
                    </div>
                </div>
            `).join('');
        }

        function updateScriptsList() {
            const container = document.getElementById('scriptsList');
            container.innerHTML = testData.scripts.map(script => `
                <div class="test-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">
                                <i class="fab fa-python text-warning me-2"></i>${script.name}
                            </h6>
                            <small class="text-muted">Created: ${script.created} • Size: ${script.size}</small>
                        </div>
                        <div class="d-flex gap-2">
                            <span class="status-badge status-${script.status === 'active' ? 'passed' : 'pending'}">
                                ${script.status}
                            </span>
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
            `).join('');
        }

        function updateResultsTable() {
            const container = document.getElementById('resultsTable');
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-dark">
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Timestamp</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${testData.tests.map(test => `
                                <tr>
                                    <td>${test.name}</td>
                                    <td><span class="status-badge status-${test.status}">${test.status}</span></td>
                                    <td>${test.duration}</td>
                                    <td>${new Date().toLocaleString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-light me-1" onclick="viewTestReport(${test.id})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-light" onclick="rerunTest(${test.id})">
                                            <i class="fas fa-redo"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        function startSystemLog() {
            const logContainer = document.getElementById('systemLog');
            const logMessages = [
                { type: 'info', message: 'WebTest Automator started successfully' },
                { type: 'success', message: 'AI model loaded and ready' },
                { type: 'info', message: 'Monitoring 4 test scripts' },
                { type: 'warning', message: 'Test "Contact Form" failed on line 23' },
                { type: 'success', message: 'Generated new test script: test_navigation.py' }
            ];

            logMessages.forEach((log, index) => {
                setTimeout(() => {
                    const timestamp = new Date().toLocaleTimeString();
                    logContainer.innerHTML += `
                        <div class="log-entry log-${log.type}">
                            [${timestamp}] ${log.message}
                        </div>
                    `;
                    logContainer.scrollTop = logContainer.scrollHeight;
                }, index * 1000);
            });
        }

        // Form handling
        function initializeFormHandlers() {
            const generateForm = document.getElementById('generateForm');
            if (generateForm) {
                generateForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    generateTestScript();
                });
            }
        }

        function generateTestScript() {
    const btn = document.getElementById('generateBtn');
    const originalText = btn ? btn.innerHTML : 'Generate Test Script';
    
    // Show loading state
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        btn.disabled = true;
    }

    const testName = document.getElementById('testName').value;
    const targetUrl = document.getElementById('targetUrl').value;
    const description = document.getElementById('testDescription').value;
    const testType = document.getElementById('testType').value;

    // Simulate AI generation
    setTimeout(() => {
        const generatedScript = `
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class Test${testName.replace(/\s+/g, '')}:
    def setup_method(self):
        """Setup method to initialize the webdriver"""
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 10)
    
    def teardown_method(self):
        """Teardown method to quit the webdriver"""
        if self.driver:
            self.driver.quit()
    
    def test_${testName.toLowerCase().replace(/\s+/g, '_')}(self):
        """
        Test Description: ${description}
        Target URL: ${targetUrl}
        Test Type: ${testType}
        """
        try:
            # Navigate to target URL
            self.driver.get("${targetUrl}")
            
            # Wait for page to load
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # AI-generated test logic based on description
${generateTestLogic(description, testType, targetUrl).split('\n').map(line => '            ' + line).join('\n')}
            
            # Assert test completion
            assert True, "Test completed successfully"
            
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
    
    def test_page_load_performance(self):
        \"\"\"Additional performance test\"\"\"
        start_time = time.time()
        self.driver.get("${targetUrl}")
        load_time = time.time() - start_time
        
        assert load_time < 5, f"Page load time {load_time:.2f}s exceeds 5 second threshold"

if __name__ == "__main__":
    pytest.main([__file__])
`;

        document.getElementById('generatedCode').innerHTML = `<code class="language-python">${escapeHtml(generatedScript)}</code>`;
        
        // Reset button
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        
        // Log the generation
        addLogEntry('success', `Generated test script for "${testName}"`);
        
    }, 2000);
}
        
        function generateTestLogic(description, testType, targetUrl) {
    const logicTemplates = {
        'functional': `
# Find and interact with form elements
form_elements = self.driver.find_elements(By.TAG_NAME, "input")
for element in form_elements:
    if element.get_attribute("type") in ["text", "email", "password"]:
        element.clear()
        element.send_keys("test_data")

# Submit form if present
try:
    submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")
    if submit_btn:
        submit_btn.click()
except Exception:
    pass`,
        'ui': `
# Check page title
assert self.driver.title, "Page should have a title"

# Verify responsive elements
viewport_sizes = [(1920, 1080), (768, 1024), (375, 667)]
for width, height in viewport_sizes:
    self.driver.set_window_size(width, height)
    time.sleep(1)
    # Verify layout doesn't break`,
        'performance': `
# Measure page load metrics
navigation_start = self.driver.execute_script("return window.performance.timing.navigationStart")
dom_complete = self.driver.execute_script("return window.performance.timing.domComplete")
load_time = (dom_complete - navigation_start) / 1000

assert load_time < 3, f"Page load time {load_time:.2f}s is too slow"`,
        'security': `
# Check for security headers
# Note: This would typically be done via API calls
# Basic XSS test
xss_payload = "<scr" + "ipt>alert('xss')</scr" + "ipt>"
input_fields = self.driver.find_elements(By.TAG_NAME, "input")
for field in input_fields:
    field.clear()
    field.send_keys(xss_payload)`,
        'api': `
# API testing would typically be done with requests library
import requests

response = requests.get("${targetUrl}/api/health")
assert response.status_code == 200, f"API health check failed: {response.status_code}"`
    };

    return logicTemplates[testType] || logicTemplates['functional'];
        }

        // Utility functions
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function getProgressColor(status) {
            const colors = {
                'running': 'bg-warning',
                'passed': 'bg-success',
                'failed': 'bg-danger',
                'pending': 'bg-secondary'
            };
            return colors[status] || 'bg-secondary';
        }

        function getProgressWidth(status) {
            const widths = {
                'running': Math.random() * 40 + 30,
                'passed': 100,
                'failed': Math.random() * 30 + 10,
                'pending': 0
            };
            return widths[status] || 0;
        }

        function addLogEntry(type, message) {
            const logContainer = document.getElementById('systemLog');
            const timestamp = new Date().toLocaleTimeString();
            logContainer.innerHTML += `
                <div class="log-entry log-${type}">
                    [${timestamp}] ${message}
                </div>
            `;
            logContainer.scrollTop = logContainer.scrollHeight;
        }

        // Button click handlers
        function refreshDashboard() {
            addLogEntry('info', 'Refreshing dashboard data...');
            setTimeout(() => {
                updateRecentTests();
                updateActiveTests();
                addLogEntry('success', 'Dashboard refreshed successfully');
            }, 1000);
        }

        function startAllTests() {
            addLogEntry('info', 'Starting all pending tests...');
            testData.tests.forEach(test => {
                if (test.status === 'pending') {
                    test.status = 'running';
                }
            });
            updateActiveTests();
            updateRecentTests();
        }

        function stopAllTests() {
            addLogEntry('warning', 'Stopping all running tests...');
            testData.tests.forEach(test => {
                if (test.status === 'running') {
                    test.status = 'stopped';
                }
            });
            updateActiveTests();
            updateRecentTests();
        }

        function stopTest(testId) {
            const test = testData.tests.find(t => t.id === testId);
            if (test) {
                test.status = 'stopped';
                addLogEntry('warning', `Stopped test: ${test.name}`);
                updateActiveTests();
                updateRecentTests();
            }
        }

        function viewTestDetails(testId) {
            const test = testData.tests.find(t => t.id === testId);
            if (test) {
                alert(`Test Details:\nName: ${test.name}\nStatus: ${test.status}\nURL: ${test.url}\nDuration: ${test.duration}`);
            }
        }

        function viewTestReport(testId) {
            addLogEntry('info', `Opening test report for test ID: ${testId}`);
        }

        function rerunTest(testId) {
            const test = testData.tests.find(t => t.id === testId);
            if (test) {
                test.status = 'running';
                addLogEntry('info', `Rerunning test: ${test.name}`);
                updateActiveTests();
                updateRecentTests();
            }
        }

        function copyScript() {
            const code = document.getElementById('generatedCode').textContent;
            navigator.clipboard.writeText(code).then(() => {
                addLogEntry('success', 'Test script copied to clipboard');
            });
        }

        function saveScript() {
            const testName = document.getElementById('testName').value || 'untitled_test';
            const filename = `test_${testName.toLowerCase().replace(/\s+/g, '_')}.py`;
            
            testData.scripts.push({
                name: filename,
                created: new Date().toISOString().split('T')[0],
                size: '2.5 KB',
                status: 'active'
            });
            
            updateScriptsList();
            addLogEntry('success', `Saved test script: ${filename}`);
        }

        function runScript() {
            const testName = document.getElementById('testName').value || 'Generated Test';
            
            testData.tests.push({
                id: testData.tests.length + 1,
                name: testName,
                status: 'running',
                duration: '0s',
                url: document.getElementById('targetUrl').value || 'https://example.com'
            });
            
            updateActiveTests();
            updateRecentTests();
            addLogEntry('info', `Started test execution: ${testName}`);
        }

        function importScript() {
            addLogEntry('info', 'Opening file import dialog...');
        }

        function createNewScript() {
            switchTab('generate');
            addLogEntry('info', 'Switched to script generation tab');
        }

        function exportResults() {
            addLogEntry('info', 'Exporting test results...');
            setTimeout(() => {
                addLogEntry('success', 'Test results exported to CSV');
            }, 1000);
        }

        // Copy script functionality - removed duplicate initialization

        // Auto-update active tests
        setInterval(() => {
            const runningTests = testData.tests.filter(test => test.status === 'running');
            runningTests.forEach(test => {
                // Randomly complete some tests
                if (Math.random() < 0.1) {
                    test.status = Math.random() < 0.8 ? 'passed' : 'failed';
                    test.duration = (Math.random() * 5 + 0.5).toFixed(1) + 's';
                    addLogEntry(test.status === 'passed' ? 'success' : 'error', 
                              `Test ${test.status}: ${test.name} (${test.duration})`);
                }
            });
            
            updateActiveTests();
            updateRecentTests();
            
            // Update stats
            const stats = {
                total: testData.tests.length,
                passed: testData.tests.filter(t => t.status === 'passed').length,
                running: testData.tests.filter(t => t.status === 'running').length,
                failed: testData.tests.filter(t => t.status === 'failed').length
            };
            
            document.getElementById('totalTests').textContent = stats.total;
            document.getElementById('passedTests').textContent = stats.passed;
            document.getElementById('runningTests').textContent = stats.running;
            document.getElementById('failedTests').textContent = stats.failed;
            
        }, 3000);
