if (toast.toast !== "") {
    $(function () {
        var toastEl = $('#toast-sub-res');
        var toastBs = new bootstrap.Toast(toastEl);
        if (toast.toast === "success") {
            toastEl.addClass('bg-success');
        } else {
            toastEl.addClass('bg-danger');
        }
        toastBs.show()
    });
}