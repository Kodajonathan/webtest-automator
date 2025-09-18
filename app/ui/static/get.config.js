$(document).ready(function(){
    fetchGroqModels();
    getConfiguration();
});
let selectedModel="";

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
            $("#modelSelect").val(selectedModel);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching models:", status, error);
            // Handle error - maybe show default models
            showDefaultModels();
        }
    });
}

window.getConfiguration=function (){
    $.ajax({
        url:"/api/get-config",
        method:"POST",
        success:function(data){
            console.log(data);
            let config=data.config;
            //update settings page with configurations
            selectedModel=config.ai_model;
            $("#browser").val(config.browser);
            $("#max-tokens").val(config.max_tokens);
            $("#timeout").val(config.timeout);
            let headless=config.headless;
            if(headless===true){
                $("#headlessMode").prop('checked',true);
            }else{
                $("#headlessMode").prop('checked',false);
            }

        },
        error:function(error){
            console.log(error);
        }
    });
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