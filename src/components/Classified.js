import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { useEffect } from "react";
import portLocation from "./JSON/geojson_data_ports.json";
import shipLocation from "./JSON/ship_data.json";
import GeoJSONTerminator from "@webgeodatavore/geojson.terminator";
import { Link } from "react-router-dom";


mapboxgl.accessToken =
  process.env.REACT_APP_MAPBOX_API;

export default function Classified() {
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
        data: portLocation,
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
            "#51bbd6",
            100,
            "#51bbd6",
            750,
            "#51bbd6",
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
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.addSource("newData", {
        type: "geojson",
        data: shipLocation,
      });

      // Layer for the Ships Data
      map.addLayer({
        id: "newData-layer",
        type: "circle",
        source: "newData",
        paint: {
          "circle-color": "#ff0000",
          "circle-radius": 6,
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
        const Port_Name = e.features[0].properties.port_name;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`Port Name: ${Port_Name}`)
          .addTo(map);
      });

      map.on("click", "newData-layer", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const ship = e.features[0].properties.site_name;
        const nextDst = e.features[0].properties.heading;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`Enemy Ship No.: ${ship}<br>Heading Towards: ${nextDst}`)
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
          to="/timezone"
          className="font-sans text-base text-white mr-10 p-2 bg-evening border rounded-lg"
        >
          Show TimeZones
        </Link>
      </div>
      <div
        id="map"
        className="h-4/5 w-4/5 border-evening border-8 rounded-xl"
      ></div>
      <div className="w-full my-10 bg-night">
        <ul className="ml-44 font-oswald text-white text-2xl">
          <div className="inline-block h-4 w-4 rounded-full bg-blue-500"></div>{" "}
          : Represents Ports
        </ul>
        <ul className="ml-44 py-4 font-oswald text-white text-2xl">
          <div className="inline-block h-4 w-4 rounded-full bg-red-500"></div> :
          Represents Ships
        </ul>
      </div>
    </div>
  );
}
