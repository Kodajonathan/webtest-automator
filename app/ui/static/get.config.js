$(document).ready(function(){
    fetchGroqModels();
});

function fetchGroqModels() {
    $.ajax({
        url: "/api/groq-models",  // Use your own server endpoint
        method: "GET",
        success: function (data) {
            console.log("Available models:", data);
            // Process the models data here
            if (data.data && Array.isArray(data.data)) {
                populateModelDropdown(data.data);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching models:", status, error);
            // Handle error - maybe show default models
            showDefaultModels();
        }
    });
}

function getAppConfiguration(){
    $.ajax();
}

function populateModelDropdown(models) {
    const modelSelect = $("#modelSelect"); // Assuming you have a select element
    modelSelect.empty();
    
    models.forEach(model => {
        modelSelect.append(`<option value="${model.id}">${model.id}</option>`);
    });
}

function showDefaultModels() {
    // Fallback models if API fails
    const defaultModels = [
        "No models found",
    ];
    
    const modelSelect = $("#modelSelect");
    modelSelect.empty();
    defaultModels.forEach(model => {
        modelSelect.append(`<option value="${model}">${model}</option>`);
    });
}