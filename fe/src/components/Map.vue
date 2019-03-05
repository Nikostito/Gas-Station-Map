<template>
  <div>
    <h3 v-bind:class="{ wrongText: isWrong, rightText: !isWrong }">{{textResponse}}</h3>
    <div v-show="showLocationPick || !showAddPrice" class="noBorderDiv top">
      <label>
        <gmap-autocomplete
          @place_changed="setPlace">
        </gmap-autocomplete><br>
        <button class="button small" @click="addMarkerDeleteOthers">Εύρεση τοποθεσίας</button>
        <button class="button small" @click="geolocatePan()">Η τοποθεσία μου</button><br>
        <button v-show="showLocationPick && showAddPrice" class="button small" @click="toggleLocationPickAndSetShop()">
          Επιλογή τοποθεσίας (v)
        </button>
      </label>
      <br/>
    </div>
    <div v-show="showCenterMark" class="marker">
      <img alt="custom marker" src="../assets/custoMarker.png">
    </div>
    <div class="noBorderDiv leftBottom">
      <button v-show="!showAddPrice" class="button" @click="toggleAddPriceAndShowCenterMark()">Προσθήκη τιμής</button>
    </div>
    <div class="noBorderDiv bottom" v-show="showAddPrice">
      <form v-show="!showLocationPick && !showGetPrice"  v-on:submit="addPrice">
            <input type="text" name="shopName" placeholder="Βενζινάδικο"/><br>
            <p class="text">Τιμή:</p>
            <input type="number" step='0.001' min='0.001' name="priceName" v-model="price" placeholder="Τιμή"/><br>
            <select name="productPick">
              <option value="e95">Βενζίνη 95 οκτανίων</option>
              <option value="e100">Βενζίνη 100 οκτανίων</option>
              <option value="Diesel">Diesel</option>
              <option value="LPG">LPG</option>
            </select>
            <br>
            <input type="date" v-model="dateData"/><br>
            <input class="button small" type="submit" value="Προσθήκη"/><br>
            <input class="button small" type="submit" value="Άκυρο"/><br>
      </form>
    </div>


    <div class="noBorderDiv midBottom">
      <button v-show="!showFindPrice" class="button" @click="toggleFindPriceAndShowCenterMark()">Εύρεση τιμής</button>
    </div>
    <div class="noBorderDiv bottom" v-show="showFindPrice">
      <form v-show="!showLocationPick && showGetPrice"  v-on:submit="getPricesFixed">
            <input type="number" step='1' min='1' name="distance" placeholder="Μέγιστη απόσταση"/><br>
            <select name="productPick">
              <option value="e95">Βενζίνη 95 οκτανίων</option>
              <option value="e100">Βενζίνη 100 οκτανίων</option>
              <option value="Diesel">Diesel</option>
              <option value="LPG">LPG</option>
            </select>
            <br>
            <input type="date" v-model="dateData"/><br>
            <input class="button small" type="submit" value="Αναζήτηση"/><br>
            <input class="button small" type="submit" value="Άκυρο"/><br>
      </form>
    </div>
    <form v-on:submit="directions">
      <button class="noBorderDiv midRight" @click="directions">&#128663;</button>
    </form>
    <gmap-map ref="mapRef"
      :options="{
        mapTypeControl: false
      }"
      :center="center"
      :zoom="9"
      style="width:100%;  height: 100%; position: absolute; left:0; top:0;z-index: -1;"
      mapTypeControl=false

    >
      <gmap-info-window :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="infoWinOpen=false">
        {{infoContent}}
      </gmap-info-window>
      <gmap-marker
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        :clickable="true"
        @click="toggleInfoWindow(m,index)"
      ></gmap-marker>
    </gmap-map>


    <!--<a :href="'https://www.google.com/maps/search/?api=1&query=' + '39,23'" target="_blank">ddddirecetions</a> -->
  </div>
</template>

