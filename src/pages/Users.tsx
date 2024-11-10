import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { IoClose } from "react-icons/io5"; // Import the IoClose icon
import "bootstrap/dist/css/bootstrap.min.css";

interface Passenger {
  id: string;
  email: string;
  fullName: string;
  passengerType: string;
}

const User: React.FC = () => {
  const { register, handleSubmit, reset } = useForm();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility
  const [error, setError] = useState<string | null>(null);

  // Fetching passengers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Passengers"), (snapshot) => {
      const passengersList: Passenger[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Passenger)
      );
      setPassengers(passengersList);
    });

    return () => unsubscribe();
  }, []);

  const addPassenger = async (data: any) => {
    try {
      setError(null);
      await addDoc(collection(db, "Passengers"), {
        email: data.email,
        fullName: data.fullName,
        passengerType: data.passengerType,
      });
      reset();
      setShowModal(false); // Close the modal after successful submission
    } catch (error: any) {
      console.error("Error adding passenger: ", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2 className="mt-4">User Management</h2>

      {/* Button to open the modal */}
      <button
        className="btn btn-primary mb-4"
        onClick={() => setShowModal(true)}
      >
        Add User
      </button>

      {/* Display error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* List of passengers */}
      <h3 className="mt-4">Passenger List</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Passenger Type</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger) => (
            <tr key={passenger.id}>
              <td>{passenger.email}</td>
              <td>{passenger.fullName}</td>
              <td>{passenger.passengerType}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bootstrap Modal for Adding User */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New User</h5>
              {/* Close button using React Icon */}
              <button
                type="button"
                className="close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                style={{ position: "absolute", right: "10px", top: "10px" }}
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(addPassenger)}>
                <div className="form-group mb-3">
                  <label>Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    {...register("email", { required: true })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("fullName", { required: true })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Passenger Type:</label>
                  <select
                    className="form-control"
                    {...register("passengerType", { required: true })}
                  >
                    <option value="Regular">Regular</option>
                    <option value="Student">Student</option>
                    <option value="PWD">PWD</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  Add User
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal-backdrop fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
      />
    </div>
  );
};

export default User;
  