function initRegister(afterRegisterHref) {
    log("init labels")
    var form = $("#registerForm");
    var lastTabIndex = 0;
    jQuery("#registerForm label.collapse").each(function(i, n) {
        var label = jQuery(n);
        var title = label.text();
        var input = form.find("#" + label.attr("for"));
        input.attr("title", title);
        input.attr("tabindex", i + 1);
        log("set tab index", input, i + 1);
        label.text(i + 1);
        lastTabIndex = i + 2;
    });
    form.find("button[type=submit]").attr("tabindex", lastTabIndex);
    initRegisterForms(afterRegisterHref);
}


function initRegisterForms(afterRegisterHref, callback) {
    log("initRegisterForms - bootstrap320", jQuery("#registerForm"));
    $("#registerForm").forms({
        validationFailedMessage: "Please enter your details below.",
        callback: function(resp, form) {
            if (resp.messages && resp.messages[0] == "pending") {
                showPendingMessage();
            } else {
                log("created account ok, logging in...", resp, form);
                var userName = form.find("input[name=email]").val();
                userName = userName.toLowerCase();
                var password = form.find("input[name=password]").val();
                doLogin(userName, password, {
                    afterLoginUrl: afterRegisterHref,
                    urlSuffix: "/.dologin",
                    loginCallback: callback
                }, form);
            }
        }
    });

    $.getScript("/static/typeahead/0.10.5/typeahead.bundle.js", function() {
        $.getScript("/static/handlebars/1.2.0/handlebars.js", function() {
            try {
                var searchUrl = $("#registerForm").attr("action");

                var orgs = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: searchUrl + '?jsonQuery=%QUERY&th',
                        replace: function() {
                            return $("#registerForm").attr("action") + '?jsonQuery=' + encodeURIComponent($("#orgName").val()) + '&th';
                        }
                    }
                });

                orgs.initialize();

                $("#orgName").typeahead(null, {
                    minLength: 1,
                    displayKey: "title",
                    name: "orgs",
                    source: orgs.ttAdapter(),
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                            'No organisations match your search',
                            '</div>'
                        ].join('\n'),
                        suggestion: Handlebars.compile('<p><strong>{{title}}</strong> {{address}}, {{postcode}}</p>')
                    }
                });
                $('.tt-hint').removeClass('required');
                $("#orgName").on("typeahead:selected", function(e, datum) {
                    log("Selected", e, datum);
                    $("#orgId").val(datum.orgId);
                });
                flog("init typeahead3");
            } catch (e) {
                flog("exception: " + e);
            }
        });
    });


    function showPendingMessage() {
        showModal($("#pending"));
    }
}
