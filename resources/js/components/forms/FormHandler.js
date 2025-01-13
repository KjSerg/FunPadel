import {isObjectEmpty} from "../utils/_helpers";
import 'selectric';

export default class FormHandler {
    constructor(selector) {
        this.forms = $(document).find(selector);
        this.initialize();
        this.selectInit();
    }

    selectInit() {
        const t = this;
        this.forms.find('.set-cities-js').on('change', function (e){
            const $select = $(this);
            console.log($select)
            const selector = $select.attr('data-cities-selector');
            console.log(selector)
            if (selector === undefined) return;
            const $selector = $(document).find(selector);
            if ($selector.length === 0) return;
            const val = $select.val();
            if (val.length === 0 || !val) return;
            t.setCitiesSelectValues(val, $selector);
        });
    }

    initialize() {
        this.forms.on('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(event) {
        event.preventDefault();

        const $form = $(event.target);
        const formId = $form.attr('id');

        if (!this.validateForm($form)) return;

        const formData = new FormData(document.getElementById(formId));
        this.showPreloader();

        this.sendRequest({
            type: $form.attr('method'),
            url: $form.attr('action'),
            processData: false,
            contentType: false,
            data: formData,
        });

        $form.trigger('reset');
    }

    validateForm($form) {
        let isValid = true;

        // Validate selects
        $form.find('select[required]').each((_, select) => {
            const $select = $(select);
            const $label = $select.closest('.form-label');
            const value = $select.val();

            if (Array.isArray(value) && value.length === 0 || value === null || value === undefined) {
                isValid = false;
                $label.addClass('error');
            } else {
                $label.removeClass('error');
            }
        });

        // Validate inputs and textareas
        $form.find('input, textarea').each((_, input) => {
            const $input = $(input);
            const $label = $input.closest('.form-label');
            const value = $input.val().trim();
            const regExp = $input.data('reg') ? new RegExp($input.data('reg')) : null;

            if ($input.attr('required')) {
                if (!value || (regExp && !regExp.test(value))) {
                    isValid = false;
                    $input.addClass('error');
                    $label.addClass('error');
                } else {
                    $input.removeClass('error');
                    $label.removeClass('error');
                }
            }
        });

        // Validate required custom inputs
        if (!this.validateRequiredInputs($form)) isValid = false;

        // Validate consent checkbox
        const $consent = $form.find('input[name="consent"]');
        if ($consent.length && !$consent.prop('checked')) {
            $consent.closest('.form-consent').addClass('error');
            isValid = false;
        } else {
            $consent.closest('.form-consent').removeClass('error');
        }

        const $password = $form.find('[name="new_password"]');
        const $password1 = $form.find('[name="new_password_repeat"]');
        if ($password.length > 0 && $password1.length > 0) {
            const password = $password.val();
            const password1 = $password.val();
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
            const toggleErrorClass = (hasError) => {
                [$password, $password1].forEach(($field) => {
                    $field.toggleClass('error', hasError);
                    $field.closest('.form-label').toggleClass('error', hasError);
                });
            };
            if (password !== password1) {
                isValid = false;
                toggleErrorClass(true);
            } else if (!passwordRegex.test(password)) {
                isValid = false;
                toggleErrorClass(true);
                this.showMessage(passwordErrorString, 'error');
            } else {
                toggleErrorClass(false);
            }

        }

        return isValid;
    }

    validateRequiredInputs($form) {
        const inputsGroup = {};
        let isValid = true;

        $form.find('[data-required]').each((_, input) => {
            const $input = $(input);
            const name = $input.attr('name');

            if (name) {
                if (!inputsGroup[name]) inputsGroup[name] = [];
                if ($input.prop('checked')) {
                    inputsGroup[name].push($input.val());
                }
            }
        });

        Object.keys(inputsGroup).forEach((key) => {
            const isChecked = inputsGroup[key].length > 0;
            $form.find(`[name="${key}"]`).closest('.form-label').toggleClass('error', !isChecked);
            if (!isChecked) isValid = false;
        });

        return isValid;
    }

    sendRequest(options) {
        $.ajax(options).done((response) => {
            if (response) {
                const isJson = this.isJsonString(response);
                if (isJson) {
                    const data = JSON.parse(response);
                    const message = data.msg || '';
                    const type = data.type || '';
                    const url = data.url;
                    const reload = data.reload || '';
                    if (message) this.showMessage(message, type);
                    if (url) {
                        window.location.href = url;
                        return;
                    }
                    if (reload === 'true') {
                        if (message) {
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                            return;
                        }
                        window.location.reload();
                        return;
                    }
                } else {
                    this.showMessage(response);
                }

            }
            this.hidePreloader();
        });
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    showMessage(message, type = '') {
        const selector = '#dialog' + (type ? '-' + type : '');
        const $modal = $(document).find(selector);
        if ($modal.length === 0) {
            alert(message);
            return;
        }
        $modal.find('.modal__title').html(message);
        $.fancybox.open($modal);
        setTimeout(() => $.fancybox.close(), 3000);
    }


    showPreloader() {
        $('.preloader').addClass('active');
    }

    hidePreloader() {
        $('.preloader').removeClass('active');
    }



    setCitiesSelectValues(countryID, $selector) {
        const $s = $selector.find('select');
        const hint = $s.find('option').eq(0).text().trim();
        let options = `<option selected disabled value="">${hint}</option>`;
        $selector.addClass('not-active');
        $s.removeAttr('required');
        this.showPreloader();
        const opt = {
            type: 'POST',
            url: adminAjax,
            data: {
                action: 'get_cities_object',
                countryID: countryID,
            },
        };
        $.ajax(opt).done((response) => {
            if (response) {
                const isJson = this.isJsonString(response);
                if (isJson) {
                    const data = JSON.parse(response);
                    const message = data.msg || '';
                    const cities = data.cities || {};
                    const type = data.type || '';
                    if (message) this.showMessage(message, type);
                    if (!isObjectEmpty(cities)) {
                        $selector.removeClass('not-active');
                        $s.attr('required', 'required');
                        for (let cityID in cities) {
                            const name = cities[cityID];
                            options += `<option value=${cityID}">${name}</option>`;
                        }
                        $s.html(options);
                        if ($s.hasClass('select')) $s.prop('selectedIndex', 0).selectric('refresh');
                    }
                } else {
                    this.showMessage(response);
                }
            }
            this.hidePreloader();
        });
    }
}


