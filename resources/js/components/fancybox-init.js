import $ from 'jquery';
window.$ = $;
window.jQuery = $;
import '@fancyapps/fancybox';
export const fancyboxInit = () => {
    $('[data-fancybox]').fancybox({});
    $('.fancybox').fancybox();
};
