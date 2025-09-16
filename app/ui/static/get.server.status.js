$(document).ready(function () {
  setInterval(getServerStatus, 5000);
  let haschanged = 1;

  // this funtion is used to check if the server is still active
  function getServerStatus() {
    $.ajax({
      url: "/check-status",
      type: "GET",
      processData: false,
      contentType: false,
      success: function (response) {
        $(".server-status-text").removeClass("text-danger");
        $(".server-status-text").addClass("text-success");
        $("#server-status").html("Online");
        if (haschanged == 2) {
          addLogEntry("success", "the server is running...");
          notify("The server is currently running!!", {
            type: "dark",
            title: "Success!",
            icon:'📡',
            duration: 5000,
          });
          haschanged = 1;
        }
      },
      error: function (error) {
        $(".server-status-text").removeClass("text-success");
        $(".server-status-text").addClass("text-danger");
        $("#server-status").html("Offline");
        if (haschanged == 1) {
          addLogEntry("error", "the server is currenty not running...");
          haschanged = 2;
        }
      },
    });
  }
});
