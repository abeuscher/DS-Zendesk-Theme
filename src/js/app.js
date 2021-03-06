var Cookies = require("js-cookie");
var parseHTML = require("./utils/parse-html.js");
require("./statuspage/index.js");




// Custom delimiter for Vue templates
Vue.options.delimiters = ['{[{', '}]}'];

var sidebar = new Vue({
  data: {
    isArticle: false,
    categories: [],
    sections: [],
    articles: [],
    currentArticle: null,
    activeSection: null,
    nav: {
      prev: null,
      next: null,
    }
  },

  created: function() {
    $("main").addClass("main-sidebar");
    this.isArticle = window.location.pathname.indexOf("/articles/") > -1;
    this.fetchData();
  },

  methods: {

    isOpen: function(id) {
      return id == this.activeSection ? 'open' : '';
    },

    isCurrent: function(id) {
      var currentId = this._getPageId(window.location.href);
      return id == currentId ? 'current' : '';
    },

    fetchData: function(url) {
      var url = url || "/api/v2/help_center/" + this._getLocale() + "/articles.json?per_page=100&include=sections,categories";

      $.get(url, function(data) {
        if (data.count) {
          this.categories = _.sortBy(_.uniq(this.categories.concat(data.categories), "id"), "position");
          this.sections = _.sortBy(_.uniq(this.sections.concat(data.sections), "id"), "position");
          this.articles = _.sortBy(_.uniq(this.articles.concat(data.articles), "id"), "position");

          this.mapArticlesToSections(this.articles, this.sections);
          this.mapSectionsToCategories(this.sections, this.categories);

          // Set current article and nav links if on article page
          if (this.isArticle) {
            this.currentArticle = this.getCurrentArticle(this.articles);
            if (this.currentArticle) {
              this.activeSection = this.currentArticle.section_id;
              this.setNavLinks(this.sections, this.currentArticle);
            }
          }

          if (data.next_page) {
            this.fetchData(data.next_page + "&per_page=100");
          }
        }
      }.bind(this));
    },

    mapArticlesToSections: function(articles, sections) {
      var articleGroups = _.groupBy(articles, "section_id");

      _.each(sections, function(section) {
        section.articles = articleGroups[section.id];
      }, this);
    },

    mapSectionsToCategories: function(sections, categories) {
      var sectionGroups = _.groupBy(sections, "category_id");

      _.each(categories, function(category) {
        category.sections = sectionGroups[category.id];
      }, this);
    },

    setActiveSection: function(sectionId) {
      if (sectionId === this.activeSection) {
        this.activeSection = null;
      } else {
        this.activeSection = sectionId;
      }
    },

    getCurrentArticle: function(articles) {
      var currArticleId = this._getPageId(window.location.href),
        currArticle = _.find(articles, {
          id: currArticleId
        });

      return currArticle;
    },

    setNavLinks: function(sections, currArticle) {
      let currSection = _.find(sections, {
          id: currArticle.section_id
        }),
        currArticleIndex = _.findIndex(currSection.articles, {
          id: currArticle.id
        }),
        prevArticle,
        nextArticle;

      if (currArticleIndex !== 'undefined') {
        this.nav.prev = currArticleIndex > 0 ? currSection.articles[currArticleIndex - 1] : null;
        this.nav.next = currArticleIndex < currSection.articles.length ? currSection.articles[currArticleIndex + 1] : null;
      }

    },

    _getLocale: function() {
      var links = window.location.href.split("/"),
        hcIndex = links.indexOf("hc"),
        links2 = links[hcIndex + 1].split("?"),
        locale = links2[0];

      return locale;
    },

    _getPageId: function(url) {
      var links = url.split("/"),
        page = links[links.length - 1],
        result = page.split("-")[0];

      return parseInt(result, 10) || null;
    },
  }
});




