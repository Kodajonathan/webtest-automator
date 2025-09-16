//todo: repurpose file

$(document).ready(function () {
  $("#contextfile").on("change", function (event) {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      const formData = new FormData();
      formData.append("file", file); // Append the file to FormData
      $("#selectedFile").val(event.target.files[0].name);

      $.ajax({
        url: "/upload",
        type: "POST",
        data: formData,
        processData: false, // Prevent jQuery from processing the data
        contentType: false, // Prevent jQuery from setting content type
        success: function (response) {
          Swal.fire({
            title: "Upload Successful",
            text: response.message,
            icon: "success",
          });
        },
        error: function (error) {
             Swal.fire({
            title: "Error",
            text: error.error,
            icon: "error",
          });
        },
      });
    }
  });
});
