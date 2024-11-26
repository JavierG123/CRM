const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database(':memory.sqlite:');

app.use(bodyParser.json());

db.serialize(()=>{
    db.run('DROP TABLE IF EXISTS customers', (err) => {
        if(err){
            console.error('Error al eliminar tabla antigua ',err.message);
        }
    });
    db.run(`CREATE TABLE customers (
        customerid INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL
        )`,(err)=>{
            if(err){
                console.error('Error al crear la tabla: ',err.message);
            }
        });
});

app.post('/customer/create',(req,res)=>{
    const {firstName, lastName, email, phone} = req.body;
    if(!firstName || !lastName || !email || !phone){
        return res.status(400).json({error: 'Faltan datos requeridos'});
    }

    const query = `INSERT INTO customers (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)`;
    db.run(query, [firstName, lastName, email, phone], function(err){
        if(err){
            return res.status(500).json({error: 'Error al crear contacto '})
        }
        res.status(200).json({mensaje: 'User created', userid: this.lastID})
    });
});

app.patch('/customer/update/:customerid',(req,res)=>{
    const {customerid} = req.params;
    const {email} = req.body;
    
    if(!email){
        return res.status(400).json({error: 'Error al actualizar email'});
    }
    const query = `UPDATE customers SET email = ? WHERE customerid = ?`;
    db.run(query, [email, customerid], function(err){
        if(err){
            return res.status(500).json({error: 'Error al actualizar tarea'})
        }
        if(this.changes === 0){
            return res.status(404).json({error: 'usuario no encontrado'})
        }
        res.status(200).json({mensaje: 'Tarea Acualizada'});
    });
});

app.get('/customer/all',(req, res) =>{
    const query = `SELECT * FROM customers`;
    db.all(query, [], (err, rows) => {
        if(err){
            return res.status(500).json({error: 'Error al obtener customers'});
        }
        res.status(200).json(rows);
    });
});

app.get('/customer/:customerid', (req,res) => {
    const {customerid} = req.params;
    const query = `SELECT * FROM customers WHERE customerid = ?`;
    db.get(query, [customerid], (err, row) => {
        if(err){
            return res.status(500).json({error: 'Error al buscar usuario'});
        }
        if (!row){
            return res.status(404).json({error: 'Usuario no encontrado'});
        }
        res.status(200).json(row);
    });
});

app.listen(port, () => {
    console.log(`Service running ${port}`);
});