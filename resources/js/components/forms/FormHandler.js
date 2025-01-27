import {isObjectEmpty} from "../utils/_helpers";
import 'selectric';

export default class FormHandler {
    constructor(selector) {
        this.$document = $(document);
        this.forms = $(document).find(selector);
        this.initialize();
        this.selectInit();
    }

    selectInit() {
        const t = this;
        this.$document.find('.set-cities-js').on('change', function (e) {
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
        $(document).on('change', '.trigger-form-js', function (e) {
            const $select = $(this);
            $select.closest('form').submit();
        });
    }

    initialize() {
        this.forms.on('submit', (e) => this.handleSubmit(e));
        this.$document.on('change', '.form-avatar input[type="file"]', function (event) {
            const file = event.target.files[0];
            const input = $(this)[0];
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
            $(this).closest('form').trigger('submit');
        });

    }

    handleSubmit(event) {
        event.preventDefault();

        const $form = $(event.target);
        const formId = $form.attr('id');

        if (!this.validateForm($form)) return;

        const formData = new FormData(document.getElementById(formId));
        this.showPreloader();

        this.sendRequest({
            type: $form.attr('method') || "POST",
            url: $form.attr('action') || adminAjax,
            processData: false,
            contentType: false,
            data: formData,
        });

        if (!$form.hasClass('no-reset')) $form.trigger('reset');
    }

    validateForm($form) {
        let isValid = true;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

        // Validate inputs and textareas
        $form.find('input, textarea').each((_, input) => {
            const $input = $(input);
            const $label = $input.closest('.form-label');
            const value = $input.val().trim();
            const regExp = $input.data('reg') ? new RegExp($input.data('reg')) : null;

            if ($input.attr('required') && (!value || (regExp && !regExp.test(value)))) {
                isValid = false;
                $input.addClass('error');
                $label.addClass('error');
            } else {
                $input.removeClass('error');
                $label.removeClass('error');
            }
        });

        // Validate select elements
        $form.find('select[required]').each((_, select) => {
            const $select = $(select);
            const $label = $select.closest('.form-label');
            const value = $select.val();
            const test = !value || value === null || (Array.isArray(value) && value.length === 0);

            if (test) {
                isValid = false;
                $label.addClass('error');
            } else {
                $label.removeClass('error');
            }
            console.log(test)
            console.log(value)
            console.log($label)
        });

        // Validate custom required inputs
        if (!this.validateRequiredInputs($form)) isValid = false;

        // Validate consent checkbox
        const $consent = $form.find('input[name="consent"]');
        if ($consent.length && !$consent.prop('checked')) {
            $consent.closest('.form-consent').addClass('error');
            isValid = false;
        } else {
            $consent.closest('.form-consent').removeClass('error');
        }

        // Helper function for validating passwords
        const validatePasswordFields = (passwordField1, passwordField2, regex, errorMessage) => {
            const $field1 = $form.find(`[name="${passwordField1}"]`);
            const $field2 = $form.find(`[name="${passwordField2}"]`);
            const value1 = $field1.val();
            const value2 = $field2.val();

            const toggleErrorClass = (hasError) => {
                [$field1, $field2].forEach(($field) => {
                    $field.toggleClass('error', hasError);
                    $field.closest('.form-label').toggleClass('error', hasError);
                });
            };

            if ($field1.length > 0 && $field2.length > 0) {
                if (value1 !== value2) {
                    isValid = false;
                    toggleErrorClass(true);
                } else if (!regex.test(value1)) {
                    isValid = false;
                    toggleErrorClass(true);
                    this.showMessage(errorMessage, 'error');
                } else {
                    toggleErrorClass(false);
                }
            }
        };

        // Validate new and repeated passwords
        validatePasswordFields('new_password', 'new_password_repeat', passwordRegex, passwordErrorString);

        // Validate old and new passwords
        const $field1 = $form.find(`[name="old_password"]`);
        const $field2 = $form.find(`[name="password"]`);
        if ($field1.length > 0 && $field2.length > 0) {
            const value1 = $field1.val();
            const value2 = $field2.val();
            if (value1.length > 0 && value2.length > 0) {
                if (!passwordRegex.test(value2)) {
                    isValid = false;
                    $field2.addClass('error');
                    $field2.closest('.form-label').addClass('error');
                    this.showMessage(passwordErrorString, 'error');
                } else {
                    $field2.removeClass('error');
                    $field2.closest('.form-label').removeClass('error');
                }
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
                    const text = data.msg_text || '';
                    const type = data.type || '';
                    const userName = data.name || '';
                    const url = data.url;
                    const reload = data.reload || '';
                    const avatarURL = data.avatar_url || '';
                    const avatarID = data.avatar_id || '';
                    if (userName) {
                        this.$document.find('.sidebar-name, user-name-js').text(userName);
                    }
                    if (avatarURL) {
                        this.$document.find('.avatar-js').attr('src', avatarURL);
                    }
                    if (avatarID) {
                        this.$document.find('.avatar-id').val(avatarID);
                    }
                    if (message) this.showMessage(message, type, text);
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

    showMessage(message, type = '', text = '') {
        const selector = '#dialog' + (type ? '-' + type : '');
        const $modal = $(document).find(selector);
        if ($modal.length === 0) {
            alert(message);
            return;
        }
        $modal.find('.modal__title').html(message);
        $modal.find('.modal__text').html(text);
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
                            options += `<option value="${cityID}">${name}</option>`;
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

function setDefaultImage(preview) {
    if (preview) {
        preview.src = preview.getAttribute('data-default');
    }
}

