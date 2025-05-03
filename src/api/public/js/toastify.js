function showToast(message, isSuccess = true) {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "right",
    backgroundColor: isSuccess ? "green" : "red",
  }).showToast();
}
