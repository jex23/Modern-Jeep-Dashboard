// src/pages/Fare.tsx

import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  limit,
} from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const Fare: React.FC = () => {
  const [route, setRoute] = useState<string>(""); // For selecting Bulan or Matnog for adding data
  const [selectedTab, setSelectedTab] = useState<string>("Bulan"); // For displaying Bulan or Matnog data
  const [km, setKm] = useState<number>(0); // Initial km starts at 0
  const [location, setLocation] = useState<string>(""); // For inputting location
  const [farePerKm, setFarePerKm] = useState<number>(0); // For fare per km
  const [first4KmPrice, setFirst4KmPrice] = useState<number>(0); // For price for first 4 km
  const [fareData, setFareData] = useState<{
    id: string;
    Km: number;
    Location: string;
  }[]>([]); // For displaying fare matrix data

  // Function to check and set initial kilometer count based on Firestore data
  const checkInitialKm = async (route: string) => {
    try {
      const routeDocRef = doc(collection(db, "fare_matrix"), route);
      const distancesCollection = collection(routeDocRef, "distances");
      const kmQuery = query(distancesCollection, orderBy("Km", "desc"), limit(1));
      const querySnapshot = await getDocs(kmQuery);

      if (!querySnapshot.empty) {
        const highestKm = querySnapshot.docs[0].data().Km;
        setKm(highestKm + 1); // Continue counting from the highest Km
      } else {
        setKm(0); // Start at 0 if no records exist
      }
    } catch (error) {
      console.error("Error checking initial kilometer:", error);
      setKm(0); // Fallback in case of error
    }
  };

  // Fetch and listen for fare per km rate from Firestore
  const fetchFarePerKm = async () => {
    try {
      const fareMatrixDocRef = doc(db, "fare_matrix", "fare_per_km");
      const unsubscribe = onSnapshot(fareMatrixDocRef, (fareDoc) => {
        if (fareDoc.exists()) {
          setFarePerKm(fareDoc.data().farePerKm);
          setFirst4KmPrice(fareDoc.data().first_4km_price || 0); // Set first 4 km price
        } else {
          setFarePerKm(0); // Handle case where document does not exist
          setFirst4KmPrice(0); // Reset if document does not exist
        }
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    } catch (error) {
      console.error("Error fetching fare per km:", error);
    }
  };

  // Call checkInitialKm and fetchFarePerKm when route is selected
  const handleRouteChange = (newRoute: string) => {
    setRoute(newRoute);
    setLocation("");
    if (newRoute) {
      checkInitialKm(newRoute);
    }
  };

  // Function to add a new km/location to Firestore
  const addToFareMatrix = async () => {
    if (!route || !location) {
      alert("Please select a route and enter a location.");
      return;
    }

    try {
      const routeDocRef = doc(collection(db, "fare_matrix"), route);
      const kmSubDocRef = doc(collection(routeDocRef, "distances"), `km_${km}`);

      await setDoc(kmSubDocRef, {
        Km: km,
        Location: location,
      });

      alert("Location added successfully!");
      setKm(km + 1); // Increment km for the next entry
      setLocation(""); // Reset location input
    } catch (error) {
      console.error("Error adding location to Firestore:", error);
      alert("Failed to add location. Please try again.");
    }
  };

  // Function to delete a document from Firestore and update Km count
  const deleteFromFareMatrix = async (id: string) => {
    try {
      const routeDocRef = doc(db, "fare_matrix", selectedTab);
      const kmSubDocRef = doc(routeDocRef, "distances", id);

      await deleteDoc(kmSubDocRef);
      alert("Location deleted successfully!");

      // Recheck the highest Km after deletion to update the km value
      checkInitialKm(selectedTab);
    } catch (error) {
      console.error("Error deleting location from Firestore:", error);
      alert("Failed to delete location. Please try again.");
    }
  };

  // Real-time listener for fare data based on selected tab
  useEffect(() => {
    if (selectedTab) {
      const routeDocRef = doc(db, "fare_matrix", selectedTab);
      const distancesCollection = collection(routeDocRef, "distances");
      const q = query(distancesCollection, orderBy("Km", "asc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as { id: string; Km: number; Location: string }[];
        setFareData(data);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [selectedTab]);

  // Update fare per km and first 4 km price in Firestore
  const updateFareDetails = async () => {
    try {
      const fareMatrixDocRef = doc(db, "fare_matrix", "fare_per_km");
      await setDoc(fareMatrixDocRef, { farePerKm, first_4km_price: first4KmPrice }, { merge: true });
      alert("Fare per kilometer and first 4 km price updated successfully!");
    } catch (error) {
      console.error("Error updating fare details:", error);
      alert("Failed to update fare details. Please try again.");
    }
  };

  // Initial fetch for fare per km
  useEffect(() => {
    fetchFarePerKm(); // Call fetchFarePerKm on component mount
  }, []);

  return (
    <div className="container my-4">
      <h1 className="mb-4">Fare Matrix</h1>

      {/* CSS Grid layout for input cards */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Add Distance</h5>
              <div className="mb-3">
                <label className="form-label">Select Route:</label>
                <select
                  value={route}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="form-select mb-3"
                >
                  <option value="">Select Route</option>
                  <option value="Bulan">Bulan</option>
                  <option value="Matnog">Matnog</option>
                </select>
              </div>
              {/* Display current Km */}
              <div className="mb-3">
                <label className="form-label">Km: {km}</label>
              </div>
              <input
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-control mb-3"
              />
              <button
                onClick={addToFareMatrix}
                className="btn btn-primary mb-2"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Fare Details</h5>
              <div className="mb-3">
                <label className="form-label">Fare per Km:</label>
                <input
                  type="number"
                  placeholder="Enter fare per km"
                  value={farePerKm}
                  onChange={(e) => setFarePerKm(Number(e.target.value))}
                  className="form-control mb-3"
                />
                <label className="form-label">First 4 Km Price:</label>
                <input
                  type="number"
                  placeholder="Enter first 4 km price"
                  value={first4KmPrice}
                  onChange={(e) => setFirst4KmPrice(Number(e.target.value))}
                  className="form-control mb-3"
                />
              </div>
              <button
                onClick={updateFareDetails}
                className="btn btn-primary"
              >
                Update Fare
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Tabs for switching between Bulan and Matnog */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a
            className={`nav-link ${selectedTab === "Bulan" ? "active" : ""}`}
            onClick={() => setSelectedTab("Bulan")}
            href="#"
          >
            Bulan
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${selectedTab === "Matnog" ? "active" : ""}`}
            onClick={() => setSelectedTab("Matnog")}
            href="#"
          >
            Matnog
          </a>
        </li>
      </ul>

      {/* Display Fare Data in a List */}
      <h4 className="mt-4">Fare Data for {selectedTab}</h4>
      <ul className="list-group">
        {fareData.map((data) => (
          <li key={data.id} className="list-group-item d-flex justify-content-between align-items-center">
            {data.Location} - {data.Km} Km
            <button
              onClick={() => deleteFromFareMatrix(data.id)}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Fare;
