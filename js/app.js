$(function(){
  //clique no botão de pesquisa por voz
  $(".search-toggle").click(function(){
    $(".voice-overlay").fadeIn(function(){
      if(!mob)
        $(".voice-search").animate({
          "bottom":"50%",
          "margin-bottom":"-36px"
        }, function(){
          $(this).addClass("clicked");
        });
      else
        $(".voice-search").animate({
          "bottom":"30%",
          "margin-bottom":"-36px"
        }, function(){
          $(this).addClass("clicked");
        });
    });
  });
  //clique do "x" no overlay da voz
  $(".voice-close").click(function(){
    $(".voice-search").removeClass("clicked").animate({
        "bottom":"2em",
        "margin-bottom":"0"
      }, function(){
        $(".voice-overlay").fadeOut();
      });
  });
  
  $(".map-close").click(function(){
    $(".map-overlay").fadeOut();
  });
  //variaveis
  var pesq = '', 
      json = '',
      isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
},
      mob = isMobile.any();
  
  //clique do botão de pesquisa normal
  $(".search-button").click(function(){
    pesq = $("#pesq").val();
    if (pesq != "") {
      
      var contResult = 0
        ,linhas = $.getJSON("linhas.json", function(data){
        $.each(data.linhas, function(i, item){
          if(this.nome.indexOf(pesq) > -1 || this.id.indexOf(pesq) > -1 || this.itinerario.indexOf(pesq) > -1){
            contResult++;
            result.append("<div class=\"result\">"+
                            "<header class=\"result-header\">"+
                            "  <div class=\"linha\">"+ this.numero +"</div>"+
                            "  <div class=\"nome\">"+ this.nome.replace('/','-') +"</div>"+
                            "  <div class=\"sentido\">"+ this.sentido.replace('/','-') +"</div>"+
                            "  <div class=\"horarios\"><i class=\"fa fa-clock-o\"></i><span>Horários</span>"+
                            "  </div>"+
                            "  <div class=\"trajetos\"><a href=\""+ this.gmaps +"\" target=\"_blank\"><i class=\"fa fa-map-marker\"></i> <span>Trajetória</span></a>"+
                            "  </div>"+
                            "</header>"+
                          "</div>");
          };
        });
        if(contResult == 0)
          alert("Não encontramos nada com " + pesq);
        else{          
          $(".horarios").click(function(){
            toggleMore($(this).data("more"));
          });
          /*
          $(".trajetos").click(function(){
            var map = $(this).data("map"),
                wrapper = $(".map-wrapper");

            wrapper.append("<iframe width='100%' height='500' framborder='0' scrolling='no' marginheight='0' marginwidth='0' src='"+ map +"'></iframe>");

            $(".map-overlay").fadeIn();
          });*/

          
          $("#pesq-query").html(pesq);
          $(".results").fadeIn(function(){
            $('html,body').animate({
              scrollTop: $(this).offset().top
            }, 1000);  
          });
        }
      })
      , result = $(".results .container");
    }
    else{
      alert("Ô SEU CUZAO, DIGITA UMA COISA AE CARAIO!");
    }
  });
  
  var element = $('.search-controls');
    
  /*$(window).scroll(function () {
    if ($(this).scrollTop() > window.innerHeight - 1){
      element.addClass("fixed-controls");
      $(".show-controls, .back-to-top").fadeIn();
    }
    else{
      element.removeClass("fixed-controls");
      $(".search-controls").fadeIn();
      $(".show-controls, .back-to-top").fadeOut();
    }
  });*/
  
  $(".show-controls").click(function(){
    var x = $(".fixed-controls");
    if($(x).is(":visible")){
      $(this).html("<i class=\"fa fa-search\"></i>");
      $(x).fadeOut();
    }
    else{ 
      $(this).html("<i class=\"fa fa-close\"></i>");  
      $(x).fadeIn();
    }
  });
  
  $(".back-to-top").click(function(){
    $('html,body').animate({
      scrollTop: $(".results").offset().top
    }, 1000); 
  });
  
  $(".result-header").click(function(){
    if($(this).hasClass("visible-info"))
      $(this).removeClass("visible-info");
    else $(this).addClass("visible-info");
  });
  
  function toggleMore(id){
    var el = $("#"+ id);
    if(el.is(":visible"))
      el.slideUp();
    else el.slideDown();
    
    $('html,body').animate({
          scrollTop: el.offset().top
        }, 1000);
  }
  
  function toggleMap(map){
    
  }
}(jQuery));