$(function () {
  //clique no botão de pesquisa por voz
  $(".search-toggle").click(function () {
    $(".voice-overlay").fadeIn(function () {
      if (!mob)
        $(".voice-search").animate({
          "bottom": "50%",
          "margin-bottom": "-36px"
        }, function () {
          $(this).addClass("clicked");
        });
      else
        $(".voice-search").animate({
          "bottom": "30%",
          "margin-bottom": "-36px"
        }, function () {
          $(this).addClass("clicked");
        });
    });
  });
  //clique do "x" no overlay da voz
  $(".voice-close").click(function () {
    $(".voice-search").removeClass("clicked").animate({
      "bottom": "2em",
      "margin-bottom": "0"
    }, function () {
      $(".voice-overlay").fadeOut();
    });
  });
  
  $(".map-close").click(function () {
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
  $(".search-button").click(function () {
    pesq = $("#pesq").val();
    var contResult = 0,
      linhas = $.getJSON("linhas.json", function (data) {
        $.each(data.linhas, function (i, item) {
          if (this.nome.indexOf(pesq) > -1 || this.id.indexOf(pesq) > -1 || this.itinerario.indexOf(pesq.toUpperCase()) > -1) {
            contResult++;
            result.append("<div class=\"result\">" +
              "<header class=\"result-header\">" +
              "  <div class=\"linha\">" + this.numero + "</div>" +
              "  <div class=\"nome\">" + this.nome.replace('/', '-') + "</div>" +
              "  <div class=\"sentido\">" + this.sentido.replace('/', '-') + "</div>" +
              "  <div class=\"horarios\" data-more=\""+contResult+"\"><i class=\"fa fa-clock-o\"></i><span>Horários</span>" +
              "  </div>" +
              "  <div class=\"trajetos\"><a href=\"" + this.gmaps + "\" target=\"_blank\"><i class=\"fa fa-map-marker\"></i> <span>Trajetória</span></a>" +
              "  </div>" +
              "</header>" +
              "<div class=\"more-infos\" id=\""+contResult+"\">"+
              " <section class=\"horarios\">"+
                       loadHorarios(this.horarios) +
              " </section>" +
              "</div>"+
              "</div>");
          };
        });
        if (contResult == 0)
          $(".message").addClass("error").removeClass("success").fadeIn();
        else {
          $(".message").fadeOut();
          $(".horarios").click(function () {
            toggleMore($(this).data("more"));
          });

          $("#pesq-query").html(pesq);
          $(".results").fadeIn(function () {
            $('html,body').animate({
              scrollTop: $(this).offset().top
            }, 1000);
          });
        }
      }),
      result = $(".results .container");

  });
  
  function loadHorarios(horarios){
    var qtdHorarios = horarios.length,
        htmlHorarios = '';
    
    for(var i = 0; i < qtdHorarios; i++){
      var listaHorario = horarios[i].horario.split('**'),
          tamListaHorario = listaHorario.length,
          htmlResult = "<div class=\"horario\">"+
                         "<h2>"+listaHorario[0]+"</h2>"+
                         "<table>"+
                         "</table>"+
                       "</div>";
      
      //o for vai começar do 1 pois o primeiro sempre vai ser o "título" da tabela, por exemplo, "de segunda a sexta-feira"
      for(var y = 1; y < tamListaHorario; y++){
          
      }
      
      htmlHorarios += htmlResult;
    }
    
    return htmlHorarios;
  }
  
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

  $(".show-controls").click(function () {
    var x = $(".fixed-controls");
    if ($(x).is(":visible")) {
      $(this).html("<i class=\"fa fa-search\"></i>");
      $(x).fadeOut();
    } else {
      $(this).html("<i class=\"fa fa-close\"></i>");
      $(x).fadeIn();
    }
  });

  $(".back-to-top").click(function () {
    $('html,body').animate({
      scrollTop: $(".results").offset().top
    }, 1000);
  });

  function toggleMore(id) {
    var el = $("#" + id);
    if (el.is(":visible"))
      el.slideUp();
    else el.slideDown();

    $('html,body').animate({
      scrollTop: el.offset().top
    }, 1000);
  }
  
  $(".close-message").click(function(){
    $(".message").fadeOut();
  });
}(jQuery));