$(document).ready(function() {
  if (checkCookies()) {
    triggerGDPR();
    //Push data to GA

  }
  /*
  var helpBtn = document.querySelectorAll("#user-nav .submit-a-request")[0];
  if (HelpCenter.user && HelpCenter.user.tags) {
    if (helpBtn && HelpCenter.user.organizations[0].name=="Dynamic Signal" && HelpCenter.user.tags.includes("dysi_employee")) {
      helpBtn.innerHTML = "How can we help?";
    }
    else {
      console.log(HelpCenter.user)
    }
  }
 */
  checkStatus();
  if (document.getElementById("sidebar")) {
    var theDiv = document.getElementsByTagName("main")[0];
    sidebar.$mount(theDiv);
     

  }  
   if (document.getElementById("sidebar")) {
//Enable Release Notes Link
/*
    var followLink = document.getElementById("follow-rn");
    if (HelpCenter.user.role!="anonymous") {
      followLink.style.display="block";
    }
    */
  }   
  //Add link to appear when user downvotes article
  if (document.getElementsByClassName("negative-followup").length>0) {
    var formLink = document.querySelectorAll(".negative-followup")[0];
    var downvote = document.querySelectorAll(".article-vote-down")[0];
    downvote.addEventListener("click", function(e) {
      formLink.classList.add("active");
    });
  }
  if (document.getElementById("new_request")) {
    var theForm = document.getElementById("new_request");
    var articleID = getUrlParameter("article_id");
    if (articleID) {
      document.getElementById("request_subject").value = "Feedback on Article ID# " + articleID;
    }
    var formMenu = document.getElementById("request_issue_type_select");
    var fauxMenu = document.querySelectorAll(".request_ticket_form_id")[0];
    if (getUrlParameter("ticket_form_id")==null || getUrlParameter("ticket_form_id")=="") {
      location.replace("https://support.dynamicsignal.com/hc/en-us/requests/new?ticket_form_id=360000290032");
    }
    else {
      console.log(getUrlParameter("ticket_form_id"));
      fauxMenu.style.display="none";
    }

    function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      var decoded = null;
      try {
          decoded = decodeURIComponent(results[1].replace(/\+/g, ' '));
      }
      catch(e) {
          decoded = null;
      }
      return results === null ? '' : decoded;
  };
  }
  $(".share a").click(function(e) {
    e.preventDefault();
    window.open(this.href, "", "height = 500, width = 500");
  });

  // show form controls when the textarea receives focus or backbutton is used and value exists
  var $commentContainerTextarea = $(".comment-container textarea"),
    $commentContainerFormControls = $(".comment-form-controls, .comment-ccs");

  $commentContainerTextarea.one("focus", function() {
    $commentContainerFormControls.show();
  });

  if ($commentContainerTextarea.val() !== "") {
    $commentContainerFormControls.show();
  }


  // Expand Request comment form when Add to conversation is clicked
  var $showRequestCommentContainerTrigger = $(".request-container .comment-container .comment-show-container"),
    $requestCommentFields = $(".request-container .comment-container .comment-fields"),
    $requestCommentSubmit = $(".request-container .comment-container .request-submit-comment");

  $showRequestCommentContainerTrigger.on("click", function() {
    $showRequestCommentContainerTrigger.hide();
    $requestCommentFields.show();
    $requestCommentSubmit.show();
    $commentContainerTextarea.focus();
  });

  // Mark as solved button
  var $requestMarkAsSolvedButton = $(".request-container .mark-as-solved:not([data-disabled])"),
    $requestMarkAsSolvedCheckbox = $(".request-container .comment-container input[type=checkbox]"),
    $requestCommentSubmitButton = $(".request-container .comment-container input[type=submit]");

  $requestMarkAsSolvedButton.on("click", function() {
    $requestMarkAsSolvedCheckbox.attr("checked", true);
    $requestCommentSubmitButton.prop("disabled", true);
    $(this).attr("data-disabled", true).closest("form").submit();
  });

  // Change Mark as solved text according to whether comment is filled
  var $requestCommentTextarea = $(".request-container .comment-container textarea");

  $requestCommentTextarea.on("keyup", function() {
    if ($requestCommentTextarea.val() !== "") {
      $requestMarkAsSolvedButton.text($requestMarkAsSolvedButton.data("solve-and-submit-translation"));
      $requestCommentSubmitButton.prop("disabled", false);
    } else {
      $requestMarkAsSolvedButton.text($requestMarkAsSolvedButton.data("solve-translation"));
      $requestCommentSubmitButton.prop("disabled", true);
    }
  });

  // Disable submit button if textarea is empty
  if ($requestCommentTextarea.val() === "") {
    $requestCommentSubmitButton.prop("disabled", true);
  }

  // Submit requests filter form in the request list page
  $("#request-status-select, #request-organization-select")
    .on("change", function() {
      search();
    });

  // Submit requests filter form in the request list page
  $("#quick-search").on("keypress", function(e) {
    if (e.which === 13) {
      search();
    }
  });

  function search() {
    window.location.search = $.param({
      query: $("#quick-search").val(),
      status: $("#request-status-select").val(),
      organization_id: $("#request-organization-select").val()
    });
  }

  $(".header .icon-menu").on("click", function(e) {
    e.stopPropagation();
    var menu = document.getElementById("user-nav");
    var isExpanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", !isExpanded);
  });

  if ($("#user-nav").children().length === 0) {
    $(".header .icon-menu").hide();
  }

  // Submit organization form in the request page
  $("#request-organization select").on("change", function() {
    this.form.submit();
  });
  $(".dropdown-toggle").on("click", function(e) {
    e.stopPropagation();
    var isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !isExpanded);
    var menu = this.parentNode.querySelectorAll("[role='menu']")[0];
    menu.setAttribute("aria-expanded", !isExpanded);
  });
  // Toggles expanded aria to collapsible elements
  $(".collapsible-nav, .collapsible-sidebar").on("click", function(e) {
    e.stopPropagation();
    var isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !isExpanded);
  });

  // Video handler for Vimeo
  var iframes = document.querySelectorAll("iframe");

  for (i = 0; i < iframes.length; i++) {
    var thisFrame = iframes[i];
    if (thisFrame.src.indexOf("vimeo") > -1) {
      var wrapper = document.createElement("div");
      wrapper.classList.add("wrapper-video");
      thisFrame.parentNode.insertBefore(wrapper, thisFrame);
      wrapper.appendChild(thisFrame);
    }
  }
  //sidebar.$mount("main");
  $("#btn-toggle-sidebar").on("click", function(e) {
    e.preventDefault();
    $("#sidebar").toggleClass("closed");
  });
  activateImages();
  activateAlerts();
  TableHandler();
  activateLightbox();
});

