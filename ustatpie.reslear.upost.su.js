/*!
    uStatPie - v0.1 release, визуальная статистика онлайн пользователей и гостей
    (c) 2016 Korchevskiy Evgeniy (aka ReSLeaR-)
    ---
    vk.com/reslear | upost.su | github.com/reslear
    Released under the MIT @license.
!*/

;(function() {

    "use strict";

    // Constructor
    window.uStatPie = function(container, colors, common, selector, size) {

        this.CONTAINER = document.querySelector(container || '.stat-pie');

        this.COLORS = extend({
            back: '#F6F8FB',
            inner : 'transparent',
            front: '#317AFC',
            user_text:'#6B7C99',
            guest_text:'red',
        }, colors || {});

        this.COMMON = extend({
            cx: 50,
            cy:50,
            r:50-7,
            'stroke-width' : 7,
            'stroke-linecap' : 'round',
            fill: 'transparent'
        }, common || {});

        this.SELECTOR = extend({
            user: '#onl3 b',
            guest: '#onl2 b'
        }, selector || {});

        this.SIZE = extend({
            width: 65,
            height: 65
        }, size || {});

        this.init();
    };




    // Public
    uStatPie.prototype.init = function(user, guest) {

        if( !this.CONTAINER ) return false;

        var parent_svg = multipleAttr(new_svg('svg'), {width: this.SIZE.width, height: this.SIZE.height,  viewBox : '0 0 100 100', 'preserveAspectRatio':'xMinYMin meet'});
        var dasharray = this.dasharray(this.CONTAINER);

        var circles = {
            'stat-pie--back' : {
                stroke: this.COLORS.back,
            },
            'stat-pie--front' : {
                stroke: this.COLORS.front,
                'stroke-dasharray' : dasharray.val
            }
        };

        for(var key in circles) {

            var circle = generateCircle(key, circles[key], this.COMMON);
            parent_svg.appendChild(circle);
        }

        var perc_val = new_svg('g');

        perc_val.classList.add('stat-pie--g');
        perc_val.innerHTML += '<text text-anchor="middle" class="stat-pie--puser">'+dasharray.percent.user+'</text>';
        perc_val.innerHTML += '<text text-anchor="middle" class="stat-pie--pguest" dy="1.5rem">'+dasharray.percent.guest+'</text>';

        parent_svg.appendChild(perc_val);
        this.CONTAINER.innerHTML = '';
        this.CONTAINER.appendChild(parent_svg);

        var onl_stat = document.createElement('div');
        onl_stat.classList.add('stat-pie--users');

        onl_stat.innerHTML += '<div class="stat-pie--user"><b>'+dasharray.num.user+'</b><span>'+declOfNum(dasharray.num.user, ['Пользователь', 'Пользователя', 'Пользователей'])+'</span></div>';
        onl_stat.innerHTML += '<div class="stat-pie--guest"><b>'+dasharray.num.guest+'</b><span>'+declOfNum(dasharray.num.guest, ['Гость', 'Гостя', 'Гостей'])+'</span></div>';
        this.CONTAINER.appendChild(onl_stat);
    };

    uStatPie.prototype.update = function() {

        var front, puser, pguest, user, guest;
        var dasharray = this.dasharray.apply(this, arguments);

        if( (front = this.CONTAINER.querySelector('.stat-pie--front')) ) {
            front.setAttribute('stroke-dasharray', dasharray.val);
        }

        if( (puser = this.CONTAINER.querySelector('.stat-pie--puser')) ) {
            puser.innerHTML =  dasharray.percent.user;
        }

        if( (pguest = this.CONTAINER.querySelector('.stat-pie--pguest')) ) {
            pguest.innerHTML =  dasharray.percent.guest;
        }

        if( (user = this.CONTAINER.querySelector('.stat-pie--user')) ) {
            user.innerHTML =  '<b>'+dasharray.num.user+'</b><span>'+declOfNum(dasharray.num.user, ['Пользователь', 'Пользователя', 'Пользователей'])+'</span>';
        }

        if( (guest = this.CONTAINER.querySelector('.stat-pie--guest')) ) {
            guest.innerHTML =  '<b>'+dasharray.num.guest+'</b><span>'+declOfNum(dasharray.num.guest, ['Гость', 'Гостя', 'Гостей'])+'</span>';
        }

    };


    uStatPie.prototype.dasharray = function(content_or_user, guest) {

        var obj = guest !== undefined ? {user:content_or_user, guest: guest} : parse(content_or_user, this.SELECTOR);
        return calc(obj, this.COMMON.r);
    };




    // Private

    var parse = function( container, selector) {

        if( !(container instanceof Node) ) {
            var html = container;

            container = document.createElement('div');
            container.innerHTML = html;
        }

        var user  = container.querySelector(selector.user);
        var guest = container.querySelector(selector.guest);

        user = user ? user.innerHTML : 0;
        guest = guest ? guest.innerHTML : 0;

        return {user:user, guest: guest};
    };

    var calc = function(obj, radius) {

        obj.user = parseInt(obj.user);
        obj.guest = parseInt(obj.guest);

        var circum = 2 * Math.PI * radius;
        var u_perc = obj.user * 100 / (obj.user + obj.guest);

        var perc = u_perc / 100 * circum;

        // fix visual min 1 vs 1000
        var rzn = circum - perc;
        console.log(rzn);
        perc = rzn < 10 && rzn !== 0 ? perc - 10 : perc;

        return {
            val: perc + ' ' + circum,
            percent: {user: Math.ceil(u_perc) + '%', guest: Math.ceil(100 - u_perc) + '%'},
            num: {user: obj.user, guest: obj.guest}
        };
    };

    var generateCircle = function(key, obj, common) {

        var circle = new_svg("circle");
        circle.classList.add(key);

        obj = extend(common, obj);
        circle = multipleAttr(circle, obj);

        return circle;
    }





    // utils
    function multipleAttr(el, obj) {
        for(var key in obj) {
            el.setAttribute(key, obj[key]);
        }
        return el;
    }

    function extend(arr, arr1) {
        for(var key in arr1) {
            arr[key] = Object(arr1[key]) === arr1[key] ? extend(arr[key], arr1[key]) : arr1[key];
        }
        return arr;
    }

    function new_svg(tag) {
        return document.createElementNS("http://www.w3.org/2000/svg", tag);
    }

    function declOfNum(number, titles, print) {
        var cases = [2, 0, 1, 1, 1, 2];
        return (print ? number+' ' : '') + titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
    }

})();