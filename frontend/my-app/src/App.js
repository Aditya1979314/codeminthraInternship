import React, { useEffect, useState } from 'react';
import './App.css';
import BarChart from './Barchart.js';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [totaltransactions,settotaltransactions] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

  // Fetch data based on selected month
  useEffect(() => {
    async function fetchData() {
      try{
        const response = await fetch(`http://localhost:3000/finalresponse?month=${selectedMonth}`);
      const result = await response.json();
      setTransactions(result.transactions.result);
      settotaltransactions(result.totaltransactions.data);
      setBarChartData(result.barchart.data);
      }catch(err){
        console.log("some error occured");
      }
    }
    fetchData();
  }, [selectedMonth]);

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page whenever the search term changes
  };

  // Handle month selection change
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.price.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTransactions.slice(indexOfFirstRow, indexOfLastRow);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div className="App">
      <h1>Item List</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select value={selectedMonth} onChange={handleMonthChange}>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Description</th>
            <th>Image</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.price}</td>
              <td>{item.description}</td>
              <td>
                <img src={item.image} alt={item.title} width="50" height="50" />
              </td>
              <td>{new Date(item.dateofsale).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='buttons-table'>
        <button onClick={handlePrevious} disabled={currentPage === 1}>Previous</button>
        <span>{currentPage} of {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
      </div>
<div className='bottom-half'>
      {totaltransactions.length > 0 && (
        <div className='stats'>
          <h3>Statistics for Month - {months[selectedMonth-1]}</h3>
          <p><strong>Total Sale:</strong> {totaltransactions[0].total_sale_amount}</p>
          <p><strong>Total Sold Items:</strong> {totaltransactions[0].total_sold_items}</p>
          <p><strong>Total Not Sold Items:</strong> {totaltransactions[0].total_not_sold_items}</p>
        </div>
      )}

{barChartData.length > 0 && (
        <div className='barchart'>
          <h3>Price Range Distribution</h3>
          <BarChart data={barChartData} />
        </div>
      )}
      </div>
    </div>
  );
};

export default App;
