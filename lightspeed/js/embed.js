$(document).ready(function(){
  console.log('ready to rock');
   
  var product = $('script[src^="http://fashionfitr.webshopapp.com/services/stats/pageview.js"]').attr('src').split('?')[1];
  var product_string = product.split('&')[0];
  var product_id = product_string.substr ( product_string.indexOf ( '=' ) + 1 );


   var $head = $("head");
   var $headlinklast = $head.find("link[rel='stylesheet']:last");
   var linkElement = "<link rel='stylesheet' href='https://popup.fashionfitr.com/js/fashion-fitr-button.css' type='text/css' >";
   if ($headlinklast.length){
      $headlinklast.after(linkElement);
   }
   else {
      $head.append(linkElement);
   }

  
   var path = $('script[src^="https://popup.fashionfitr.com/js/ffb-min.js"]').attr('src').split('?')[1];
   
   $.ajax({
      type:'post',
      url:'http://lightspeed.fashionfitr.com/product_info.php',
      data:'prodid='+product_id,
      crossDomain: true,
      success:function(response){

          var resp = JSON.parse(response);
          console.log('jsondata',resp.productName);
          window.brand = encodeURIComponent(resp.brandName.trim());
          window.measurement = resp.measurement.toLowerCase();
          window.module = encodeURIComponent(resp.categoryName.trim());
          window.prodname = encodeURIComponent(resp.productName.trim());
          
      }
  });

  $.ajax({
      type:'post',
      url:'http://lightspeed.fashionfitr.com/fashionfitr_api.php',
      data:'shopid='+path,
      crossDomain: true,
      success:function(respData){
          var jsondata = JSON.parse(respData);
          console.log(jsondata);
          window.addToCart = jsondata.addToCart;
          window.gender = jsondata.gender;
          window.label = jsondata.label;
          window.language = jsondata.language;
          window.shopid = jsondata.shopid;
      }
  });

  

    setTimeout(function(){
    console.log('product name',window.prodname);
    console.log('brand Name',window.brand);
    console.log('measurement',window.measurement);
    console.log('Category',window.module);

	  fashionFitrButton.getButton({shopid:window.shopid,
                    label: window.label,    //'label' or 'size', or 'combi' e.g. XXL / 40 / XXL-40
                    addToCart: window.addToCart,
                    language: window.language,
                    fakebutton:false,               // for testmodus development only
                    gender: window.gender,
                    brand: window.brand,
                    container: 'fashionfitr_btn',
                    name: window.prodname,
                    measurement: window.measurement,
                    module: window.module,
                    callback: function(item){
                      console.log('finalData',item);
                    }
               }); 
    },3000);
});