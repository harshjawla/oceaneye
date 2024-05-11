import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { useEffect } from "react";
import GeoJSONTerminator from "@webgeodatavore/geojson.terminator";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import ZoneData from "./JSON/ZoneData.json";

mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_API;

export default function TimeZone() {

  function getTimezoneInfo(timezone) {
    const currentTime = moment()
      .tz(timezone)
      .format("YYYY-MM-DD HH:mm:ss");
    return currentTime;
  }

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-103.5917, 40.6699],
      zoom: 3,
    });

    map.on("load", () => {
      var geoJSONDayNight = new GeoJSONTerminator();

      map.addLayer({
        id: "daynight",
        type: "fill",
        source: {
          type: "geojson",
          data: geoJSONDayNight,
        },
        layout: {},
        paint: {
          "fill-color": "#000",
          "fill-opacity": 0.2,
        },
      });

      map.addSource("earthquakes", {
        type: "geojson",
        data: ZoneData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "earthquakes",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#FFA500",
            100,
            "#FFA500",
            750,
            "#FFA500",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "earthquakes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "earthquakes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#FFA500",
          "circle-radius": 5,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      // inspect a cluster on click
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map
          .getSource("earthquakes")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      map.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const zone = e.features[0].properties.timezone;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`Time Zone: ${zone}<br>Current Time: ${getTimezoneInfo(zone)}`)
          .addTo(map);
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-night">
      <div className="flex w-full justify-between items-center my-10">
        <Link to="/" className="font-oswald text-light ml-10 text-4xl">
          IT'S CLASSIFIED!
        </Link>
        <Link
          to="/"
          className="font-sans text-base text-white mr-10 p-2 bg-evening border rounded-lg"
        >
          Show Ports/Ships
        </Link>
      </div>
      <div
        id="map"
        className="h-4/5 w-4/5 border-evening border-8 rounded-xl"
      ></div>
      <div className="w-full my-10 bg-night">
        <ul className="ml-44 font-oswald text-white text-2xl">
          <div className="inline-block h-4 w-4 rounded-full bg-orange-600"></div>{" "}
          : Represents TimeZones
        </ul>
        <ul className="ml-44 mt-3 font-oswald text-white text-2xl"><span className="font-oswald text-light">NOTE: </span> For Viewing current time of any timezone click on the orange circle  of that TimeZone</ul>
      </div>
    </div>
  );
}
