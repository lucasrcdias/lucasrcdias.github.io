$(function(){
  //clique no botão de pesquisa por voz
  $(".search-toggle").click(function(){
    $(".overlay").fadeIn(function(){
      $(".voice-search").animate({
        "bottom":"50%",
        "margin-bottom":"-36px"
      }, function(){
        $(this).addClass("clicked");
      });
    });
  });
  //clique do "x" no overlay
  $(".close").click(function(){
    $(".voice-search").removeClass("clicked").animate({
        "bottom":"2em",
        "margin-bottom":"0"
      }, function(){
        $(".overlay").fadeOut();
      });
  });
  //variaveis
  var pesq = '', 
      json = '';
  
  //clique do botão de pesquisa normal
  $(".search-button").click(function(){
    pesq = $("#pesq").val();
    if (pesq != "") {
      $(".results").fadeIn(function(){
        $('html,body').animate({
          scrollTop: $(this).offset().top
        }, 1000);  
      });
    }
  });
  
  var element = $('.search-controls');
    
  $(window).scroll(function () {
    if ($(this).scrollTop() > window.innerHeight - 1){
      element.addClass("fixed-controls");
      $(".show-controls, .back-to-top").fadeIn();
    }
    else{
      element.removeClass("fixed-controls");
      $(".show-controls, .back-to-top").fadeOut();
    }
  });
  
  $(".show-controls").click(function(){
    var x = $(".fixed-controls");
    if($(x).is(":visible"))
      $(x).fadeOut();
    else $(x).fadeIn();
  });
  
  $(".back-to-top").click(function(){
    $('html,body').animate({
      scrollTop: $(".results").offset().top
    }, 1000); 
  });
  
  $(".more").click(function(){
    toggleMore($(this).data("more"));
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
}(jQuery));