<template>
  <div>
    <div class="marker">
      <img alt="custom marker" src="../assets/custoMarker.png">
    </div>
    <div>
      <h2>Search and add a pin</h2>
      <label>
        <gmap-autocomplete
          @place_changed="setPlace">
        </gmap-autocomplete>
        <button @click="addMarker">Add</button>
      </label>
      <br/>

    </div>
    <br>
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

    <div>
      <label>
        <button @click="centerMarker">directions</button>
      </label>
      <br/>
    </div>

    <!--<a :href="'https://www.google.com/maps/search/?api=1&query=' + '39,23'" target="_blank">ddddirecetions</a> -->
  </div>
</template>

<script>
import helper from "./HelperFuncts";
import axios from "axios";
export default {
  name: "GoogleMap",
  data() {
    return {
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
      networkInterfaces:{}
    };
  },

  mounted() {
    this.geolocate();
    this.getPrices(0,50,this.center.lng,this.center.lat,500,'1000-01-01','3000-01-01','','','dist|asc','');
  },

  methods: {
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
                      infoText: 'Τιμή:' + element.price
                    })
                })
                this.markers = this.data;
                console.log(this.markers[0].position)
                // console.log( this.networkInterfaces.wlp3s0 );
            })
            .catch(err =>{
                console.log(err);
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
        this.markers.push({ position: map.getCenter() });
//        map.panTo({lat: 1.38, lng: 103.80})
      })
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.marker {
  margin: 0;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
