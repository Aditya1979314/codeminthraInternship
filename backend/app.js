const express = require("express");
const cors = require("cors");
const {dbfunc,datarange} = require("./utils.js");
const app = express()
const port = 3000

app.use(cors());
app.use(express.json());

// app.get('/setupdb',  async (req, res) => {
// try{
//   const fetch = await import('node-fetch').then(module => module.default);
//     const result = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
//     const data = await result.json();
//       res.json({data});

//     const client = await dbfunc();
//     const tablecreatequery = `
//    CREATE TABLE Products (
//     id INT PRIMARY KEY,
//     title VARCHAR(255),
//     price DECIMAL(10, 2),
//     description TEXT,
//     category VARCHAR(255),
//     image VARCHAR(255),
//     sold BOOLEAN,
//     dateOfSale TIMESTAMP
// ); `;

// await client.query(tablecreatequery);
// console.log("table created");

// const insertQuery = `
//       INSERT INTO Products (id, title, price, description, category, image, sold, dateOfSale)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//     `;

// data.map(async (obj)=>{
//   const values = [
//     obj.id,
//     obj.title,
//     obj.price,
//     obj.description,
//     obj.category,
//     obj.image,
//     obj.sold,
//     new Date(obj.dateOfSale)
//   ];

//   await client.query(insertQuery,values);
// })

// console.log("data inserted in the table");


// }catch(err){
//     console.error("error occured",err);
//     res.status(500).json({erro:"internal server error"});
// }
// })

app.get('/transactions',async (req,res)=>{
  try{
const month = req.query.month;

const client = await dbfunc();

const selectquery = `
SELECT * 
FROM products
WHERE EXTRACT(MONTH FROM dateofsale) = ${month};
`;

const data = await client.query(selectquery);
res.status(200).json({result:data.rows});

  }catch(err){
    console.log("some error occured",err);
    res.status(500).json({msg:"some error occured"});
  }
})



app.get('/totaltransactions',async (req,res)=>{
  try{
    const month = req.query.month;
const client = await dbfunc();

const selectquery = `
SELECT
    SUM(CASE WHEN sold = TRUE THEN price::numeric ELSE 0 END) AS total_sale_amount,
    COUNT(CASE WHEN sold = TRUE THEN 1 ELSE NULL END) AS total_sold_items,
    COUNT(CASE WHEN sold = FALSE THEN 1 ELSE NULL END) AS total_not_sold_items
FROM Products
WHERE EXTRACT(MONTH FROM dateofsale) = ${month};
`;

const data = await client.query(selectquery);
res.status(200).json({data:data.rows});

  }catch(err){
    console.log("some error occured",err);
    res.status(500).json({msg:"some error occured"});
  }
})


app.get('/barchart',async(req,res)=>{
try{
  const month  = req.query.month;
  
  const data = await datarange(month);
  
  res.status(200).json({data:data.rows})
}catch(err){
  console.log("some error occured",err);
  res.status(500).json({msg:"some error occured"});
}
})

app.get('/piechart',async (req,res)=>{
  try{

    const month = req.query.month;
  
    const client = await dbfunc();
  
    const piequery = `
    SELECT
      category,
      COUNT(*) AS num_items
  FROM Products
  WHERE EXTRACT(MONTH FROM dateofsale) = ${month}
  GROUP BY category
  ORDER BY category;
    `;
  
    const data = await client.query(piequery);
  
    res.status(200).json({data:data.rows});
  }catch(err){
    console.log("some error occured",err);
    res.status(500).json({msg:"some error occured"});
  }

})

app.get('/finalresponse',async (req,res)=>{

  try{
    
    const fetch = await import('node-fetch').then(module => module.default);
    const month = req.query.month;
    const transactions = await fetch(`http://localhost:3000/transactions?month=${month}`);
    const transactionsdata = await transactions.json();
  
    const totaltransactions = await fetch(`http://localhost:3000/totaltransactions?month=${month}`);
    const totaltransactionsdata = await totaltransactions.json();
  
    const barchart = await fetch(`http://localhost:3000/barchart?month=${month}`);
    const barchartdata = await barchart.json();
  
    const piechart = await fetch(`http://localhost:3000/piechart?month=${month}`);
    const piechartdata = await piechart.json();
  
    res.status(200).json({transactions:transactionsdata,
      totaltransactions:totaltransactionsdata,
      barchart:barchartdata,
      piechart:piechartdata
    })
  }catch(err){
    console.log("some error occured ",err);
    res.status(500).json({msg:"some error occured"});
  }
})

app.listen(port, () => {
  console.log(` app listening on port ${port}`)
})

