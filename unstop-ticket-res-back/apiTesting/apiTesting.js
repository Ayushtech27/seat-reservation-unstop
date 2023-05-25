const axios = require('axios');

axios
  .get('http://localhost:8000/api/seats')
  .then(response => {
    const availableSeats = response.data;
    console.log('Available Seats:', availableSeats);

    // Convert seat numbers to strings
    const seatNumbers = [1, 2].map(number => number.toString());

    axios
      .post('http://localhost:8000/api/reservations', { seatNumbers })
      .then(response => {
        console.log('Reservation response:', response.data);
      })
      .catch(error => {
        if (error.response && error.response.data) {
          console.log('Error making reservation:', error.response.data);
        } else {
          console.log('Error making reservation:', error.message);
        }
      });
  })
  .catch(error => {
    if (error.response && error.response.data) {
      console.log('Error retrieving available seats:', error.response.data);
    } else {
      console.log('Error retrieving available seats:', error.message);
    }
  });
