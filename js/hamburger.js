// javascript to control behaviour when hamburger button is clicked

'use strict';

var isOpened;

$(document).ready(function () {

    //decide whether to open the sidebar nav initially, depending on how big the window width is
    isOpened = window.innerWidth > 500;

    // callback when hamburger menu is clicked
    $("#hamburger").click(function () {

        // show sidebar if necessary
        if (isOpened) {
            $('nav div#filter').css('display', 'block');
            $('nav div#list').css('display', 'block');
        } else {
            $('nav div#filter').css('display', 'none');
            $('nav div#list').css('display', 'none');
        }

        isOpened = !isOpened;

    });

    // click the hamburger once to init
    $("#hamburger").click();

});