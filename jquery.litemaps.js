/*
 *  LiteMaps is a Google Maps Plugin for jQuery
 *  Version   : 0.1-alpha2-dev
 *  Licence   : GPL v3 : http://www.gnu.org/licenses/gpl.html  
 *  Author    : Sergio Jovani
 *  Contact   : lesergi@gmail.com
 *  Web site  : http://github.com/lesergi/jquery.litemaps
 *   
 *  Copyright (c) 2011 Sergio Jovani
 *  All rights reserved.
 *   
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 * 
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above 
 *     copyright notice, this list of conditions and the following 
 *     disclaimer in the documentation and/or other materials provided 
 *     with the distribution.
 *   - Neither the name of the author nor the names of its contributors 
 *     may be used to endorse or promote products derived from this 
 *     software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */
 
 (function($){
   var litemaps = {
     
     /**
      * Incrementable ID for maps
      */
     mapid: 0,
     
     /**
      * Limits for maps
      */
     limits: {},
     
     /**
      * Initialization function
      */
     init: function(e) {
       litemaps.setSize(e, litemaps.options.width, litemaps.options.height);
       litemaps.setMapId(e);
       
       if (litemaps.options.staticmap) {
         return litemaps.staticmap(e);
       }
       
       var map = new google.maps.Map(e.get(0), litemaps.options);
       litemaps.setMap(e, map);
       litemaps.setMarkers(e);
     },
     
     /**
      * Return an array with default values. Also this define the allowed parameters.
      */
     defaults: function() {
       return {
         zoom: 'auto',
         center: 'auto',
         type: 'roadmap',
         markers: new Array(),
         height: '600px',
         width: '800px',
         staticmap: false
       };
     },
     
     /**
      * Initialize options variables and perform some transformations
      */
     initOptions: function(options) {
       litemaps.options = {};
       
       var defaults = litemaps.defaults();
       
       //
       // Build options
       //
       $.each(defaults, function(option_id, option) {
         if (options[option_id]) {
           litemaps.options[option_id] = options[option_id];
         }
         else {
           litemaps.options[option_id] = defaults[option_id];
         }
       });
       
       // Static
       if (litemaps.options.staticmap) {
         return;
       }
       
       // Zoom
       litemaps.options._zoom = litemaps.options.zoom;
       litemaps.options.zoom = 15;
       
       // Center
       litemaps.options._center = litemaps.options.center;
       litemaps.options.center = new google.maps.LatLng(0, 0);
       
       var typeList = litemaps.getMapTypeList();
       litemaps.options.mapTypeId = typeList[litemaps.options.type];
     },
     
     /**
      * Set size of container
      */
     setSize: function(e) {
       e.width(litemaps.options.width);
       e.height(litemaps.options.height);
     },
     
     /**
      * Return a list of available types of map
      */
     getMapTypeList: function() {
       return {
         roadmap: google.maps.MapTypeId.ROADMAP,
         satellite: google.maps.MapTypeId.SATELLITE,
         hybrid: google.maps.MapTypeId.HYBRID,
         terrain: google.maps.MapTypeId.TERRAIN
       }
     },
     
     /**
      * Add markers to the map
      */
     setMarkers: function(e) {
       if (litemaps.options.markers.length > 0) {
         var mapid = litemaps.getMapId(e);
         var markers = litemaps.options.markers;
         litemaps.markers = {};
         litemaps.markers[mapid] = new Array();
         $.each(markers, function(marker_id, marker) { 
           if (marker.lat && marker.lng) {
             litemaps.addMarker(e, marker.lat, marker.lng, marker.content);
           }
           else {
             var address = marker.address ? marker.address : marker;
             var callback = function(position, ok) {
               if (ok) {
                 litemaps.addMarker(e, position.lat(), position.lng(), marker.content);
               }
               
               // All markers has been added and no geocoder request is pending
               if (! litemaps.geocodeIsPending() && markers.length == litemaps._markers) {
                 litemaps.eventMarkersAdded(e);
               }
             }

             litemaps.geocode(address, callback);
           }
           litemaps._markers++;
         });
       }
       
       // No geocoder request is pending
       if (! litemaps.geocodeIsPending()) {
         litemaps.eventMarkersAdded(e);
       }
     },
     
     /**
      * Add marker into map
      */
     addMarker: function(e, lat, lng, content) {
       var mapid = litemaps.getMapId(e);
       litemaps.markers[mapid].push({});
       var i = litemaps.markers[mapid].length - 1;
       
       litemaps.markers[mapid][i].marker = new google.maps.Marker({
           position: new google.maps.LatLng(lat, lng),
           map: litemaps.getMap(e)
       });     
       
       if (content) {
         litemaps.markers[mapid][i].infowindow = new google.maps.InfoWindow({
           content: content
         });
         
         google.maps.event.addListener(litemaps.markers[mapid][i].marker, 'click', function() {
           litemaps.markers[mapid][i].infowindow.open(litemaps.getMap(e), litemaps.markers[mapid][i].marker);
         });
       }
       
       return litemaps.markers[mapid][i];
     },
     _markers: 0,
     
     /**
      * Calculate the limits in order to set auto-zoom and auto-center
      */
     getLimits: function(e) {
       var mapid = litemaps.getMapId(e);
       if (! litemaps.limits[mapid]) {
         litemaps.limits[mapid] = new google.maps.LatLngBounds();
         if (litemaps.markers[mapid].length > 0) {
           $.each(litemaps.markers[mapid], function(marker_id, marker) {
             litemaps.limits[mapid].extend(marker.marker.getPosition());
           });
         }
       }
       
       return litemaps.limits[mapid];
     },
     
     /**
      * Set the center provided in options
      */
     setCenter: function(e) {
       var mapid = litemaps.getMapId(e);
       if (litemaps.options._center == 'auto') {
         if (litemaps.markers[mapid].length == 1) {
           var marker = litemaps.markers[mapid][0].marker;
           litemaps.getMap(e).setCenter(marker.getPosition());
         }
         else if (litemaps.markers[mapid].length > 0) {
           litemaps.getMap(e).setCenter(litemaps.getLimits(e).getCenter());
         }
       }
       else if (litemaps.options._center.lat && litemaps.options._center.lng) {
         litemaps.getMap(e).setCenter(new google.maps.LatLng(litemaps.options._center.lat, litemaps.options._center.lng));
       }
       else {
         var address = litemaps.options._center;
         var callback = function(position, ok) {
           if (ok) {
             var lat = position.lat();
             var lng = position.lng();
           }
           else {
             var lat = 0;
             var lng = 0;
           }
           
           litemaps.options._center = {};
           litemaps.options._center.lat = lat;
           litemaps.options._center.lng = lng;
           litemaps.setCenter(e);
         }
         litemaps.geocode(address, callback);
       }
     },

     /**
      * Set the center provided in options
      */
     setZoom: function(e) {
       var mapid = litemaps.getMapId(e);
       if (litemaps.options._zoom == 'auto') {
         if (litemaps.markers[mapid].length > 1) {
           litemaps.getMap(e).fitBounds(litemaps.getLimits(e));
         }
       }
       else {
         litemaps.getMap(e).setZoom(litemaps.options._zoom);
       }
     },

     /**
      * Geocode asyncroniously an address. Return google.maps.LatLng object.
      */
     geocode: function(address, callback) {       
       if (! litemaps._geocoder) {
         litemaps._geocoder = new google.maps.Geocoder();
       }
       
       var _callback = function(results, status) {
         litemaps._geocodeRequests--;
         
         var position;
         var ok = false;
         
         if (status == google.maps.GeocoderStatus.OK) {
           var position = results[0].geometry.location;
           var ok = true;
         }
           
         callback(position, ok);
       }
       
       litemaps._geocodeRequests++;
       litemaps._geocoder.geocode({address: address}, _callback);
       
       return litemaps._geocoder;
     },
     _geocodeRequests: 0,
     geocodeIsPending: function() {
       return litemaps._geocodeRequests > 0;
     },
     
     /**
      * Triggered when all markers are added to map
      */
     eventMarkersAdded: function(e) {
       litemaps.setCenter(e);
       litemaps.setZoom(e);
     },
     
     /**
      * Static Maps function. Insert a static map into element.
      */
     staticmap: function(e) {
       var url = "http://maps.google.com/maps/api/staticmap";
       var query = ['sensor=false'];
       
       // Size
       query.push('size=' + litemaps.options.width + 'x' + litemaps.options.height);
       
       // Type
       query.push('maptype=' + litemaps.options.type);
       
       // Markers
       var markers = new Array();
       $.each(litemaps.options.markers, function(marker_id, marker) {
         if (marker.lat && marker.lng) {
           markers.push(marker.lat + "," + marker.lng);
         }
         else if (marker.address) {
           markers.push(marker.address);
         }
         else {
           markers.push(marker);
         }
       });
       
       if (markers.length > 0) {
         markers = markers.join('|');
         query.push('markers=' + markers);
       }
       
       // Center
       if (litemaps.options.center != 'auto') {
         if (litemaps.options.center.lat && litemaps.options.center.lng) {
           query.push('center=' + litemaps.options.center.lat + ',' + litemaps.options.center.lng);
         }
         else {
           query.push('center=' + litemaps.options.center);
         }
       }
       
       // Zoom
       if (litemaps.options.zoom != 'auto') {
         query.push('zoom=' + litemaps.options.zoom);
       }
       
       $.each(litemaps.options, function(option_id, option) {
         switch(option_id) {
           case 'markers':
             
             break;
             
           case 'height':
         }
       });
       
       url = url + "?" + query.join('&');
       var html = '<img src="' + url + '" alt="jQuery LiteMaps (http://github.com/lesergi/jquery.litemaps)" />';
       
       litemaps.setMap(e, html);
       e.html(html);
     },
     
     setMap: function(e, map) {
       e.data('litemaps_map', map);
     },
     
     getMap: function(e) {
       return e.data('litemaps_map');
     },
     
     setMapId: function(e) {
       e.data('litemaps_id', litemaps.mapid++);
     },
     
     getMapId: function(e) {
       return e.data('litemaps_id');
     }     
   };

   $.fn.litemaps = function() {
     var options = {};
     
     if (arguments[0]) {
       options = arguments[0];
     }

     litemaps.initOptions(options);

     $.each(this, function(){
       e = $(this);
       litemaps.init(e);
     });
   };
 })(jQuery);