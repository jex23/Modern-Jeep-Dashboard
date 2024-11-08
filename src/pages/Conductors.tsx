import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { IoClose } from 'react-icons/io5'; // Import the IoClose icon
import 'bootstrap/dist/css/bootstrap.min.css';

interface Conductor {
  id: string;
  name: string;
  busNumber: number;
  email: string;
  busType: string;
}

const Conductor: React.FC = () => {
  const { register, handleSubmit, reset } = useForm();
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [nextBusNumber, setNextBusNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Conductors'), (snapshot) => {
      const conductorsList: Conductor[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Conductor));
      setConductors(conductorsList);
    });

    const getLastBusNumber = async () => {
      const q = query(collection(db, 'Conductors'), orderBy('busNumber', 'desc'), limit(1));
      onSnapshot(q, (snapshot) => {
        const lastBus = snapshot.docs[0]?.data();
        const highestBusNumber = lastBus ? lastBus.busNumber : 0;
        setNextBusNumber(highestBusNumber + 1);
      });
    };

    getLastBusNumber();
    return () => unsubscribe();
  }, []);

  const addConductor = async (data: any) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      await addDoc(collection(db, 'Conductors'), {
        name: data.name,
        busNumber: nextBusNumber,
        email: data.email,
        busType: data.busType,
        busLocation: "",
      });
      setNextBusNumber((prev) => prev + 1);
      reset();
      setShowModal(false); // Close the modal after successful submission
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Error adding conductor: ', error);
    }
  };

  const deleteConductor = async (id: string, email: string) => {
    try {
      await deleteDoc(doc(db, 'Conductors', id));
      const user = auth.currentUser;
      if (user && user.email === email) {
        await deleteUser(user);
      }
    } catch (error) {
      console.error('Error deleting conductor: ', error);
    }
  };

  return (
    <div>
      <h2>Conductor Page</h2>
      <p>Information for the conductor.</p>

      {/* Button to open the modal */}
      <button className="btn btn-primary mb-4" onClick={() => setShowModal(true)}>Add User</button>

      {/* Display error message */}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* List of conductors */}
      <h3 className="mt-4">Conductor List</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Bus Number</th>
            <th>Email</th>
            <th>Bus Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {conductors.map((conductor) => (
            <tr key={conductor.id}>
              <td>{conductor.name}</td>
              <td>{conductor.busNumber}</td>
              <td>{conductor.email}</td>
              <td>{conductor.busType}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => deleteConductor(conductor.id, conductor.email)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bootstrap Modal for Adding User */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex={-1} role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New User</h5>
              {/* Close button using React Icon */}
              <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close" style={{ position: 'absolute', right: '10px', top: '10px' }}>
                <IoClose size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(addConductor)}>
                <div className="form-group mb-3">
                  <label>Name:</label>
                  <input type="text" className="form-control" {...register('name', { required: true })} />
                </div>
                <div className="form-group mb-3">
                  <label>Email:</label>
                  <input type="email" className="form-control" {...register('email', { required: true })} />
                </div>
                <div className="form-group mb-3">
                  <label>Password:</label>
                  <input type="password" className="form-control" {...register('password', { required: true })} />
                </div>
                <div className="form-group mb-3">
                  <label>Bus Type:</label>
                  <select className="form-control" {...register('busType', { required: true })}>
                    <option value="Bulan">Bulan</option>
                    <option value="Matnog">Matnog</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Add User</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-backdrop fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} />
    </div>
  );
};

export default Conductor;
