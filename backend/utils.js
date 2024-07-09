const {Client} = require("pg");

 async function dbfunc(){
    const client = new Client("postgresql://adityadb_owner:4OLGmHio6rWk@ep-late-recipe-a1p0ibki.ap-southeast-1.aws.neon.tech/adityadb?sslmode=require");
    await client.connect();
    console.log("database connected");
    return client;
}

async function datarange(month){
const client = await dbfunc();

const rangequery = `
SELECT
          CASE
              WHEN price BETWEEN 0 AND 100 THEN '0-100'
              WHEN price BETWEEN 101 AND 200 THEN '101-200'
              WHEN price BETWEEN 201 AND 300 THEN '201-300'
              WHEN price BETWEEN 301 AND 400 THEN '301-400'
              WHEN price BETWEEN 401 AND 500 THEN '401-500'
              WHEN price BETWEEN 501 AND 600 THEN '501-600'
              WHEN price BETWEEN 601 AND 700 THEN '601-700'
              WHEN price BETWEEN 701 AND 800 THEN '701-800'
              WHEN price BETWEEN 801 AND 900 THEN '801-900'
              WHEN price BETWEEN 901 AND 1000 THEN '901-1000'
              ELSE 'Other'
          END AS price_range,
          COUNT(*) AS num_items
      FROM Products
      WHERE EXTRACT(MONTH FROM dateofsale) = ${month}
      GROUP BY price_range
      ORDER BY MIN(price);
    `;


const data = await client.query(rangequery);
return data;
}

module.exports = {dbfunc,datarange};