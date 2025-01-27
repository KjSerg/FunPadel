export function removeArrayElement(element, array) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
    return array;
}

export function showPreloader() {
    $('.preloader').addClass('active');
}

export function hidePreloader() {
    $('.preloader').removeClass('active')
}

export function isValidForm($form) {
    let test = true,
        thsInputs = $form.find('input, textarea'),
        $select = $form.find('select[required]');
    let $address = $form.find('input.address-js[required]');
    $select.each(function () {
        let $ths = $(this);
        let $label = $ths.closest('.form-group');
        let val = $ths.val();
        console.log(val);
        if (Array.isArray(val) && val.length === 0) {
            console.log(1);
            test = false;
            $label.addClass('error');
        } else {
            console.log(2);
            $label.removeClass('error');
            if (val === null || val === undefined) {
                console.log(3);
                test = false;
                $label.addClass('error');
            }
        }
    });
    thsInputs.each(function () {
        let thsInput = $(this),
            $label = thsInput.closest('.form_element'),
            thsInputType = thsInput.attr('type'),
            thsInputVal = thsInput.val().trim(),
            inputReg = new RegExp(thsInput.data('reg')),
            inputTest = inputReg.test(thsInputVal);

        if (thsInput.attr('required')) {
            if (thsInputVal.length <= 0) {
                test = false;
                thsInput.addClass('error');
                $label.addClass('error');
                thsInput.focus();
                if (thsInputType === 'file') {
                    $form.find('.cabinet-item__photo-item').eq(0).addClass('error');
                    $('html, body').animate({
                        scrollTop: $form.find('.cabinet-item__photo-item').eq(0).offset().top
                    });
                }
            } else {
                thsInput.removeClass('error');
                $label.removeClass('error');
                if (thsInput.data('reg')) {
                    if (inputTest === false) {
                        test = false;
                        thsInput.addClass('error');
                        $label.addClass('error');
                        thsInput.focus();
                    } else {
                        thsInput.removeClass('error');
                        $label.removeClass('error');
                    }
                }
                if (thsInputType === 'file') {
                    $form.find('.cabinet-item__photo-item').eq(0).removeClass('error');
                }
            }
        }
        if (thsInput.hasClass('time-input')) {
            if (validateTime(thsInputVal)) {
                thsInput.removeClass('error');
                $label.removeClass('error');
            } else {
                test = false;
                thsInput.addClass('error');
                $label.addClass('error');
                thsInput.focus();
            }
        }
    });
    let $password = $form.find('input[name="password"]');
    let $passwordRepeat = $form.find('input[name="repeat_password"]');
    let $passwordOld = $form.find('input[name="old_password"]');
    let $passwordNew = $form.find('input[name="new_password"]');
    if (!$form.hasClass('login-form')) {
        if ($password.length > 0 && $passwordRepeat.length > 0) {
            if ($password.val() !== $passwordRepeat.val()) {
                $password.addClass('error');
                $passwordRepeat.addClass('error');
                return false;
            }
            if (!isValidPassword($password.val())) {
                showMassage(errorPswMsg);
                $password.addClass('error');
                $passwordRepeat.addClass('error');
                return false;
            }
            $password.removeClass('error');
            $passwordRepeat.removeClass('error');
        } else if ($password.length > 0 && $password.val().length > 0) {
            if (!isValidPassword($password.val())) {
                showMassage(errorPswMsg);
                $password.addClass('error');
                $passwordRepeat.addClass('error');
                return false;
            }
            $password.removeClass('error');
            $passwordRepeat.removeClass('error');
        }
        if ($passwordOld.length > 0 && $passwordNew.length > 0) {
            if (!isValidPassword($passwordNew.val())) {
                showMassage(errorPswMsg);
                $passwordNew.addClass('error');
                return false;
            }
            $passwordNew.removeClass('error');
        }
    }
    let $inp = $form.find('input[name="consent"]');
    if ($inp.length > 0) {
        if ($inp.prop('checked') === false) {
            $inp.closest('.form-consent').addClass('error');
            return false;
        }
        $inp.closest('.form-consent').removeClass('error');
    }
    if ($address.length > 0) {
        let addressTest = true;
        $address.each(function (index) {
            let $el = $(this);
            let val = $el.val() || '';
            let selected = $el.attr('data-selected') || '';
            if (selected.trim() !== val.trim()) {
                test = false;
                addressTest = false;
                $el.addClass('error');
            } else {
                $el.removeClass('error');
            }
            if (val.length === 0) {
                test = false;
                $el.addClass('error');
            }
        });
        if (!addressTest) showMassage(locationErrorString);
    }
    if ($form.hasClass('comment-form')) {
        if ($form.find('.value-field').val().trim().length === 0) return false;
    }
    return test;
}

export function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export const isObjectEmpty = (objectName) => {
    return JSON.stringify(objectName) === "{}";
};

export function isElementInViewport(el) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    let rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export function getCurrentDate() {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    day = (day < 10) ? "0" + day : day;
    month = (month < 10) ? "0" + month : month;
    return day + "-" + month + "-" + year;
}

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; Secure; SameSite=None";
}

export function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export const bytesToMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
}

export const bytesToKB = (bytes) => {
    return Math.floor(bytes / 1000);
}

export function copyToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    console.log('Скопійовано в буфер обміну: ' + text);
    showMassage('Copied 🖇️');
}

export function isImageUrl(string) {
    return /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg|HEIF|heif)$/.test(string);
}

export function detectBrowser() {
    var userAgent = navigator.userAgent;
    var browserName;
    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browserName = "samsung-internet";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browserName = "opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        browserName = "internet-explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "safari";
    } else {
        browserName = "unknown";
    }

    return browserName;
}

export function isEven(number) {
    return number % 2 === 0;
}

export function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function invertNumber(num) {
    return -num;
}

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};

    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    return params;
}