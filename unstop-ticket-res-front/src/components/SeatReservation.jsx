import React, { useState, useEffect } from 'react';
import "./seatReservation.css";

const SeatReservation = () => {
  const [seats, setSeats] = useState([]);
  const [numSeats, setNumSeats] = useState(0);
  const [reservedSeatNumbers, setReservedSeatNumbers] = useState([]);

  useEffect(() => {
    fetchSeats();
  }, []);

  // Function to fetch available seats from the API
  const fetchSeats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/seats');
      const seatsData = await response.json();
      const availableSeats = seatsData.filter((seat) => seat.available);
      setSeats(availableSeats);
    } catch (error) {
      console.error('Error retrieving available seats:', error);
    }
  };

  // Function to handle the input change for the number of seats to book
  const handleNumSeatsChange = (e) => {
    setNumSeats(parseInt(e.target.value));
  };

  // Function to handle seat reservation
  const reserveSeats = async () => {
    if (numSeats <= 0 || numSeats > 7) {
      alert('Please enter a valid number of seats (1-7).');
      return;
    }

    const reservedSeats = reserveSeatsInRow(numSeats);
    if (reservedSeats.length === numSeats) {
      const reservedSeatNumbers = reservedSeats.map((seat) => seat.number);
      setReservedSeatNumbers(reservedSeatNumbers);
      await updateReservedSeatsInDB(reservedSeatNumbers);
    } else {
      alert(`Could not reserve ${numSeats} seats. Please try again.`);
    }
  };

  // Function to reserve seats in one row if available
  const reserveSeatsInRow = (numSeats) => {
    let rowSeats = [];
    for (let i = 0; i < seats.length; i++) {
      if (seats[i].available) {
        rowSeats.push(seats[i]);
        if (rowSeats.length === numSeats) {
          markSeatsAsReserved(rowSeats);
          return rowSeats;
        }
      } else {
        rowSeats = [];
      }
    }
    return [];
  };

  // Function to mark seats as reserved
  const markSeatsAsReserved = (reservedSeats) => {
    const updatedSeats = seats.map((seat) => {
      if (reservedSeats.some((reservedSeat) => reservedSeat._id === seat._id)) {
        return { ...seat, available: false };
      }
      return seat;
    });
    setSeats(updatedSeats);
  };

  // Function to update reserved seats in the database
  const updateReservedSeatsInDB = async (reservedSeatNumbers) => {
    try {
      const response = await fetch('http://localhost:8000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatNumbers: reservedSeatNumbers }),
      });

      if (!response.ok) {
        console.error('Error making reservation:', response);
      }
    } catch (error) {
      console.error('Error making reservation:', error);
    }
  };

  return (
    <div>
      <h1 className="center-heading">Seat Reservation</h1>
      <div className="container">
        <h2 className="sub-heading">Available seat numbers:</h2>
        <div className="seat-container">
          {seats.map((seat) => (
            <div
              key={seat._id}
              className={`seat ${seat.available ? '' : 'reserved'}`}
            >
              {seat.number}
            </div>
          ))}
        </div>
        <input
          type="number"
          className="num-seats-input"
          value={numSeats}
          onChange={handleNumSeatsChange}
          min="1"
          max="7"
        />
        <button className="reserve-button" onClick={reserveSeats}>
          Reserve Seats
        </button>
      </div>
      {reservedSeatNumbers.length > 0 && (
        <div className="reserved-seats">
          <h2>Reserved Seats:</h2>
          {reservedSeatNumbers.map((seatNumber) => (
            <div key={seatNumber} className="selected-seat">
              {seatNumber}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatReservation;
