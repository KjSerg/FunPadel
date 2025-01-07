export const numberInput = () => {
    const inputs = document.querySelectorAll('.number-input');
    inputs.forEach(function (input) {
        input.addEventListener('input', function (event) {
            input.value = input.value.replace(/[^0-9.-]/g, '');
            if ((input.value.match(/\./g) || []).length > 1) {
                input.value = input.value.replace(/\.(?=[^.]*$)/, '');
            }
            if (input.value.indexOf('-') > 0) {
                input.value = input.value.replace('-', '');
            }
        });
    });
}