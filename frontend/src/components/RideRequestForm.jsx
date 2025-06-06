import { useState, useEffect, useRef } from "react";
import { createRideRequest } from "../services/rideService";
import { useNavigate } from "react-router-dom";

const RideRequestForm = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [vehicleType, setVehicleType] = useState("");
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [pickupMarker, setPickupMarker] = useState(null);
  const [dropoffMarker, setDropoffMarker] = useState(null);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.google && window.google.maps) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });
      setMap(newMap);

      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer();
      newDirectionsRenderer.setMap(newMap);
      setDirectionsRenderer(newDirectionsRenderer);

      const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupRef.current, {
        types: ["geocode"],
      });
      const dropoffAutocomplete = new window.google.maps.places.Autocomplete(dropoffRef.current, {
        types: ["geocode"],
      });

      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();
        if (place.geometry) {
          setPickupLocation(place.formatted_address);
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setPickupCoords(coords);
        }
      });

      dropoffAutocomplete.addListener("place_changed", () => {
        const place = dropoffAutocomplete.getPlace();
        if (place.geometry) {
          setDropoffLocation(place.formatted_address);
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setDropoffCoords(coords);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (pickupCoords && map) {
      if (pickupMarker) pickupMarker.setMap(null);
      const marker = new window.google.maps.Marker({
        position: pickupCoords,
        map,
        title: "Pickup Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      });
      setPickupMarker(marker);
    }
  }, [pickupCoords]);

  useEffect(() => {
    if (dropoffCoords && map) {
      if (dropoffMarker) dropoffMarker.setMap(null);
      const marker = new window.google.maps.Marker({
        position: dropoffCoords,
        map,
        title: "Dropoff Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      });
      setDropoffMarker(marker);
    }
  }, [dropoffCoords]);

  useEffect(() => {
    if (pickupCoords && dropoffCoords && directionsRenderer) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: "DRIVING",
        },
        (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);
            map.setCenter(pickupCoords);
            map.setZoom(12);

            const leg = result.routes[0].legs[0];
            setDistanceInfo({
              distance: leg.distance.text,
              duration: leg.duration.text,
            });
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    }
  }, [pickupCoords, dropoffCoords, directionsRenderer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupCoords || !dropoffCoords) {
      alert("Please select valid pickup and dropoff locations from suggestions.");
      return;
    }
    if (!vehicleType) {
      alert("Please select a vehicle type.");
      return;
    }

    try {
      await createRideRequest({
        pickupLocation,
        dropoffLocation,
        pickupCoordinates: pickupCoords,
        dropoffCoordinates: dropoffCoords,
        vehicleType,
        ...distanceInfo,
      });
      navigate("/home");
    } catch (error) {
      console.error(error.response?.data?.error || "Error creating ride");
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickupCoords(coords);

        try {
          const reverseRes = await fetch(
            `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${import.meta.env.VITE_GOMAPS_API_KEY}`
          );
          const reverseData = await reverseRes.json();

          if (
            reverseData.status === "OK" &&
            reverseData.results &&
            reverseData.results.length > 0
          ) {
            const address = reverseData.results[0].formatted_address;
            setPickupLocation(address);
            if (pickupRef.current) {
              pickupRef.current.value = address;
            }
          } else {
            alert("Could not get a valid address.");
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          alert("Error getting address.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get current location.");
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 shadow-lg rounded-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Request a Ride</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                placeholder="Enter pickup location"
                ref={pickupRef}
                defaultValue={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="bg-[#eeeeee] mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
                required
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Use current location
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff Location
              </label>
              <input
                type="text"
                placeholder="Enter dropoff location"
                ref={dropoffRef}
                defaultValue={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="bg-[#eeeeee] mb-2 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="bg-[#eeeeee] mb-2 rounded-lg px-4 py-2 border w-full text-lg"
                required
              >
                   <option value="" disabled>
                    🚗 Select Vehicle Type
                  </option>
                  <option value="car">🚘 Car</option>
                  <option value="auto">🛺 Auto</option>
                  <option value="moto">🏍️ Moto</option>
          
              </select>
            </div>

            {distanceInfo && (
              <div className="text-sm text-gray-600">
                Distance: <strong>{distanceInfo.distance}</strong> <br />
                Estimated Time: <strong>{distanceInfo.duration}</strong>
              </div>
            )}
            <button
              type="submit"
              className="bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg"
            >
              Request Ride
            </button>
          </form>
        </div>

        {/* Map Section */}
        <div className="rounded-xl shadow-lg overflow-hidden">
          <div ref={mapRef} className="w-full h-[450px]" />
        </div>
      </div>
    </div>
  );
};

export default RideRequestForm;