function activateImages() {
  var backgroundImages = document.querySelectorAll("[data-bg]");
  for (i in backgroundImages) {
    if (isElement(backgroundImages[i])) {
      thisElement = backgroundImages[i];
      thisElement.style.backgroundImage = "url('" + thisElement.getAttribute("data-bg") + "')";
    }
  }
}

function isElement(o) {
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
  );
}

function activateAlerts() {
  $.get("/api/v2/help_center/" + $('html').attr('lang').toLowerCase() + "/articles.json?label_names=alert").done(function(data) {

    $.each(data.articles, function(index, item) {

      var style1 = '<div class="ns-box ns-bar ns-effect-slidetop ns-type-notice ns-show"><div class="ns-box-inner"><span class="megaphone"></span></i><p><a href="' + item.html_url + '">' + item.title + '</a></p></div><span class="ns-close"></span></div>'

      $('.alertbox').append(style1);
    });
    $('.ns-close').on('click', function() {
      $(".alertbox").remove();
    });

  });
}

function TableHandler() {
  var tables = document.querySelectorAll(".article-body table");
  for(i=0;i<tables.length;i++) {
    var thisTable = tables[i];
  }
}

// GDPR Popup Code

var siteSettings = {
  "gdprCookie":"ds-gdpr",
  "templates": {
    "gdprPopup": require("./gdpr-popup.pug")
  }
}

