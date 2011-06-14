# jQuery LiteMaps

## Description

**LiteMaps** is a [jQuery](http://jquery.com) plugin for use [Google Maps](http://maps.google.com) in a quick and easy way.

## Requirements

In order to use **LiteMaps** you have to include the following libraries as JavaScript scripts:

* [Google Maps](http://maps.google.com/maps/api/js?sensor=false)
* [jQuery](http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js)
* [LiteMaps](jquery.litemaps.js)

Example:

    <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
    <script type="text/javascript" src="jquery.litemaps.js"></script>


## Usage

Example:

    <script type="text/javascript">
      $(document).ready(function(){
        $('#map').litemaps({
          width: '800px',
          height: '600px',
          markers:[
            'Carrer Colon, Valencia, Spain',
            {address: 'Avinguda Diagonal, Barcelona, Spain', content: 'This is the content of marker info window'},
            {lat: 40.42052, lng: -3.70181}
          ]
        });
      });
    </script>
    
### Options:

* **width**

    The width of map. Integer (will be interpreted as "px"), string with size in "px" or "%" are allowed.
    
    **Note**: For static maps (see "staticmap" option below) only integer value is allowed.

    *Default: "800px"*

* **height**

    The height of map. Integer (will be interpreted as "px"), string with size in "px" or "%" are allowed.
    
    **Note**: For static maps (see "staticmap" option below) only integer value is allowed.

    *Default: "600px"*

* **zoom**

    Level of zoom applied to map. Set "auto" value to set an automatic zoom in order to show all markers (combine with `center: "auto"`).

    *Default: "auto"*

* **center**

    Position to center the map. Address string, dict with structure `{lat: float, lng: float}` or "auto" (combine with `zoom: "auto"`) values are allowed. 

    *Default: "auto"*

* **type**

    Map type string. Available options are: roadmap, satellite, hybrid, terrain.

    *Default: "roadmap"*
    
* **staticmap**

    Show a map image using [Google Static Maps API](http://code.google.com/intl/es/apis/maps/documentation/staticmaps). Boolean values (true or false) are allowed.
    
    *Default: false*

* **markers**

    An array with the markers. Address string, `{address: string, content: string}` or `{lat: float, lng: float, content: string}` are allowed.
    
    *Default: Array()*
