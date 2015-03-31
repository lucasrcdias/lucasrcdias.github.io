$(function () {

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

  function loadHorarios(horarios) {
    var qtdHorarios = horarios.length,
      htmlHorarios = '';

    for (var i = 0; i < qtdHorarios; i++) {
      var listaHorario = horarios[i].horario.split('**'),
        tamListaHorario = listaHorario.length,
        htmlResult = "<div class=\"horario\">" +
        "<h2>" + listaHorario[0] + "</h2>" +
        "<table>" +
        "  <thead>" +
        "    <tr><td>" + listaHorario[1] + "</td><td>" + listaHorario[2] + "</td><td>" + listaHorario[3] + "</td><td>" + listaHorario[4] + "</td></tr>" +
        "</thead>" +
        "<tbody>";
      //o for vai começar do 5, lembrando que por ser uma lista o primeiro índice é 0, então vamos começar do 6 item ou seja, 5º indice pois os 5 primeiros item (0, 4) são padrões.
      //vou decrementar 4 pois quero que ele vá até o último item - 4 para que eu possa avançar manualmente dentro do for.
      tamListaHorario -= 4;
      for (var y = 5; y < tamListaHorario; y += 4) {
        htmlResult += "<tr>";
        if (parseInt(listaHorario[y].split(":")[0]) <= 6)
          htmlResult += "<td>" + listaHorario[y] + "</td>";
        else htmlResult += "<td></td>";
        if (parseInt(listaHorario[y + 1].split(":")[0]) <= 12)
          htmlResult += "<td>" + listaHorario[y + 1] + "</td>";
        else htmlResult += "<td></td>";
        if (parseInt(listaHorario[y + 2].split(":")[0]) <= 18)
          htmlResult += "<td>" + listaHorario[y + 2] + "</td>";
        else htmlResult += "<td></td>";
        if (parseInt(listaHorario[y + 3].split(":")[0]) <= 24)
          htmlResult += "<td>" + listaHorario[y + 3] + "</td>";
        else htmlResult += "<td></td>";
        htmlResult += "</tr>";
      }
      htmlResult += "   </tbody>" +
        " </table>" +
        "</div>";
      htmlHorarios += htmlResult;
    }

    return htmlHorarios;
  }

  function search(s) {
    $(".result").remove();
    var contResult = 0,
      linhas = $.getJSON("linhas.json", function (data) {
        $.each(data.linhas, function (i, item) {
          if (this.nome.indexOf(s.toUpperCase()) > -1 || this.id.indexOf(s) > -1 || this.itinerario.indexOf(s.toUpperCase()) > -1) {
            contResult++;
            result.append("<div class=\"result\">" +
              "<header class=\"result-header\">" +
              "  <div class=\"linha\">" + this.numero + "</div>" +
              "  <div class=\"nome\">" + this.nome.replace('/', '-') + "</div>" +
              "  <div class=\"sentido\">" + this.sentido.replace('/', '-') + "</div>" +
              "  <div class=\"horarios\" data-more=\"" + contResult + "\"><i class=\"fa fa-clock-o\"></i><span>Horários</span>" +
              "  </div>" +
              "  <div class=\"trajetos\"><a href=\"" + this.gmaps + "\" target=\"_blank\"><i class=\"fa fa-map-marker\"></i> <span>Trajetória</span></a>" +
              "  </div>" +
              "</header>" +
              "<div class=\"more-infos\" id=\"" + contResult + "\">" +
              " <section class=\"horarios\">" +
              loadHorarios(this.horarios) +
              " </section>" +
              "</div>" +
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

          $("#pesq-query").html(s);
          $(".results").fadeIn(function () {
            $('html,body').animate({
              scrollTop: $(this).offset().top
            }, 1000);
          });
          $("footer").fadeIn();
        }
      }),
      result = $(".results .container");
  }

  function toggleMore(id) {
    var el = $("#" + id);
    if (el.is(":visible"))
      el.slideUp();
    else el.slideDown();

    $('html,body').animate({
      scrollTop: el.offset().top
    }, 1000);
  }

  $(".close-message").click(function () {
    $(".message").fadeOut();
  });

  $(".search-button").click(function () {
    search($(".search-input").val());
  });

  //todo o código para reconhecimento de voz

  showInfo('info_start');
  var final_transcript = '';
  var recognizing = false;
  var ignore_onend;
  var start_timestamp;


  var voiceAvailable = true;
  function upgrade() {
    $(".voice-button").fadeOut();
    $(".search-button").css("width", '100%');
    voiceAvailable = false;
  }
  var two_line = /\n\n/g;
  var one_line = /\n/g;

  function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  }
  var first_char = /\S/;

  function capitalize(s) {
    return s.replace(first_char, function (m) {
      return m.toUpperCase();
    });
  }

  function showInfo(s) {
    $(".overlay h1").fadeOut("fast");
    if (s)
      $("#" + s).fadeIn();
    else
      $("#" + s).fadeOut();
  }

  if (!('webkitSpeechRecognition' in window)) {
    upgrade();
  } else {
    var recognition = new webkitSpeechRecognition();
    recognition.interimResults = true;
    recognition.onstart = function () {
      recognizing = true;
      showInfo('info_speak_now');
    };
    recognition.onerror = function (event) {
      if (event.error == 'no-speech') {
        showInfo('info_no_speech');
        ignore_onend = true;
      }
      if (event.error == 'audio-capture') {
        showInfo('info_no_microphone');
        ignore_onend = true;
      }
      if (event.error == 'not-allowed') {
        if (event.timeStamp - start_timestamp < 100) {
          showInfo('info_blocked');
        } else {
          showInfo('info_denied');
        }
        ignore_onend = true;
      }
    };
    recognition.onend = function () {
      recognizing = false;
      if (ignore_onend) {
        return;
      }
      if (!final_transcript) {
        showInfo('info_start');
        return;
      }
      $(".overlay").fadeOut(function () {
        search($("#final_span").text());
      });
    };
    recognition.onresult = function (event) {
      var interim_transcript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal)
          final_transcript += event.results[i][0].transcript;
        else
          interim_transcript += event.results[i][0].transcript;        
      }
      final_transcript = capitalize(final_transcript);
      final_span.innerHTML = linebreak(final_transcript);
      interim_span.innerHTML = linebreak(interim_transcript);
    };
  }

  $(".voice-button").click(function () {
    $(".overlay").fadeIn();
    if (voiceAvailable) {
      if (recognizing) {
        recognition.stop();
        return;
      }
      final_transcript = '';
      recognition.lang = "pt-BR";
      recognition.start();
      ignore_onend = false;
      final_span.innerHTML = '';
      interim_span.innerHTML = '';
      showInfo('info_allow');
      start_timestamp = event.timeStamp;
    }
  });
  $(".voice-cancel").click(function () {
    $(".overlay").fadeOut();
  });
}(jQuery));