function triggerGDPR() {
  var domain = "dynamicsignal.com";
  if (!Cookies.get(siteSettings.gdprCookie)) {
    var warning = parseHTML(siteSettings.templates.gdprPopup());
    document.body.appendChild(warning);
    var yesButton = document.getElementById("btn-yes");
    var noButton = document.getElementById("btn-no");
    yesButton.addEventListener("click", function(e) {
      e.preventDefault();
      Cookies.set(siteSettings.gdprCookie,"true",{
        expires: 365,
        domain:domain
      });
      warning.remove();   
      return false;
    });
    window.addEventListener("click", function(e) {
      Cookies.set(siteSettings.gdprCookie,"true",{
        expires: 365,
        domain:domain
      });
      triggerGA();
      return true;
    });
  }
  else {
    triggerGA();
  }
}
function triggerGA() {
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-MQKZ8M');
  dataLayer = dataLayer || [];
  dataLayer.push({"event" : window.navigator.userAgent });
}
function checkCookies(){
  var cookieEnabled = navigator.cookieEnabled;
  if (!cookieEnabled){ 
      document.cookie = "testcookie";
      cookieEnabled = document.cookie.indexOf("testcookie")!=-1;
  }
  if (cookieEnabled) {
    Cookies.remove("testcookie");
  }
  return cookieEnabled;
}
function wipeCookies() {

    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

}
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        if (this.parentNode !== null)
          this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

function checkStatus() {
  var sp = new StatusPage.page({
    page: 'x6wrml6mfzfm'
  }); // Change this ID for your Statuspage's Page ID, found under Account->API
  sp.summary({
    success: function(data) {
      var status = document.createElement("a");
      status.href = "https://dynamicsignal.statuspage.io/";
      status.target="_blank";
      status.innerHTML = "<span class='status-dot "+data.status.indicator+"'></span>Status";
      if (document.getElementById("status-message")) {
        document.getElementById("status-message").appendChild(status);
      }
    }
  });
}
function activateLightbox() {
  var popImages = document.querySelectorAll(".launch-lightbox");
  if (popImages.length>0) {
    for (i=0;i<popImages.length;i++) {
      var thisPop = popImages[i];
      thisPop.addEventListener("click", function(e) {
        e.preventDefault();
        var theModal = document.createElement("div"), theImage = document.createElement("img"), theCloser = document.createElement("a");
        theImage.src = this.src;
        theModal.classList.add("modal");
        theCloser.innerHTML = "&times;";
        theModal.appendChild(theCloser);
        theModal.appendChild(theImage);
        document.body.classList.add("modal-show");
        document.body.appendChild(theModal);
        theModal.addEventListener("click", function() {
          document.body.removeChild(theModal);
          document.body.classList.remove("modal-show");
        });
      })
    }
  }
}
function fixRequestSelect() {
  var i = 0;
  var cZendesk = false; //assume user is not part of the Zendesk Organization
  //reserve space for additional organizations
  var checkExist = setInterval(function() {
     i++;
     if ($("a.nesty-input").length){
        clearInterval(checkExist);
        $("a.nesty-input").each(function() {
           $(this).bind( "click", function() {
              for (var c in HelpCenter.user.organizations) {
                 if (HelpCenter.user.organizations[c].name == "ZENDESK"){
                    cZendesk = true; //if user is part of the organization called "ZENDESK", then set its variable to true.
                 }
                 //reserve space for additional organizations
                 }
                 if (!cZendesk){
                    $("#360000322872").remove(); //remove the "TICKET_FORM_ID" with the proper id from the dropdown list. Leave the pound sign intact.
                 }
           //reserve space for additional organizations
           });
        });
     }
     if (i > 10){
        clearInterval(checkExist);
     }
  }, 100);
}