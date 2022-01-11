import React from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { formatRelative } from "date-fns";

import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";
import axios from "axios";

const libraries = ["places"];
const mapContainerStyle = {
  height: "100vh",
  width: "100vw",
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};
const center = {
  lat: 47.0666,
  lng: 21.9333,
};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCqzm6FpKHAsKPvHHf3hb77pSt4sUx21oY',
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  React.useEffect( () => {
   axios.get('https://ambrosia-1641767547747.azurewebsites.net/ambrosia').then(response => {
      const data = response.data;
      const newMarkers = data.map(item => {
        return {
          lat: parseFloat(item['Latitude']),
          lng: parseFloat(item['Longitude']),
          time: new Date()
        }
      })
      setMarkers([...markers, ...newMarkers])
   })
  }, [])

  const onMapClick = React.useCallback((e) => {
    const current = new Date();
    const date = `${current.getFullYear()}-0${current.getMonth()+1}-${current.getDate()}`;
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    const time = date
    const newMarker = {
      Latitude: `${lat}`,
      Longitude: `${lng}`,
      Timestamp: time
    }
    const postMarker = JSON.stringify(newMarker)
    console.log(postMarker)
    axios.post('https://ambrosia-1641767547747.azurewebsites.net/ambrosia', postMarker, {
      headers: {
        'Content-Type': 'application/json',
    }
      
    })
    
    setMarkers((current) => [
      ...current,
      {
        lat: lat,
        lng: lng,
        time: new Date(),
      },
    ]);

    // axios.post('https://ambrosia-1641767547747.azurewebsites.net/ambrosia').then()
  }, []);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <h1>
        Ambrosia{" "}
        <span role="img" aria-label="tent">
          ⛺️
        </span>
      </h1>

      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lng}-${index}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelected(marker);
            }}
            icon={{
              url: `/compass.svg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        ))}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>
                <span role="img" aria-label="bear">
                    📌 
                </span>{" "}
                Alert
              </h2>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}
