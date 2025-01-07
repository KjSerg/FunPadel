export const creditCart = () => {
    const doc = document;
    doc.querySelectorAll('.card-number').forEach(function (input, index) {
        input.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            value = value.substring(0, 19);
            e.target.value = value;
        });
    });
    doc.querySelectorAll('.cvv').forEach(function (input, index) {
        input.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 3);
            e.target.value = value;
        });
    });
    doc.querySelectorAll('.expiry-date').forEach(function (expiryInput, index) {
        expiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    });
}
