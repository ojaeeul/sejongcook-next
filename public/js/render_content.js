// Load Content from LocalStorage(Enabled for Admin Preview)
// To enable Admin Preview, we can uncomment this or add a URL param check.
var savedConfig = localStorage.getItem('sejongcook_admin_config_v4'); // Bumped to v4 to force cache clear
if (savedConfig) {
    try {
        var parsedConfig = JSON.parse(savedConfig);
        if (typeof siteContent !== 'undefined') {
            siteContent = parsedConfig;
        } else {
            window.siteContent = parsedConfig;
        }
        console.log("Loaded site content from LocalStorage (Admin Update v4)");
    } catch (e) {
        console.error("Failed to parse local config", e);
    }
}

// Wrap everything in document ready to ensure DOM is available
jQuery(function ($) {
    console.log("!!! RENDER CONTENT FIXED VERSION LOADED !!!");
    if (typeof siteContent === 'undefined') {
        console.error("siteContent is undefined. Content rendering skipped.");
        return;
    }

    console.log("render_content.js: Starting initialization...");
    if (window.renderContentInitialized) {
        console.warn("render_content.js already ran. Skipping.");
        return;
    }
    window.renderContentInitialized = true;

    // Auto-bootstrap for all pages: Ensure CSS and Container exist
    (function bootstrap() {
        // [FIX] Inject Responsive Styles for Mobile & Tablets
        // 1. Grid Fix: Stack quick links
        // 2. Menu Fix: Force toggle visibility, Size up, and Move to Top-Left (Fixed Position)
        // 3. Phone Fix: Force header phone visibility
        // 4. Hero Title Fix: Force Single Line (adjust font size to fit)
        // 5. Layout Fix: Center Logo on Mobile to accommodate Left Menu
        // 6. Menu Overflow Fix: Ensure menu is scrollable, fits screen, and is LEFT ALIGNED (Drawer style)
        var mobileStyle = '<style>' +
            '@media (max-width: 1024px) { ' +
            '.card-grid-3 { grid-template-columns: 1fr !important; } ' +
            '#farmToggleLnb { display: block !important; z-index: 2147483647 !important; position: fixed !important; top: 15px !important; left: 15px !important; right: auto !important; color:#333 !important; font-size: 0 !important; width: 50px !important; height: 50px !important; background: transparent !important; text-decoration: none !important; } ' +
            '#farmToggleLnb::before { content: "\\2630"; font-size: 40px !important; display: block; line-height: 50px; text-align: center; } ' +
            '#farmBoxLnb { position: fixed !important; top: 0 !important; left: 0 !important; right: auto !important; width: 70% !important; max-width: 300px !important; height: 100vh !important; max-height: none !important; overflow-y: auto !important; z-index: 2147483646 !important; background: #fff !important; box-shadow: 2px 0 10px rgba(0,0,0,0.2) !important; border-radius: 0 !important; padding-top: 60px !important; transform: none !important; opacity: 1 !important; visibility: visible !important; display: none; } ' +
            '#farmBoxLnb.on { display: block !important; } ' +
            '.tel_8591_ { display: inline-block !important; z-index: 10001 !important; position: relative; font-size: 16px !important; color:#000 !important; font-weight: bold !important; } ' +
            '.hero-title { white-space: nowrap !important; font-size: 7vw !important; } ' +
            '.logo_381031_ { text-align: center !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; } ' +
            '}' +
            '/* GLOBAL FIX: Double Logo Nuclear Option */' +
            '.logo_381031_ > *:not(#dynamic-logo):not(#farmToggleLnb) { display: none !important; }' +
            '.logo_381031_ img:not(.dynamic-logo-img) { display: none !important; }' +
            '</style>';
        $('head').append(mobileStyle);

        var scripts = document.getElementsByTagName('script');
        var myScript = null;
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf('render_content.js') !== -1) {
                myScript = scripts[i];
                break;
            }
        }

        var basePath = "";
        if (myScript) {
            var scriptPath = myScript.src;
            basePath = scriptPath.substring(0, scriptPath.lastIndexOf('js/render_content.js'));
        }

        // 1. Inject CSS if missing
        if (!$('link[href*="quick_menu.css"]').length) {
            $('<link>')
                .attr('rel', 'stylesheet')
                .attr('type', 'text/css')
                .attr('href', basePath + 'css/quick_menu.css')
                .appendTo('head');
        }

        // Inject Custom Animations CSS
        if (!$('#custom-animations-style').length) {
            var animationCss = `
                    <style id="custom-animations-style">
                        /* ... reused styles ... */
                        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 20px, 0); } to { opacity: 1; transform: none; } }
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out both; }
                    </style>
                `;
            $('head').append(animationCss);
        }
    })();

    // 1. Render Logo
    if ($('#dynamic-logo').length && siteContent.logo) {

        // Define Cleanup Function
        function cleanupDoubleLogos(currentPosMode) {
            // Aggressive Cleanup: Iterate all children of the logo container
            $('.logo_381031_').children().each(function () {
                var $this = $(this);
                // CRITICAL: Always preserve the mobile menu toggle
                if ($this.attr('id') === 'farmToggleLnb') return;

                if (currentPosMode === 'absolute') {
                    // Absolute Mode: The real logo is moved OUT to header container.
                    // So ANYTHING left in .logo_381031_ is a duplicate -> Kill it.
                    // console.log("Cleanup (Absolute): Removing duplicate", $this);
                    $this.remove();
                } else {
                    // Normal Mode: The real logo is #dynamic-logo.
                    // Remove anything that is NOT the real logo.
                    if ($this.attr('id') !== 'dynamic-logo') {
                        // console.log("Cleanup (Normal): Removing duplicate", $this);
                        $this.remove();
                    }
                }
            });

            // Force Hide Static Logo (Legacy class support) just in case it wasn't a direct child
            $('.img_381030_').hide();
            var staticLogo = document.querySelector('.img_381030_');
            if (staticLogo) {
                staticLogo.style.setProperty('display', 'none', 'important');
            }
        }

        if (siteContent.logo.visible === false) {
            console.log("Logo is set to hidden via config.");
            $('#dynamic-logo').hide();
        } else {
            console.log("Rendering Dynamic Logo...");
            $('#dynamic-logo').show(); // Ensure visible

            var align = siteContent.logo.align || 'left';
            var width = siteContent.logo.width || '200px';
            var logoType = siteContent.logo.type || 'image';
            var posMode = siteContent.logo.posMode || 'normal';

            // [FIX] Force Normal Mode on Mobile/Tablet to prevent layout breakage
            if (window.innerWidth <= 1024) {
                console.log("Mobile/Tablet detected: Forcing logo to Normal mode");
                posMode = 'normal';
            }

            // [FIX] Target the main layout wrapper for free movement across the whole header
            var $headerContainer = $('.layout_381029_');
            $headerContainer.css('position', 'relative');

            if (posMode === 'absolute') {
                console.log("Logo Mode: Absolute");
                var top = siteContent.logo.top || '0px';
                var left = siteContent.logo.left || '0px';
                var zIndex = siteContent.logo.zIndex || '9999';

                $('#dynamic-logo').css({
                    'position': 'absolute',
                    'top': top,
                    'left': left,
                    'z-index': zIndex,
                    'width': 'auto',
                    'display': 'block',
                    'transform': 'none'
                });

                // Move logo to main container to ensure full range of motion if not already there
                if ($('#dynamic-logo').parent()[0] !== $headerContainer[0]) {
                    $('#dynamic-logo').appendTo($headerContainer);
                }
            } else {
                console.log("Logo Mode: Normal");
                // Normal Flow
                $('#dynamic-logo').css({
                    'position': 'static',
                    'top': 'auto',
                    'left': 'auto',
                    'transform': 'none'
                });
                // Ensure strict alignment in normal mode
                $('#dynamic-logo').closest('.logo_381031_').css('text-align', align);
                $('#dynamic-logo').css({
                    'text-align': align,
                    'display': 'inline-block', // Ensure it sits nicely with siblings
                    'margin': '0 10px' // Add breathing room
                });

                // If it was moved OUT previously, move it BACK IN
                var $originalContainer = $('.logo_381031_');
                if ($('#dynamic-logo').parent()[0] !== $originalContainer[0]) {
                    $originalContainer.prepend($('#dynamic-logo'));
                }
            }
            $headerContainer.css('position', 'relative');

            if (posMode === 'absolute') {
                console.log("Logo Mode: Absolute");
                var top = siteContent.logo.top || '0px';
                var left = siteContent.logo.left || '0px';
                var zIndex = siteContent.logo.zIndex || '9999';

                $('#dynamic-logo').css({
                    'position': 'absolute',
                    'top': top,
                    'left': left,
                    'z-index': zIndex,
                    'width': 'auto',
                    'display': 'block',
                    'transform': 'none'
                });

                // Move logo to main container to ensure full range of motion if not already there
                if ($('#dynamic-logo').parent()[0] !== $headerContainer[0]) {
                    $('#dynamic-logo').appendTo($headerContainer);
                }
            } else {
                console.log("Logo Mode: Normal");
                // Normal Flow
                $('#dynamic-logo').css({
                    'position': 'static',
                    'top': 'auto',
                    'left': 'auto',
                    'transform': 'none'
                });
                // Ensure strict alignment in normal mode
                $('#dynamic-logo').closest('.logo_381031_').css('text-align', align);
                $('#dynamic-logo').css({
                    'text-align': align,
                    'display': 'inline-block', // Ensure it sits nicely with siblings
                    'margin': '0 10px' // Add breathing room
                });

                // If it was moved OUT previously, move it BACK IN
                var $originalContainer = $('.logo_381031_');
                if ($('#dynamic-logo').parent()[0] !== $originalContainer[0]) {
                    $originalContainer.prepend($('#dynamic-logo'));
                }
            }

            var logoHtml = '';

            if (logoType === 'text') {
                // Text Logo Logic
                var isPrefix = siteContent.logo.prefixUse !== false;
                var prefixHtml = isPrefix ? '<span style="color:' + (siteContent.logo.prefixColor || '#3498db') + '; font-size:' + (siteContent.logo.prefixSize || '30px') + '; margin-right:5px; font-weight:900;">' + (siteContent.logo.prefixText || 'SJ') + '</span>' : '';

                var mainStyle = 'color:' + (siteContent.logo.textColor || '#000') + '; font-size:' + (siteContent.logo.textSize || '24px') + '; font-family:' + (siteContent.logo.textFont || 'sans-serif') + '; font-weight:' + (siteContent.logo.textWeight || 'bold') + ';';

                if (siteContent.logo.textLines === '2') {
                    var l1 = siteContent.logo.textLine1 || '';
                    var l2 = siteContent.logo.textLine2 || '';
                    logoHtml = '<h1 style="margin:0; padding:0; display:inline-flex; align-items:center; line-height:1.2;">' +
                        prefixHtml +
                        '<a href="index.html" style="text-decoration:none; display:flex; flex-direction:column; align-items:flex-start; ' + mainStyle + '">' +
                        '<span>' + l1 + '</span><span>' + l2 + '</span>' +
                        '</a></h1>';
                } else {
                    var t = siteContent.logo.text || 'Logo';
                    logoHtml = '<h1 style="margin:0; padding:0; display:inline-flex; align-items:center;">' +
                        prefixHtml +
                        '<a href="index.html" style="text-decoration:none; ' + mainStyle + '">' + t + '</a></h1>';
                }
            } else {
                // Image Mode
                var widthVal = (siteContent.logo.width || '200px').replace(';', '');
                // Mobile width adjustment
                if (window.innerWidth <= 768) { widthVal = '120px'; }

                logoHtml = '<h1 style="margin:0; padding:0; display:inline-block; line-height:1;"><a href="' + (siteContent.logo.link || 'index.html') + '" target="_self" style="display:inline-block; height:auto; width:auto; text-decoration:none;"><img src="' + siteContent.logo.src + '" alt="' + siteContent.logo.alt + '" style="height: auto; width: ' + widthVal + ' !important; max-height:none; max-width:none; transition: width 0.3s ease;" class="dynamic-logo-img"></a></h1>';
            }

            $('#dynamic-logo').empty().html(logoHtml);

            // Run cleanup immediately
            cleanupDoubleLogos(posMode);

            // Run cleanup again after a short delay to catch late legacy injections
            setTimeout(function () { cleanupDoubleLogos(posMode); }, 100);
            setTimeout(function () { cleanupDoubleLogos(posMode); }, 500);
            setTimeout(function () { cleanupDoubleLogos(posMode); }, 1000);
        }
    } else {
        console.warn("Dynamic Logo Container (#dynamic-logo) not found or siteContent.logo missing.");
    }

    // 2. Render Header Image
    if ($('#dynamic-header-img').length && siteContent.headerImage) {
        $('#dynamic-header-img').html('<img src="' + siteContent.headerImage.src + '" alt="' + siteContent.headerImage.alt + '">');
    }

    // 3. Render Logo (Standard Logic)



    // 2. Render Header Image
    if ($('#dynamic-header-img').length && siteContent.headerImage) {
        $('#dynamic-header-img').html('<img src="' + siteContent.headerImage.src + '" alt="' + siteContent.headerImage.alt + '">');
    }

    // 3. Render Hero Section (Modern)
    if ($('#main-hero-section').length && siteContent.mainHero) {
        if (siteContent.mainHero.images && siteContent.mainHero.images.length > 0) {
            // Multi-image slider
            var sliderHtml = '<div class="hero-slider">';
            $.each(siteContent.mainHero.images, function (i, imgSrc) {
                var activeClass = (i === 0) ? 'active' : '';
                sliderHtml += '<div class="hero-slide ' + activeClass + '" style="background-image: url(\'' + imgSrc + '\')"></div>';
            });
            sliderHtml += '</div>';

            // Prepend slider to hero section (so it stays behind text content which is relative/z-index 2)
            if ($('.hero-slider').length === 0) {
                $('#main-hero-section').prepend(sliderHtml);
            } else {
                $('.hero-slider').replaceWith(sliderHtml);
            }

            // Initialize Slider Logic
            if (window.heroSliderInterval) clearInterval(window.heroSliderInterval);
            window.heroSliderInterval = setInterval(function () {
                var $active = $('.hero-slide.active');
                var $next = $active.next('.hero-slide');
                if ($next.length === 0) {
                    $next = $('.hero-slide').first();
                }
                $active.removeClass('active');
                $next.addClass('active');
            }, 5000); // 5 seconds per slide
        } else if (siteContent.mainHero.bgImage) {
            // Single image fallback
            $('#main-hero-section').css('background-image', 'url("' + siteContent.mainHero.bgImage + '")');
        }
        // Update Text if needed (Optional, but good for completeness)
        if (siteContent.mainHero.title) {
            $('.hero-title').html(siteContent.mainHero.title + '<br><span style="font-size: 0.6em; font-weight: 300;">' + (siteContent.mainHero.subtitle || '') + '</span>');
        }
        if (siteContent.mainHero.description && $('.hero-subtitle').length) {
            $('.hero-subtitle').html(siteContent.mainHero.description.replace(/\n/g, '<br>'));
        }
        if (siteContent.mainHero.badgeText && $('.hero-badge').length) {
            $('.hero-badge').text(siteContent.mainHero.badgeText);
        }
    } else if ($('#slides_380975_').length && siteContent.heroSlides && siteContent.heroSlides.length > 0) {
        // Fallback to legacy slider if modern hero is missing but legacy container exists
        var slidesHtml = '';
        $.each(siteContent.heroSlides, function (index, slide) {
            slidesHtml += '<div>';
            slidesHtml += '<img src="' + slide.src + '" alt="' + slide.alt + '">';
            if (slide.buttonText) {
                slidesHtml += '<div class="btn"><a href="' + slide.link + '" target="' + slide.target + '">' + slide.buttonText + '</a></div>';
            }
            slidesHtml += '</div>';
        });
        $('#slides_380975_').html(slidesHtml);
    }

    // 4. Render Quick Links (Modern Card Grid)
    // [FIX] Ensure we target the card grid present in index.html
    if (siteContent.quickLinks && $('.card-grid-3').length) {
        var style = siteContent.cardGridStyle || {};
        var columns = style.columns || 3;
        var textAlign = style.textAlign || 'left';
        var titleColor = style.titleColor || '#333333';
        var descColor = style.descColor || '#666666';
        var cardBg = style.cardBg || '#ffffff';
        var cardHeight = style.cardHeight || 'auto';
        var titleSize = style.titleSize || '1.4rem';
        var descSize = style.descSize || '15px';

        // Apply grid column layout
        $('.card-grid-3').css({
            'grid-template-columns': 'repeat(' + columns + ', 1fr)'
        });

        var cardsHtml = '';
        $.each(siteContent.quickLinks, function (index, item) {
            var delayClass = 'delay-' + ((index % 3) + 1) + '00'; // Cycle 100, 200, 300

            var inlineStyle = 'text-align:' + textAlign + '; background-color:' + cardBg + ';';
            if (cardHeight && cardHeight !== 'auto' && cardHeight !== '') {
                inlineStyle += ' min-height:' + cardHeight + ';';
            }

            cardsHtml += '<a href="' + item.link + '" class="info-card ' + delayClass + '" data-animate style="' + inlineStyle + '">';

            // Image Area (Slider vs Static)
            cardsHtml += '  <div style="height:240px; overflow:hidden; position:relative;">';
            if (item.images && item.images.length > 1) {
                cardsHtml += '<div class="card-slider">';
                $.each(item.images, function (i, imgSrc) {
                    var activeClass = (i === 0) ? 'active' : '';
                    cardsHtml += '<img src="' + imgSrc + '" class="card-slide ' + activeClass + '" alt="' + item.alt + '">';
                });
                cardsHtml += '</div>';
            } else {
                cardsHtml += '      <img src="' + (item.src || item.img || 'img/no_image.png') + '" class="card-image" alt="' + item.alt + '" style="object-position: center;">';
            }
            cardsHtml += '  </div>';

            cardsHtml += '  <div class="card-content">';
            // Optional icon support if present in data, otherwise default or omit
            if (item.icon) {
                cardsHtml += '      <div class="card-icon">' + item.icon + '</div>';
            } else {
                var emojis = ["🏢", "🥖", "🍳", "📜", "🤝", "💬"];
                // Use index to deterministically pick emoji if not provided
                var icon = item.iconChar || emojis[index % emojis.length] || "✨";
                cardsHtml += '      <div class="card-icon">' + icon + '</div>';
            }

            cardsHtml += '      <h3 class="card-title" style="color:' + titleColor + '; font-size:' + titleSize + ';">' + item.title + '</h3>';
            cardsHtml += '      <p class="card-text" style="color:' + descColor + '; font-size:' + descSize + ';">' + item.desc + '</p>';
            cardsHtml += '  </div>';
            cardsHtml += '</a>';
        });

        // [FIX] Force overwrite the HTML content of card-grid-3
        $('.card-grid-3').empty().html(cardsHtml);

        // Initialize Slider Animation
        if ($('.card-slider').length > 0) {
            if (window.cardSliderInterval) clearInterval(window.cardSliderInterval);
            window.cardSliderInterval = setInterval(function () {
                $('.card-slider').each(function () {
                    var $active = $(this).find('.card-slide.active');
                    var $next = $active.next('.card-slide');
                    if ($next.length === 0) {
                        $next = $(this).find('.card-slide').first();
                    }
                    $active.removeClass('active');
                    $next.addClass('active');
                });
            }, 3000);
        }

        // Re-bind intersection observer if needed for new elements
        if (window.IntersectionObserver) {
            var observer = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            $('.info-card[data-animate]').each(function () { observer.observe(this); });
        }
    }


    // 4-1. Render Hero Buttons
    if (siteContent.heroButtons) {
        if (siteContent.heroButtons.primary) {
            var pBtn = siteContent.heroButtons.primary;
            $('#hero-btn-primary').text(pBtn.text).attr('href', pBtn.link);
        }
        if (siteContent.heroButtons.secondary) {
            var sBtn = siteContent.heroButtons.secondary;
            $('#hero-btn-secondary').text(sBtn.text).attr('href', sBtn.link);
        }
    }

    // 4-1-1. Render Hero Phone
    console.log("Debug: Checking Hero Phone Logic");
    console.log("Debug: siteContent.heroPhone:", siteContent.heroPhone);
    console.log("Debug: #hero-phone-container length:", $('#hero-phone-container').length);

    if (siteContent.heroPhone && $('#hero-phone-container').length) {
        if (siteContent.heroPhone.visible) {
            var phoneData = siteContent.heroPhone;
            var iconHtml = phoneData.icon ? '<span style="margin-right:15px; font-size: 1.2em;">' + phoneData.icon + '</span>' : '';
            // Use a clearer phone image if icon is generic, or allow text icon
            if (phoneData.icon && (phoneData.icon.indexOf('/') > -1 || phoneData.icon.indexOf('.') > -1)) {
                iconHtml = '<img src="' + phoneData.icon + '" style="height: ' + phoneData.fontSize + '; vertical-align: middle; margin-right: 15px;">';
            }

            var phoneHtml = '<div style="display:inline-flex; align-items:center; justify-content:center; padding: 15px 30px; border: 2px solid ' + (phoneData.borderColor || '#ffa200') + '; border-radius: 50px; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px); transition: all 0.3s ease;">' +
                iconHtml +
                '<a href="tel:' + phoneData.number + '" style="color:' + (phoneData.color || '#fff') + '; font-size:' + phoneData.fontSize + '; font-weight:bold; text-decoration:none; letter-spacing:1px;">' + phoneData.number + '</a>' +
                '</div>';

            $('#hero-phone-container').html(phoneHtml).show();
        } else {
            $('#hero-phone-container').hide();
        }
    }

    // 4-2. Render Section Headers
    if (siteContent.sectionHeaders) {
        if (siteContent.sectionHeaders.middle) {
            $('#section2-title').text(siteContent.sectionHeaders.middle.title);
            $('#section2-desc').text(siteContent.sectionHeaders.middle.subtitle);
        }
        if (siteContent.sectionHeaders.bottom) {
            $('#section3-title').text(siteContent.sectionHeaders.bottom.title);
            $('#section3-desc').text(siteContent.sectionHeaders.bottom.subtitle);
        }
    }

    // 4-3. Header Auth Links Visiblity (Login/Join)
    if (siteContent.headerConfig && siteContent.headerConfig.showAuthLinks === false) {
        // Hide Login and Join links
        // We look for links containing 'login.html' or 'join.html' in the GNB
        $('a[href*="login.html"], a[href*="join.html"]').each(function () {
            $(this).closest('li').hide();
        });
    } else {
        // Show them (in case they were hidden by CSS or previous state)
        $('a[href*="login.html"], a[href*="join.html"]').each(function () {
            $(this).closest('li').show();
        });
    }

    // 4-3-B. Admin Login Indicator
    if (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) {
        var $gnbUl = $('#farmBoxGnb > ul');
        if ($gnbUl.length) {
            // Check if already added
            if ($gnbUl.find('.admin-indicator-li').length === 0) {
                // Add CSS for animation
                if ($('#admin-indicator-style').length === 0) {
                    $('head').append('<style id="admin-indicator-style">@keyframes spin-admin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .admin-icon { display: inline-block; animation: spin-admin 4s linear infinite; font-size: 1.2em; cursor: help; }</style>');
                }
                // Append Icon
                $gnbUl.append('<li class="admin-indicator-li" style="margin-left: 10px;"><span class="admin-icon" title="관리자 로그인 상태">⚙️</span></li>');
            }
        }
    }

    // 4-4. Render Footer Info
    if (siteContent.footerInfo) {
        $('#footer-address').text(siteContent.footerInfo.address);
        $('#footer-tel').text(siteContent.footerInfo.tel).attr('href', 'tel:' + siteContent.footerInfo.tel);
        $('#footer-fax').text(siteContent.footerInfo.fax); // Enabled
        $('#footer-ceo').text(siteContent.footerInfo.ceo);
        $('#footer-biznum').text(siteContent.footerInfo.bizNum);
        $('#footer-email').text(siteContent.footerInfo.email); // Added
        var copyHtml = siteContent.footerInfo.copyright;
        // Append Admin Link
        copyHtml += ' | <a href="admin.html" target="_blank" style="color: #555; text-decoration: none; margin-left: 10px; font-size: 0.9em;">[관리자]</a>';
        $('#footer-copyright').html(copyHtml);
    }

    // 5. Render Side Banners
    if ($('#side-banner').length && siteContent.sideBanners) {
        var sideBannersHtml = siteContent.sideBanners.map(function (banner) {
            var bannerImg = '<img src="' + banner.src + '" alt="' + (banner.alt || '') + '" style="display:block; width:100%;">';
            var bannerInner = banner.link ? '<a href="' + banner.link + '" target="_self">' + bannerImg + '</a>' : bannerImg;

            return '<div style="background-color:' + (banner.bgColor || 'transparent') + '; margin-bottom:5px; border-radius:10px; overflow:hidden;">' +
                bannerInner +
                '</div>';
        }).join('');
        $('#side-banner').html(sideBannersHtml);
    }

    // 6. Render Intro Text
    if (siteContent.introText) {
        if ($('#intro-title').length) {
            $('#intro-title p').text(siteContent.introText.title);
        }
        if ($('#intro-body').length && siteContent.introText.lines) {
            var html = '<p style="text-align: center;">&nbsp;</p>';
            $.each(siteContent.introText.lines, function (i, line) {
                // Apply styling here since data is now plain text
                html += '<div style="text-align: center; color: #555; font-size: 22px; font-weight: 500; margin-bottom: 15px; line-height: 1.6; word-break: keep-all;">' + line + '</div>';
            });
            $('#intro-body').html(html);
        }
        if ($('#intro-img').length && siteContent.introText.bottomImage) {
            $('#intro-img').html('<img src="' + siteContent.introText.bottomImage + '" alt="Intro Image">');
        }
    }

    // 7. Render Floating Quick Menu
    if ($('#quick-menu-container').length && siteContent.floatMenu && siteContent.floatMenu.items && siteContent.floatMenu.items.length > 0) {
        var menuHtml = '<div class="quick-menu-container">';
        if (siteContent.floatMenu.title) {
            menuHtml += '<div class="quick-menu-header">' + siteContent.floatMenu.title + '</div>';
        }
        menuHtml += '<ul class="quick-menu-list">';
        $.each(siteContent.floatMenu.items, function (i, item) {
            menuHtml += '<li class="quick-menu-item">';
            menuHtml += '<a href="' + item.link + '" target="' + item.target + '" class="quick-menu-link">';
            if (item.icon) {
                menuHtml += '<img src="' + item.icon + '" class="quick-menu-icon" alt="' + item.text + '">';
            }
            menuHtml += '<span>' + item.text + '</span>';
            menuHtml += '</a>';
            menuHtml += '</li>';
        });
        menuHtml += '</ul>';
        menuHtml += '</div>';

        $('#quick-menu-container').html(menuHtml);
    } else {
        $('#quick-menu-container').hide(); // Ensure it is hidden if no items
    }

    // 8. Render Boards (Modern Homepage)
    if (window.BoardManager) {
        function renderLatestBoard(boardCode, listId, count) {
            console.log("renderLatestBoard called for:", boardCode);
            // [FIX] Handle Promise returned by getPosts with Legacy Fallback
            BoardManager.getPosts(boardCode).then(function (posts) {
                console.log("getPosts(" + boardCode + ") result count:", posts ? posts.length : 0);

                // If found posts, return them
                if (posts && posts.length > 0) {
                    return posts;
                }

                // Fallback Logic
                var legacyCode = null;
                if (boardCode === 'sub0601') legacyCode = 'sys_notice';
                if (boardCode === 'sub0501') legacyCode = 'jobs';

                if (legacyCode) {
                    return BoardManager.getPosts(legacyCode).then(function (legacyPosts) {
                        if (legacyPosts && legacyPosts.length > 0) return legacyPosts;

                        // Final Fallback: Static Content
                        if (typeof siteContent !== 'undefined' && siteContent.boards && siteContent.boards[boardCode]) {
                            console.log("Using static content for", boardCode);
                            return siteContent.boards[boardCode];
                        }
                        return [];
                    });
                }

                // If no legacy code, check static content immediately
                if (typeof siteContent !== 'undefined' && siteContent.boards && siteContent.boards[boardCode]) {
                    console.log("Using static content (direct) for", boardCode);
                    return siteContent.boards[boardCode];
                }

                console.warn("No data found for", boardCode);
                return [];
            }).then(function (posts) {
                var $list = $(listId);

                if ($list.length === 0) {
                    console.error("List container not found:", listId);
                    return;
                }

                $list.empty();

                if (!posts || posts.length === 0) {
                    $list.html('<li class="no-data" style="color:#777; text-align:center; padding:50px 0; font-size:16px;">등록된 게시글이 없습니다.</li>');
                    return;
                }

                // Sort by date desc (if not already)
                posts.sort(function (a, b) {
                    var dateA = new Date(a.date);
                    var dateB = new Date(b.date);
                    // Check invalid dates
                    if (isNaN(dateA.getTime())) dateA = new Date(0);
                    if (isNaN(dateB.getTime())) dateB = new Date(0);
                    return dateB - dateA;
                });

                // Take top N
                var topPosts = posts.slice(0, count);

                topPosts.forEach(function (post) {
                    var subject = post.subject || '제목 없음';
                    var date = post.date || '';
                    var author = post.authorName || 'Admin';

                    // [FIX] Use real file link if available (from Python Sync)
                    var pageFile = 'page/' + boardCode + '.html';
                    // Use 'bbs/' for sub05 and sub06 series
                    if (boardCode.indexOf('sub05') === 0 || boardCode.indexOf('sub06') === 0) {
                        pageFile = 'bbs/' + boardCode + '.html';
                    }
                    var link = pageFile + '?mode=view&idx=' + post.idx;

                    if (post.linkFile) {
                        // If we have a physical file (e.g. 20260115.html), link to valid path.
                        // If we are on Home (index.html), we need 'bbs/sub0601/' + filename? 
                        // Or if we are in 'page/', we need '../bbs/sub0601/' + filename?
                        // Let's use absolute path relative to project root if possible, or context aware.
                        // Actually, the Python script puts them in 'bbs/sub0601/'.
                        // renderLatestBoard is usually on Index or Main.
                        // Path from root: bbs/sub0601/filename
                        link = 'bbs/' + boardCode + '/' + post.linkFile;
                    }

                    // [FIX] Live Site Exact Replica HTML - Modern Version WITH PATH FIX
                    var path = window.location.pathname;
                    var linkPrefix = "";
                    if (path.indexOf('/page/') > -1 || path.indexOf('/bbs/') > -1) {
                        linkPrefix = "../";
                    }

                    // We use the Python generated linkFile if available, otherwise default to board list
                    var link = linkPrefix + 'bbs/' + boardCode + '.html';

                    // Special case for non-bbs boards (if any) or different folder structure? 
                    // Current assumption: All boards are in bbs/

                    if (post.linkFile) {
                        link = linkPrefix + 'bbs/' + boardCode + '/' + post.linkFile;
                    }

                    var html = '<li style="border-bottom: 1px solid #eee; padding: 12px 0;">' +
                        '<a href="' + link + '" style="display: block; text-decoration: none; color: inherit; transition: opacity 0.2s;" onclick="window.location.href=this.href; return false;">' +
                        '<div style="font-weight: 600; font-size: 15px; color: #333; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + subject + '</div>' +
                        '<div style="font-size: 13px; color: #888;">' + date.substring(0, 10) + '</div>' +
                        '</a>' +
                        '</li>';
                    $list.append(html);
                });
            }).catch(function (err) {
                console.error("Failed to load latest posts for " + boardCode, err);
                $(listId).html('<li class="error" style="color:red; text-align:center;">Load Error</li>');
            });
        }

        // 9. Render Full Board Page (Table Style)
        window.renderBoardPage = function (boardCode, containerId) {
            // [FIX] Strict Guard: Do not render legacy board for BoardUI enabled pages
            if (boardCode === 'sub0502' || boardCode === 'sub0602') {
                console.warn("Skipping legacy renderBoardPage for " + boardCode + ". BoardUI should handle this.");
                return;
            }
            // [FIX] Handle Promise returned by getPosts
            BoardManager.getPosts(boardCode).then(function (posts) {
                var $container = $(containerId);

                if ($container.length === 0) return;

                $container.empty();

                // [FEATURE] Optional: Render Custom HTML Header if exists (Hybrid Mode)
                var customContent = PageManager.getPage(boardCode);
                if (customContent) {
                    $container.append('<div class="board-custom-header" style="margin-bottom:30px;">' + customContent + '</div>');
                }

                // 9. Render Board (List or Gallery)
                if (boardConfig && boardConfig.viewType === 'gallery') {
                    // --- GALLERY VIEW (MALL) ---
                    var galleryHtml = `
                    <div class="board-search-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:15px;">
                        <div class="total-count">Total <span>${posts.length}</span> Items</div>
                        <div class="search-box" style="display:flex; gap:5px;">
                             <input type="text" placeholder="Search items..." style="padding:8px 12px; border:1px solid #ccc; border-radius:4px;">
                             <button style="background:#333; color:#fff; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">검색</button>
                        </div>
                    </div>
                    <div class="gallery-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:20px;">`;

                    if (posts.length === 0) {
                        galleryHtml += `
                            <div style="grid-column: 1/-1; text-align:center; padding:100px 0; color:#777;">
                                <img src="../img/icon_no_data.png" style="max-width:50px; opacity:0.5; margin-bottom:10px;"><br>
                                등록된 상품/게시물이 없습니다.
                            </div>`;
                    } else {
                        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                        posts.forEach(function (post) {
                            // Extract first image from content for thumbnail
                            var thumb = '../img/no_image.png'; // fallback
                            var imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
                            if (imgMatch) thumb = imgMatch[1];

                            galleryHtml += `
                            <div class="gallery-item" style="border:1px solid #eee; border-radius:8px; overflow:hidden; transition:transform 0.2s;">
                                <a href="../board_view.html?idx=${post.idx}&board_code=${boardCode}" style="text-decoration:none; color:inherit; display:block;">
                                    <div class="gallery-thumb" style="height:180px; background:#f9f9f9; overflow:hidden;">
                                        <img src="${thumb}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                                    </div>
                                    <div class="gallery-info" style="padding:15px;">
                                        <h3 style="margin:0 0 10px 0; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${post.subject}</h3>
                                        <div style="display:flex; justify-content:space-between; color:#888; font-size:12px;">
                                            <span>${post.authorName}</span>
                                            <span>${post.date}</span>
                                        </div>
                                    </div>
                                </a>
                            </div>`;
                        });
                    }
                    galleryHtml += `</div>`;

                    galleryHtml += `
                    <div class="board-footer" style="margin-top:30px; text-align:right;">
                        <a href="../board_write.html?board_code=${boardCode}" class="btn-write" style="display:inline-block; padding:10px 25px; background:#333; color:#fff; text-decoration:none; border-radius:4px;">상품/글 등록</a>
                    </div>`;

                    $container.append(galleryHtml);

                } else {
                    // --- LIST VIEW (TABLE) ---
                    var boardHtml = `
                    <div class="board-search-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #ddd; padding-bottom:15px;">
                        <div class="total-count">Total <span>${posts.length}</span>건</div>
                        <div class="search-box" style="display:flex; gap:5px;">
                             <input type="text" placeholder="검색어를 입력하세요" style="padding:5px 10px; border:1px solid #ccc;">
                             <button style="background:#333; color:#fff; border:none; padding:5px 15px; cursor:pointer;">검색</button>
                        </div>
                    </div>
                    <table class="board-table" style="width:100%; border-top:2px solid #333; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f9f9f9; border-bottom:1px solid #ddd;">
                                <th style="padding:15px; text-align:center; width:60px;">번호</th>
                                <th style="padding:15px; text-align:center;">제목</th>
                                <th style="padding:15px; text-align:center; width:100px;">작성자</th>
                                <th style="padding:15px; text-align:center; width:100px;">등록일</th>
                                <th style="padding:15px; text-align:center; width:80px;">조회</th>
                            </tr>
                        </thead>
                        <tbody>`;

                    if (posts.length === 0) {
                        boardHtml += `
                            <tr>
                                <td colspan="5" style="padding: 100px 0; text-align: center; color: #777; border-bottom:1px solid #ddd;">
                                    <img src="../img/icon_no_data.png" style="max-width:50px; opacity:0.5; margin-bottom:10px;"><br>
                                    등록된 게시글이 없습니다.
                                </td>
                            </tr>`;
                    } else {
                        // Sort by date desc
                        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

                        posts.forEach(function (post, index) {
                            boardHtml += `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:15px; text-align:center;">${posts.length - index}</td>
                                <td style="padding:15px;">
                                    <a href="../board_view.html?idx=${post.idx}&board_code=${boardCode}" style="color:#333; text-decoration:none;">${post.subject}</a>
                                </td>
                                <td style="padding:15px; text-align:center;">${post.authorName || 'Guest'}</td>
                                <td style="padding:15px; text-align:center;">${post.date}</td>
                                <td style="padding:15px; text-align:center;">${post.hit || 0}</td>
                            </tr>`;
                        });
                    }

                    boardHtml += `
                        </tbody>
                    </table>
                    
                    <div class="board-footer" style="margin-top:20px; text-align:right;">
                        <a href="../board_write.html?board_code=${boardCode}" class="btn-write" style="display:inline-block; padding:10px 20px; background:#333; color:#fff; text-decoration:none;">글쓰기</a>
                    </div>
                    `;

                    $container.append(boardHtml);
                } // End List View
            });
        }

        // Init Modern Board Lists
        $(document).ready(function () {
            // [FIX] Wait for DB to be seeded
            BoardManager.ready().then(function () {
                renderLatestBoard('sub0601', '#latest-notice-list', 5); // Notice
                renderLatestBoard('sub0602', '#latest-qna-list', 5);    // Q&A
                renderLatestBoard('sub0501', '#latest-jobs-list', 5);   // Jobs
            });
        });
    }


    // 9. Render Sub-page Content
    function renderSubPage() {
        // Load PageManager dynamically if not valid
        if (typeof PageManager === 'undefined') {
            var pmPath = '../js/page_manager.js';
            // If running from root (index.html, admin.html), use js/page_manager.js
            var path = window.location.pathname;
            // robust check for root or top-level files
            var isRoot = path.endsWith('/') || path.indexOf('/', 1) === -1 || path.split('/').length <= 2 || path.endsWith('/index.html') || path.endsWith('/admin.html') || path.endsWith('/main.html');

            // If we are strictly in the project root folder (not subfolder) or if the script tag is found with relative path
            if (isRoot || document.querySelector('script[src*="js/render_content.js"]')) {
                pmPath = 'js/page_manager.js';
            }

            $.getScript(pmPath, function () {
                console.log("PageManager loaded from " + pmPath);
                renderSubPage();
            });
            return;
        }

        // Helper: Detect Page ID from URL
        function detectPageId() {
            var path = window.location.pathname;
            var parts = path.split('/');
            var fileNameWithExt = parts[parts.length - 1];
            var fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')) || "index";

            // Handle page_view dynamic ID
            if (fileName === 'page_view') {
                var urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('id')) {
                    return urlParams.get('id');
                }
            }
            return fileName;
        }

        var fileName = detectPageId();
        var path = window.location.pathname;
        var parts = path.split('/');

        // Detect Category Prefix (sub01-sub06)
        var categoryPrefix = "";
        if (fileName.startsWith('sub')) {
            categoryPrefix = fileName.substring(0, 5);
        } else if (parts.length >= 3) {
            var parentDir = parts[parts.length - 2];
            if (parentDir.startsWith('sub')) {
                categoryPrefix = parentDir.substring(0, 5);
            }
        }
        if (!categoryPrefix) {
            var match = path.match(/sub0[1-6]/);
            if (match) categoryPrefix = match[0];
        }

        var customContent = PageManager.getPage(fileName);
        var pageData = (siteContent.subPages && siteContent.subPages[fileName]) || {};
        var globalData = (siteContent.categoryContent && siteContent.categoryContent[categoryPrefix]) ? siteContent.categoryContent[categoryPrefix] : null;

        var imgPrefix = "../";
        if (parts.length > 3) imgPrefix = "../../";
        if (path === "/" || fileName === "index") imgPrefix = "";

        // DYNAMIC TITLE SYNC
        if (pageData.title) {
            // Update Title in Hero/Sub-header
            $('.sub_title_381227_ h1').text(pageData.title);
            // Update Browser Title
            document.title = pageData.title + " - 세종요리제과기술학원";
        }

        // Container Selector (Heuristic for legacy pages)
        var $htmlContainer = $('.page-content-area, .html_381269_, .html_381280_, .html_383728_, .textarea_381283_, .textarea_381382_, .layout_381170_, .map_381171_, .textarea_381285_, .html_381250_');

        // If not found, try generic layout container if specific class absent
        if (!$htmlContainer.length) {
            var $layoutC2 = $('.layout_381226_ .container_2, .container_2');
            if ($layoutC2.length) {
                // $htmlContainer = $layoutC2.children().last(); // Risky?
            }
        }

        // Apply Custom Content (Override everything else)
        if (customContent && $htmlContainer.length) {
            $htmlContainer.first().empty().html(customContent);
        } else {
            // 3. Render HTML Content & Items & Banners
            // Priority: Page HTML > Global HTML
            var fullHtml = (pageData.htmlContent) || (globalData ? globalData.htmlContent : "");

            // Add per-page items grid
            if (pageData.items && pageData.items.length > 0) {
                var itemsHtml = '<div class="sub-page-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; margin-top:30px;">';
                $.each(pageData.items, function (i, item) {
                    // Detect Item Type Logic
                    if (item.htmlContent) {
                        // --- Table / Special HTML Item ---
                        itemsHtml += '<div class="sub-grid-item" style="grid-column: 1 / -1; margin-bottom: 20px;">';
                        if (item.title) itemsHtml += '<h4 style="margin:0 0 10px 0; font-size:18px; color:#333;">' + item.title + '</h4>';
                        itemsHtml += item.htmlContent;
                        itemsHtml += '</div>';
                    } else {
                        // --- Standard Card / Link Item ---
                        itemsHtml += '<div class="sub-grid-card animate-fade-in-up" style="animation-delay: ' + (i * 0.1) + 's; border:1px solid #eee; border-radius:8px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">';

                        if (item.img) {
                            // Fix Image Path
                            var imgSrc = item.img;
                            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
                                imgSrc = imgPrefix + imgSrc;
                            }
                            itemsHtml += '<div class="card-img-wrap" style="height:200px; overflow:hidden;"><img src="' + imgSrc + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=\'' + imgPrefix + 'img/no_image.png\'"></div>';
                        }

                        itemsHtml += '<div class="card-body" style="padding:20px; flex:1; display:flex; flex-direction:column;">';
                        if (item.title) itemsHtml += '<h4 style="margin:0 0 10px 0; font-size:18px; color:#333;">' + item.title + '</h4>';
                        if (item.desc) itemsHtml += '<p style="margin:0; font-size:14px; color:#666; line-height:1.6; flex:1;">' + (item.desc || '').replace(/\n/g, '<br>') + '</p>';

                        if (item.link) {
                            var linkUrl = item.link;
                            // Fix Link Path for Internal Links
                            if (linkUrl && !linkUrl.startsWith('http') && !linkUrl.startsWith('#') && !linkUrl.startsWith('javascript:') && !linkUrl.startsWith('tel:')) {
                                linkUrl = imgPrefix + linkUrl;
                            }
                            var linkText = item.linkText || "자세히 보기 &rarr;";

                            itemsHtml += '<a href="' + linkUrl + '" style="display:inline-block; margin-top:15px; font-size:13px; color:#f5a623; text-decoration:none; font-weight:bold;">' + linkText + '</a>';
                        }
                        itemsHtml += '</div></div>';
                    }
                });
                itemsHtml += '</div>';
                fullHtml += itemsHtml;
            }

            // Add category-wide banners
            if (siteContent.categoryBanners && siteContent.categoryBanners[categoryPrefix] && siteContent.categoryBanners[categoryPrefix].length > 0) {
                var catHtml = '<div class="category-banner-title" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #f7bc5a; font-size: 20px; font-weight: bold; color: #333; text-align: center;">추천 과정 및 정보</div>';
                catHtml += '<div class="cat-banners-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top: 20px; margin-bottom: 40px;">';
                $.each(siteContent.categoryBanners[categoryPrefix], function (i, item) {
                    var bannerContent = '<div style="background: #fff; border: 1px solid #f7bc5a; border-radius: 12px; overflow: hidden; position: relative; transition: transform 0.3s; cursor: pointer;">';
                    bannerContent += '<img src="' + imgPrefix + item.img + '" style="width: 100%; height: 180px; object-fit: cover;" onerror="this.src=\'' + imgPrefix + 'img/no_image.png\'">';
                    bannerContent += '<div style="padding: 20px; text-align: center;"><h4 style="margin: 0 0 10px 0; color: #d35400; font-size: 18px;">' + (item.title || '') + '</h4>';
                    if (item.desc) bannerContent += '<p style="color: #444; font-size: 14px; margin: 0;">' + item.desc + '</p>';
                    bannerContent += '</div></div>';
                    catHtml += item.link ? '<a href="' + item.link + '" style="text-decoration: none; display: block;">' + bannerContent + '</a>' : bannerContent;
                });
                catHtml += '</div>';
                fullHtml += catHtml;
            }

            // Apply Content with Static Hiding Logic
            // If we have dynamic content, we must hide the original static content containers
            if ((fullHtml || (pageData.items && pageData.items.length > 0)) && $htmlContainer.length) {
                // If the target container is one of the specific hardcoded layout divs, replace it.
                // However, sub0103 has multiple containers (map, lists). We might need to hide siblings or targeting specific "body" part.

                // Strategy: Find the main content area wrapper.
                // In sub0103, it's .layout_381226_ > .container_2
                var $mainWrapper = $('.layout_381226_ .container_2');

                // If we found a wrapper and we have dynamic content, let's inject a new dynamic container and hide the rest (except title)
                if ($mainWrapper.length) {
                    if ($('#dynamic-subpage-content').length === 0) {
                        $mainWrapper.append('<div id="dynamic-subpage-content" class="dynamic-content-area"></div>');
                    }

                    // Hide siblings that are NOT the title or the dynamic content
                    // The title is .sub_title_381227_ (inside a div)
                    // We want to hide hardcoded 'layout_381170_' (map), 'layout_381173_' (info), 'empty_line_', 'solid_line_'
                    $mainWrapper.children().each(function () {
                        var $this = $(this);
                        // Identify Title Section (keep it)
                        if ($this.find('.sub_title_381227_').length > 0 || $this.hasClass('sub_title_381227_')) return;
                        // Identify Dynamic Content (keep it)
                        if ($this.attr('id') === 'dynamic-subpage-content') return;

                        // Hide everything else (Map, Text Lists, Spacers)
                        $this.hide();
                    });

                    // Inject Content
                    $('#dynamic-subpage-content').html(fullHtml);
                } else if ($htmlContainer.length) {
                    // Fallback for simple pages: just replace the specific container
                    $htmlContainer.first().html(fullHtml);
                }
            }
        }

        // 4. Render Board (Same as before)
        // Determine config: Page-specific > Category Main (e.g. sub02)
        var boardConfig = (pageData && pageData.boardConfig) ? pageData.boardConfig : null;
        if ((!boardConfig || !boardConfig.enable) && siteContent.subPages && siteContent.subPages[categoryPrefix] && siteContent.subPages[categoryPrefix].boardConfig) {
            boardConfig = siteContent.subPages[categoryPrefix].boardConfig;
        }

        if (boardConfig && boardConfig.enable) {
            // ... existing board rendering ...
            var boardTitle = boardConfig.title || "게시판";
            var postCount = boardConfig.count || 5;

            var boardHtml = '<div class="category-board-section" style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #ddd;">';
            boardHtml += '<h3 style="font-size: 20px; font-weight: 700; color: #333; margin-bottom: 20px;">' + boardTitle + '</h3>';
            boardHtml += '<ul class="category-board-list" id="cat-board-list-' + fileName + '" style="list-style: none; padding: 0;"></ul>';
            boardHtml += '</div>';

            // Append to content container or create wrapper if needed
            // Use the dynamic container if we created it
            var $dest = $('#dynamic-subpage-content');
            if (!$dest.length) {
                if ($htmlContainer.length) $dest = $htmlContainer.first();
                else if ($('.layout_381226_ .container_2').length) $dest = $('.layout_381226_ .container_2');
            }

            if ($dest.length) {
                $dest.append(boardHtml);
            }

            setTimeout(function () {
                if (window.BoardManager) {
                    var boardCode = (boardConfig && boardConfig.code) ? boardConfig.code : fileName;
                    renderLatestBoard(boardCode, '#cat-board-list-' + fileName, postCount);
                    // Add 'Write' button
                    var $boardSection = $('#cat-board-list-' + fileName).parent();
                    if (!$boardSection.find('.btn-write-board').length) {
                        var writeBtn = '<div style="text-align: right; margin-top: 10px;">';
                        writeBtn += '<a href="../board_write.html?board_code=' + boardCode + '" class="btn-write-board" style="display: inline-block; padding: 5px 15px; background: #333; color: #fff; text-decoration: none; border-radius: 4px; font-size: 13px;">글쓰기</a>';
                        writeBtn += '</div>';
                        $boardSection.append(writeBtn);
                    }
                }
            }, 100);
        }

        // ADMIN EDIT BUTTON
        var user = (typeof AuthManager !== 'undefined') ? AuthManager.getCurrentUser() : null;

        // [FIX] Always show button if admin, regardless of initial container detection.
        // This ensures the button appears on Index/Home page too.
        if (user && user.level >= 9) {
            // Check if button already exists
            if (!$('#btn-page-edit-floating').length) {
                var btnHtml = '<button id="btn-page-edit-floating" style="position:fixed; bottom:20px; right:20px; width:60px; height:60px; border-radius:50%; background:#f5a623; color:white; border:none; box-shadow:0 4px 10px rgba(0,0,0,0.3); font-size:24px; cursor:pointer; z-index:2147483647;" title="페이지 내용 수정">✏️</button>';
                $('body').append(btnHtml);

                $('#btn-page-edit-floating').click(function () {
                    // Lazy-resolve container on click
                    var $target = $htmlContainer;

                    // Fallback for Homepage (Index)
                    if ((!$target || !$target.length) && (fileName === "index" || fileName === "")) {
                        $target = $('.hero-section, .modern-container').first(); // Prefer Hero
                    }

                    // Generic Fallback
                    if (!$target || !$target.length) {
                        $target = $('div[class^="html_"], div[class^="textarea_"]');
                        if (!$target.length) $target = $('.layout_381226_ .container_2');
                        if (!$target.length) $target = $('.layout_381268_ .container_1');
                    }

                    if ($target && $target.length) {
                        var currentHtml = $target.first().html();
                        sessionStorage.setItem('temp_page_edit_content', currentHtml);
                        location.href = '../page_edit.html?id=' + fileName;
                    } else {
                        alert("수정할 수 있는 영역을 찾지 못했습니다.\n(No editable content found)");
                    }
                });
            }
        }
        // (Combined with ensureAuthAndRender at bottom)
    }

    // 10. Update Header Login State (AuthManager integration)
    function updateHeaderAuth() {
        if (typeof AuthManager === 'undefined') {
            // Wait for AuthManager to load or try to load it
            if (!$('script[src*="auth_manager.js"]').length) {
                // Determine base script path from this script location or default to js/
                $.getScript('js/auth_manager.js', function () {
                    updateHeaderAuth();
                }).fail(function () {
                    // Fallback check if script is already loading or path issue
                    // Just try accessing global AuthManager again after short delay
                    setTimeout(updateHeaderAuth, 500);
                });
                return;
            }
            return;
        }

        var user = AuthManager.getCurrentUser();
        var $gnb = $('#farmBoxGnb, .gnb_381032_, .gnb_381048_'); // Select GNB containers

        if (user && $gnb.length) {
            var $loginLink = $gnb.find('a[href*="login.html"]');
            if ($loginLink.length) {
                // Replace "Login" with "Logout" and add Welcome msg
                $loginLink.html('<strong>로그아웃</strong>');
                $loginLink.attr('href', 'javascript:AuthManager.logout()');

                // Prepend welcome message
                if (!$('.auth-welcome').length) {
                    var welcomeHtml = '<li class="auth-welcome" style="margin-right:10px; color:#555;"><strong>' + user.name + '</strong>님 환영합니다</li>';

                    if (user.level >= 9) {
                        welcomeHtml += '<li class="auth-admin-link" style="margin-right:10px;"><a href="admin.html" style="color:#d35400; font-weight:bold;">[관리자]</a></li>';
                        welcomeHtml += '<li class="auth-edit-link" style="margin-right:10px;"><a href="#" id="header-btn-page-edit" style="color:#2980b9; font-weight:bold;">[✏️페이지편집]</a></li>';

                        // Fix for sub-pages
                        var path = window.location.pathname;
                        if (path.indexOf('/page/') > -1 || path.indexOf('/bbs/') > -1) {
                            welcomeHtml = welcomeHtml.replace('href="admin.html"', 'href="../admin.html"');
                        }
                    }

                    $loginLink.parent().before(welcomeHtml);

                    // Attach click event for Header Edit Button
                    setTimeout(function () {
                        $('#header-btn-page-edit').click(function (e) {
                            e.preventDefault();
                            var path = window.location.pathname;
                            var parts = path.split('/');
                            var fileName = parts[parts.length - 1].replace('.html', '') || 'index';
                            if (path === '/' || path.endsWith('/')) fileName = 'index';

                            var $target = null;

                            // Homepage Detection
                            if (fileName === 'index') {
                                $target = $('.hero-section, .modern-container').first();
                            } else {
                                // Subpage Detection
                                $target = $('.layout_381226_ .container_2');
                                if (!$target.length) $target = $('.layout_381268_ .container_1');
                                if (!$target.length) $target = $('div[class^="html_"], div[class^="textarea_"]');
                            }

                            if ($target && $target.length) {
                                var currentHtml = $target.first().html();
                                sessionStorage.setItem('temp_page_edit_content', currentHtml);
                                var editUrl = 'page_edit.html?id=' + fileName;
                                if (path.indexOf('/page/') > -1 || path.indexOf('/bbs/') > -1) {
                                    editUrl = '../page_edit.html?id=' + fileName;
                                }
                                location.href = editUrl;
                            } else {
                                alert("수정할 수 있는 영역을 찾지 못했습니다.\n(No editable content found)");
                            }
                        });
                    }, 500);
                }
            }

            // Hide "Join" link if logged in
            var $joinLink = $gnb.find('a[href*="join.html"]');
            if ($joinLink.length) {
                $joinLink.parent().hide();
            }
        }
    }

    // --- Dynamic Loader for AuthManager ---
    function ensureAuthAndRender() {
        if (typeof AuthManager === 'undefined') {
            // Determine script path: if we are in /page/, we need ../js/
            // Simple heuristic: check if jquery is loaded from ../img_up or similar
            var scriptPath = 'js/auth_manager.js';
            if (window.location.pathname.indexOf('/page/') > -1 || window.location.pathname.indexOf('/bbs/') > -1) {
                scriptPath = '../js/auth_manager.js';
            }

            $.getScript(scriptPath, function () {
                console.log("AuthManager loaded dynamically.");
                renderSubPage();
                updateHeaderAuth();
            }).fail(function () {
                console.error("Failed to load AuthManager. Proceeding without auth.");
                renderSubPage(); // Render anyway, just without admin features
            });
        } else {
            renderSubPage();
            updateHeaderAuth();
        }
    }

    // Execute
    ensureAuthAndRender();

    // --- Dynamic Navigation ---
    if ($('.lnb_381204_').length) {
        renderNavigation();
    }

    $(window).on('resize', function () {
        if ($('.lnb_381204_').length) {
            renderNavigation();
        }
    });

    function renderNavigation() {
        var $lnb = $('.lnb_381204_');
        var $dep1Ul = $lnb.find('ul.dep1');

        // Check if navigation is already present (static HTML in index.html/main.html)
        var isStatic = $dep1Ul.children().length > 0;

        if (!isStatic) {
            var navData = siteContent.navigation;
            if (!navData) return;

            $dep1Ul.empty(); // Clear hardcoded content only if we are dynamically rendering

            navData.forEach(function (depth1, index) {
                var hasSub = depth1.subItems && depth1.subItems.length > 0;
                var liClass = (index === 0 ? 'first ' : '') + (index === navData.length - 1 ? 'last ' : '') + (hasSub ? 'has_sub' : '');

                var liHtml = '<li class="' + liClass + '" role="toggle">';
                // Force navigation on click using inline handler to override potential blocking scripts
                liHtml += '<a href="' + depth1.link + '" target="_self" onclick="window.location.href=this.href; return false;">' + depth1.title + '</a>';

                if (hasSub) {
                    liHtml += '<div class="dep2"><ul>';
                    depth1.subItems.forEach(function (depth2) {
                        liHtml += '<li><a href="' + depth2.link + '" target="_self" onclick="window.location.href=this.href; return false;">' + depth2.title + '</a></li>';
                    });
                    liHtml += '</ul></div>';
                }

                liHtml += '</li>';
                $dep1Ul.append(liHtml);
            });
        }

        // Re-attach Event Listeners (Mobile Toggle)
        // Desktop Logic
        if (Modernizr.mq('only screen and (max-width: 1023px)') == true) {
            $lnb.off();
            $lnb.find('.dep1 > li > a').off();
            $lnb.find('.dep2').removeAttr('style');
            $lnb.find('.dep2 > ul').removeAttr('style');
            $lnb.find('.dep2_bg').removeAttr('style');

            $lnb.find('.dep1 > li[role=toggle] > a').on('click tab', function (e) {
                // If it has a real link (not empty/null/#), navigate!
                var href = $(this).attr('href');
                if (href && href !== '#' && href.indexOf('javascript') === -1) {
                    window.location.href = href;
                    return false;
                }

                // Only toggle if it's not a navigation link
                $(this).parent().siblings().find('.dep2').slideUp(300, 'easeOutExpo');
                $(this).parent().siblings().removeClass('on');
                $(this).parent().find('.dep2').slideToggle(300, 'easeOutExpo');
                $(this).parent().toggleClass('on');
                return false;
            });
        } else {
            $lnb.find('.dep2').css({
                'display': 'block',
                'visibility': 'hidden'
            });

            setTimeout(function () {
                var $dep2_height = 0;
                var $dep2_bg_height = 0;

                $lnb.find('.dep1 > li').each(function () {
                    if ($dep2_height < $(this).find('.dep2 > ul').height()) {
                        $dep2_height = $(this).find('.dep2 > ul').height();
                    }
                    if ($dep2_bg_height < $(this).find('.dep2').outerHeight()) {
                        $dep2_bg_height = $(this).find('.dep2').outerHeight();
                    }
                });

                $lnb.find('.dep2 > ul').height($dep2_height);
                $lnb.find('.dep2_bg').height($dep2_bg_height);

                $lnb.find('.dep1 > li[role=toggle] > a').off();

                $lnb.find('.dep1 > li[role=toggle] > a').on('mouseenter', function () {
                    $lnb.find('.dep2_bg').stop(true, true).slideDown(300, 'easeOutExpo');
                    $lnb.find('.dep2').delay(100).fadeIn(200);
                });

                $lnb.find('.dep1 > li[role=toggle] > a').on('click', function () {
                    var href = $(this).attr('href');
                    if (href && href !== '#' && href.indexOf('javascript') === -1) {
                        window.location.href = href;
                    }
                });

                $lnb.on('mouseleave', function () {
                    $lnb.find('.dep2').stop(true, true).fadeOut(200);
                    $lnb.find('.dep2_bg').delay(100).slideUp(200);
                });
            }, 0);

            setTimeout(function () {
                $lnb.find('.dep2').css({
                    'display': 'none',
                    'visibility': 'visible'
                });
            }, 100);
        }
    }

    // Expose to window
    window.renderNavigation = renderNavigation;

});