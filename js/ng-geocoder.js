(function () {
  angular.module("ng-geocoder", []);
})();

(function () {
  angular
    .module("ng-geocoder")
    .factory("ngGeocoderService", ngGeocoderService);

  ngGeocoderService.$inject = ["$q"];

  function ngGeocoderService ($q) {
    var geocoder = new google.maps.Geocoder();
    var service  = {
      "geocodeById": geocodeById,
      "geocodeByQuery": geocodeByQuery
    }

    return service;

    function handleReply (defer, results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        return defer.resolve(results);
      } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        return defer.resolve([]);
      } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        return defer.reject("Over query limit");
      } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
        return defer.reject("Request denied");
      }

      return defer.reject("Unknown error");
    }

    function geocodeById (placeId) {
      return geocode({ "placeId": placeId });
    }

    function geocodeByQuery (query, region) {
      return geocode({ "address": query, "region": region });
    }

    function geocode (options) {
      var defer = $q.defer();

      geocoder.geocode(options, function (results, status) {
        handleReply(defer, results, status);
      });

      return defer.promise;
    }
  }
})();

(function () {
  angular
    .module("ng-geocoder")
    .directive("ngGeocoder", ngGeocoder);

  ngGeocoder.$inject = ["$timeout", "$templateCache", "ngGeocoderService"];

  function ngGeocoder ($timeout, $templateCache, ngGeocoderService) {
    var DEFAULT_TEMPLATE_URL = "/ng-geocoder/ng-geocoder.html";

    $templateCache.put(DEFAULT_TEMPLATE_URL, "<div class=\"ng-geocoder\">\n  <input id=\"{{ inputId }}\" placeholder=\"{{ placeholder }}\" class=\"ng-geocoder__input\" type=\"text\" ng-model=\"query\" ng-class=\"inputClass\" autocomplete=\"off\"/>\n\n  <ul class=\"ng-geocoder__list\" ng-show=\"displayList()\" ng-style=\"{ 'max-height': maxHeight || '250px' }\">\n    <li class=\"ng-geocoder__list__item ng-geocoder__list__item--searching\" ng-if=\"isSearching\">\n      <strong class=\"ng-geocoder__list__item__text\" ng-bind=\"textSearching\"></strong>\n    </li>\n    <li class=\"ng-geocoder__list__item ng-geocoder__list__item--empty\" ng-if=\"isEmpty\">\n      <strong class=\"ng-geocoder__list__item__text\" ng-bind=\"textNoResults\"></strong>\n    </li>\n    <li class=\"ng-geocoder__list__item\" ng-repeat=\"result in results\" ng-class=\"{ 'ng-geocoder__list__item--focus': index === $index }\" ng-click=\"selectItem($index)\">\n      <strong class=\"ng-geocoder__list__item__text\" ng-bind=\"result.formatted_address\" tabindex=\"{{ $index }}\"></strong>\n    </li>\n  </ul>\n</div>\n");

    var directive = {
      "restrict": "AE",
      "scope": {
        "result": "=ngGeocoder",
        "inputId": "=",
        "wait": "=",
        "minLength": "=",
        "inputClass": "@",
        "placeholder": "@",
        "textSearching": "@",
        "textNoResults": "@",
        "maxHeight": "@"
      },
      "link": linkFunction,
      "templateUrl": geocoderTemplate
    };

    return directive;

    function linkFunction (scope, element, attributes) {
      var waitTimeout;

      var $el      = element[0];
      var form     = $el.closest("form");
      var input    = $el.querySelector(".ng-geocoder__input");
      var dropdown = $el.querySelector(".ng-geocoder__list");
      var placeId  = attributes.placeId;

      scope.index   = 0;
      scope.results = [];

      scope.selectItem   = selectItem;
      scope.displayList  = displayList;
      scope.inputKeydown = inputKeydown;

      form.addEventListener("keydown", formKeydown);

      input.addEventListener("blur",           inputBlur);
      input.addEventListener("focus",          inputFocus);
      input.addEventListener("input",          inputChanged);
      input.addEventListener("keydown",        inputKeydown);
      input.addEventListener("compositionend", inputChanged);

      if (placeId) {
        ngGeocoderService.geocodeById(placeId)
          .then(geocodedWithPlaceId);
      }

      function formKeydown (event) {
        var targetIsGeocoderInput = event.target.classList.contains("ng-geocoder__input");

        if (event.keyCode === 13 && targetIsGeocoderInput) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      function inputBlur (event) {
        scope.showList = false;
      }

      function inputFocus (event) {
        scope.showList = true;
      }

      function inputChanged (event) {
        var length = scope.query.length;

        if (length < scope.minLength || scope.isSearching) { return; }

        if (waitTimeout) { $timeout.cancel(waitTimeout); }

        waitTimeout = $timeout(search, scope.wait || 500);
      }

      function inputKeydown (event) {
        if (!event || !event.keyCode) return;

        var enterPressed  = event.keyCode === 13;
        var arrowsPressed = event.keyCode === 38 || event.keyCode === 40;

        if (enterPressed || arrowsPressed) {
          if (arrowsPressed) handleArrowKeys(event.keyCode);
          if (enterPressed)  selectItem(scope.index);

          event.preventDefault();
          event.stopPropagation();

          return false;
        }
      }

      function search () {
        scope.results     = [];
        scope.isSearching = true;

        return ngGeocoderService.geocodeByQuery(scope.query, attributes.region)
          .then(geocodeSuccess);
      }

      function geocodeSuccess (results) {
        scope.isSearching = false;
        scope.results     = results || [];
        scope.showList    = true;
        scope.index       = 0;
      }

      function geocodedWithPlaceId (results) {
        var result = results[0];

        if (result) {
          scope.query    = result.formatted_address;
          scope.result   = result;

          scope.showList = false;
        }
      }

      function selectItem (index) {
        $timeout(function () {
          scope.result   = scope.results[index];
          scope.query    = scope.result.formatted_address;

          scope.showList = false;
        }, 0);
      }

      function displayList () {
        return scope.results.length && scope.showList;
      }

      function handleArrowKeys(key) {
        var index         = scope.index;
        var resultsLength = scope.results.length;

        var arrowUp   = key === 38;
        var arrowDown = key === 40;

        if (arrowUp && (index - 1 >= 0)) {
          index--;
        }

        if (arrowDown && (index + 1 < resultsLength)) {
          index++;
        }

        $timeout(function () {
          scope.index = index;
        }, 0);

        if (arrowUp   && scope.results.length) fixArrowUpScroll();
        if (arrowDown && scope.results.length) fixArrowDownScroll();
      }

      function fixArrowUpScroll() {
        var rowTop = dropdownRowTop();
        var height = dropdownRowOffsetHeight(getCurrentRow());

        if (rowTop < height) {
          dropdownScrollTo(rowTop - height);
        }
      }

      function fixArrowDownScroll () {
        var row = getCurrentRow();

        if (getDropdownHeight() < row.getBoundingClientRect().bottom) {
          dropdownScrollTo(dropdownRowOffsetHeight(row));
        }
      }

      function getCurrentRow () {
        return $el.querySelector(".ng-geocoder__list__item--focus");
      }

      function dropdownRowTop () {
        return getCurrentRow().getBoundingClientRect().top - (dropdown.getBoundingClientRect().top + parseInt(getComputedStyle(dropdown).paddingTop, 10));
      }

      function dropdownScrollTo (offset) {
        dropdown.scrollTop = dropdown.scrollTop + offset;
      }

      function getDropdownHeight () {
        return dropdown.getBoundingClientRect().top + parseInt(getComputedStyle(dropdown).maxHeight, 10);
      }

      function dropdownRowOffsetHeight (row) {
        var css = getComputedStyle(row);

        return row.offsetHeight + parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
      }
    }

    function geocoderTemplate (element, attributes) {
      return attributes.templateUrl || DEFAULT_TEMPLATE_URL
    }
  }
})();

(function () {
	if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = 
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s);
      var i;
      var el = this;

      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = el.parentElement)); 
      
      return el;
    }
	}
})();