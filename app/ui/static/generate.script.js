$(document).ready(function () {
  $("#generateBtn").on("click", function (event) {
    event.preventDefault();
    let loading = "loading...";
    // disable button and display loading
    let originalText = $(this).html();
    $(this)
      .html(loading + '<i class="fa fa-spinner fa-spin"></i>')
      .prop("disabled", true);

    let form = $("#generateForm");
    let generatedCode = $("#generated-code");

    $.ajax({
      url: "/generate-script",
      type: "POST",
      data: form.serializeArray(),
      datatype: "json",
      success: function (response) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
        });
        $("#generateBtn").html(originalText).prop("disabled", false);
        generatedCode.html(response.generatedCode);
        addLogEntry("success", "script generated successfully");
        // reload dashboard
      },
      error: function (error) {
        Swal.fire({
          title: "Error",
          text: error.error,
          icon: "error",
        });
        $("#generateBtn").html(originalText).prop("disabled", false);
      },
    }).then((response)=>{
      // reload generated scripts list
      updateScriptsList();
    });
  });
});
