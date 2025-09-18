$(document).ready(function () {
  $("#configForm").on("submit", function (event) {
    event.preventDefault();

    let loading = "loading...";
     // disable button and display loading
    let originalText = $("#settingsBtn").html();
    $("#settingsBtn")
      .html(loading + '<i class="fa fa-spinner fa-spin"></i>')
      .prop("disabled", true);

    let form = $("#configForm");
    console.log(form);

    $.ajax({
      url: "/api/update-config",
      method: "POST",
      data: form.serializeArray(),
      datatype: "json",
      success: function (response) {
        Swal.fire({
          title: "Success!",
          text: response.message,
          icon: "success",
        });
        $("#settingsBtn").html(originalText).prop("disabled", false);
        getConfiguration();
        console.log(response);
      },
      error: function (error) {
        Swal.fire({
          title: "Error",
          text: error.error,
          icon: "error",
        });
        $("#settingsBtn").html(originalText).prop("disabled", false);
        console.log(error);
      },
    });
  });
});
