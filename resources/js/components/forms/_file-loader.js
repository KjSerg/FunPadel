export const fileLoader = () => {
    const fileInputs = document.querySelectorAll('input[type="file"][data-limit]');
    fileInputs.forEach(input => {
        input.addEventListener("change", function (event) {
            const file = event.target.files[0];
            const dataLimit = parseInt(input.dataset.limit, 10) * 1024 * 1024;
            const preview = input.closest(".form-avatar-label").querySelector(".preview img");
            if (file) {
                if (file.size > dataLimit) {
                    input.value = "";
                    setDefaultImage(preview);
                    $.fancybox.open($('#file-error-modal'));
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (preview) {
                        preview.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            } else {
                setDefaultImage(preview);
            }
        });
    });

}

function setDefaultImage(preview) {
    if (preview) {
        preview.src = preview.getAttribute('data-default');
    }
}