<script>
import helper from "./HelperFuncts";
import axios from "axios";
export default {
  name: "GoogleMap",
  // computed: {
  //   compPrice: {
  //     get(){
  //       if(this.price.length < 1){
  //         return 0
  //       }
  //       alert(this.price);
  //       return this.price.replace(",", ".");
  //     },
  //     set(newValue){
  //       this.price = newValue.replace(",", ".")
  //     } 
  //    }
  // },
  data() {
    return {
      product_ids:{},
      textResponse:'',
      showLocationPick:true,
      price:"0.1",
      dateData:{},
      // default to NTUA to keep it simple
      // change this to whatever makes sense
      center: { lat: 37.9792049, lng: 23.7830976 },
      markers: [],
      places: [],
      currentPlace: null,
      infoContent: '',
      infoWindowPos: null,
      infoWinOpen: false,
      currentMidx: null,
      //optional: offset infowindow so it visually sits nicely on top of our marker
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35
        }
      },
      data: [],
      showCenterMark: false,
      showAddPrice: false,
      showFindPrice: false,
      shop:{},
      postProductId: {},
      postShopData: {},
      postPriceData: {},
      isWrong: true,
      showGetPrice: false,
      mobile: false
    };
  },

  mounted() {
    this.setTodayDate();
    this.getProducts();
    this.geolocate();
  },

  methods: {
    directions(e){
      e.preventDefault();
      this.mobile = (function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      })();
      if(this.mobile && this.infoWinOpen){
        location.href='geo:0,0?q='+this.infoWindowPos.lat+','+this.infoWindowPos.lng;
      } else {
        open='https://www.google.com/maps/search/?api=1&query=' + this.infoWindowPos.lat+','+this.infoWindowPos.lng;
      }
    },
    getProducts(){
      axios.get(helper.BASE_URL + '/products?start=0&count=30000')
        .then(res => {
          var t;
          for (var i = 0; i < res.data.total; i++) {
             t = res.data.products[i.toString()];
             if(t.name == 'e95' || t.name == 'e100' || t.name == 'Diesel' || t.name == 'LPG')
               this.product_ids[t.name] = t.id;
          }
          // console.log(this.product_ids.e100)
        })
    },
    setTodayDate(){
      this.dateData = (function() {
        var local = new Date();
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0,10);
      })();
    },
    getPrices(start, count, lon, lat, distanceInKm, dateFrom, dateTo, shopidFilter, productidFilter, sortby, tags){
        axios.get(helper.BASE_URL + '/prices?dateFrom='+ dateFrom
            + '&dateTo=' + dateTo
            + '&start=' + start
            + '&count=' + count
            + '&geoLat=' + lat
            + '&geoLng=' + lon
            + '&geoDist=' + distanceInKm
            + '&shops=' + shopidFilter
            + '&products=' +productidFilter
            + '&sort=' + sortby
            + '&tags=' + tags
            )
            .then(results=>{
                results.data.prices.forEach((element)=>{
                    this.data.push({
                      position: {lat: element.lat,lng: element.lon},
                      infoText: 'Πρατήριο:' + element.shopName +' Τιμή:' + element.price
                    })
                })
                this.markers = this.data;
                this.data = [];
                // console.log(this.markers[0].position)
                // console.log( this.networkInterfaces.wlp3s0 );
            })
            .catch(err =>{
                alert(err);
            })
    },
    // receives a place object via the autocomplete component
    setPlace(place) {
      this.currentPlace = place;
    },
    addMarker() {
      if (this.currentPlace) {
        const marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng()
        };
        this.markers.push({ position: marker });
        this.places.push(this.currentPlace);
        this.center = marker;
        this.currentPlace = null;
      }
    },
    addMarkerDeleteOthers() {
      if (this.currentPlace) {
        const marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng()
        };
        this.markers= [{ position: marker }];
        this.places=[this.currentPlace];
        this.center = marker;
        this.currentPlace = null;
        this.$refs.mapRef.$mapPromise.then((map) => {
          map.panTo(this.center);
        })
      }
    },
    addMarkerDeleteOthersCustom() {
      const marker = {
        lat: this.center.lat,
        lng: this.center.lng
      };
      this.markers= [{ position: marker }];
      // this.places=[this.currentPlace];
      this.center = marker;
      this.currentPlace = null;
      this.$refs.mapRef.$mapPromise.then((map) => {
        map.panTo(this.center);
      })
    },
    geolocate: function() {
      navigator.geolocation.getCurrentPosition(position => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
    },
    toggleInfoWindow: function(marker, idx) {
      this.infoWindowPos = marker.position;
      this.infoContent = marker.infoText;
      //check if its the same marker that was selected if yes toggle
      if (this.currentMidx == idx) {
        this.infoWinOpen = !this.infoWinOpen;
      }
      //if different marker set infowindow to open and reset current marker index
      else {
        this.infoWinOpen = true;
        this.currentMidx = idx;
      }
    },
    centerMarker: function(e){
      this.$refs.mapRef.$mapPromise.then((map) => {
        //map.getCenter().toString());
//        this.markers.push({ position: map.getCenter() });
//        map.panTo({lat: 1.38, lng: 103.80})
        
      })
    },
    geolocatePan: function(){
      this.geolocate();
      this.addMarkerDeleteOthersCustom();
    },
    toggleAddPrice: function(){
      this.showAddPrice = !this.showAddPrice;
    },
    getPricesFixed(e){
      e.preventDefault();
      if(e.explicitOriginalTarget.defaultValue == 'Άκυρο'){
        this.shop = {};
        this.showFindPrice = false;
        this.showCenterMark = false;
        this.showAddPrice = false;
        this.showLocationPick = true;
      }
      if(e.explicitOriginalTarget.defaultValue == 'Αναζήτηση'){
        this.getPrices(0, 500, this.shop.lng, this.shop.lat,
              e.target.elements.distance.value||700, this.dateData, this.dateData,
              '', this.product_ids[e.target.elements.productPick.value], 'price|asc','');
        this.shop = {};
        this.showFindPrice = false;
        this.showCenterMark = false;
        this.showAddPrice = false;
        this.showLocationPick = true;
      }
    },
    addPrice(e){
      e.preventDefault();
      if(e.explicitOriginalTarget.defaultValue == 'Άκυρο'){
        this.shop = {};
        this.showAddPrice = false;
        this.showCenterMark = false;
        this.showFindPrice = false;
        this.showLocationPick = true;
      }
      if(e.explicitOriginalTarget.defaultValue == 'Προσθήκη'){
        // console.log(e.target.elements.productPick.value);
        this.postShopData = {
          name: e.target.elements.shopName.value,
          address: '-',
          lng: this.shop.lng,
          lat: this.shop.lat,
          tags:['']
        }
        axios.post(helper.BASE_URL + '/authorized', null, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
          .then(res => {
            axios.post(helper.BASE_URL + '/shops', this.postShopData, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
              .then(shopRes => {
                this.isWrong = false;
                this.showAddPrice = false;
                this.showCenterMark = false;
                this.showLocationPick = true;
                this.showFindPrice = false;
                this.postPriceData = {
                  price: e.target.elements.priceName.value,
                  shopId: shopRes.data.id,
                  productId: this.product_ids[e.target.elements.productPick.value],
                  dateFrom: this.dateData,
                  dateTo: this.dateData
                }
                axios.post(helper.BASE_URL + '/prices', this.postPriceData, {headers: {'X-OBSERVATORY-AUTH':localStorage.token}})
                  .then(priceRes => {
                    // console.log(priceRes)
                    this.textResponse = 'Επιτυχής Προσθήκη';
                    setTimeout(() => { this.textResponse = ""; }, 2000);
                    this.shop = {};
                  })
                  .catch(err=>{
                    this.isWrong = true;
                    this.textResponse = 'Σφάλμα 2';
                    setTimeout(() => { this.textResponse = ""; }, 4000);
                  })
              })
              .catch(err=>{
                this.isWrong = true;
                this.textResponse = 'Κενό πεδίο';
                setTimeout(() => { this.textResponse = ""; }, 4000);
                this.shop = {};
                this.showAddPrice = false;
                this.showCenterMark = false;
                this.showLocationPick = true;
                this.showFindPrice = false;
              })
          })
          .catch((errors) => {
            this.isWrong = true;
            this.textResponse = 'Δεν επιτρέπεται η πρόσθεση τιμής σε μη εγγεγραμμένους χρήστες';
            setTimeout(() => { this.textResponse = ""; }, 4000);
            this.shop = {};
            this.showAddPrice = false;
            this.showCenterMark = false;
            this.showLocationPick = true;
            this.showFindPrice = false;
          })
      }
    },
    toggleLocationPickAndSetShop:function(){
      this.showLocationPick = !this.showLocationPick;
      this.$refs.mapRef.$mapPromise.then((map) => {
        this.center.lat = map.getCenter().lat();
        this.center.lng = map.getCenter().lng();
        this.addMarkerDeleteOthersCustom();
        this.shop = {
          lat: this.center.lat,
          lng: this.center.lng
        }
      }).catch(err => {
        alert(err);
      })
      ;
    
    },
    toggleAddPriceAndShowCenterMark:function(){
      this.showAddPrice = !this.showAddPrice;
      this.showFindPrice = !this.showFindPrice;
      this.showCenterMark =!this.showCenterMark;
      this.showGetPrice = false;
    },
    toggleFindPriceAndShowCenterMark(){
      this.showAddPrice = !this.showAddPrice;
      this.showFindPrice = !this.showFindPrice;
      this.showCenterMark =!this.showCenterMark;
      this.showGetPrice = true;
    },
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.marker {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.button {
  background-color: white; 
  color: black; 
  border: 2px solid #008CBA;
  padding: 10px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 12px;
  margin: 4px 2px;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
  cursor: pointer;
  opacity: 0.9;
}
.bottom {
  position: absolute;
  left: 50%;
  bottom: 5%;
  transform: translate(-50%, 0%);
}
.small {
  padding: 2px 0px;
}
.button:hover {
  background-color: #008CBA;
  color: white;
}
.top {
  top:10%;
  left: 50%;
  transform: translate(-50%, 0%);
  opacity: 0.9;
}
.leftBottom {
  bottom:3%;
  left:0%;
  display: inline-block;
}
.midRight{
  transform: translate(0%, 50%);
  padding: 12px 12px;
  top:12%;
  right:10px;
}

.midBottom{
  bottom:3%;
  left:50%;
  transform: translate(-50%, 0%);
  display: inline-block;
}
.middle {
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
}
.noBorderDiv{
  position:absolute;
}
.text {
  color: black;
  opacity: 0.9;
  display: inline-block;
  background-color: white;
  border-radius: 25px;
  border: 1px solid black;
  padding: 3px;
}
.wrongText{
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
  color: crimson;
  border-radius: 25px;
  padding: 5px;
  z-index: 100000;
}

.rightText{
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
  color: rgb(4, 238, 24);
  padding: 5px;
  z-index: 100000;
}
</style>
