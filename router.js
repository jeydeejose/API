const express = require('express');
const router = express.Router();
const db  = require('./db');
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', signupValidation, (req, res, next) => 
{
    db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(req.body.email)});`,
    (err, result) => 
    {
        if (result.length) 
        {
            return res.status(409).send({msg: 'This user is already in database!'});
        } 
        else 
        {
        // username is available
            bcrypt.hash(req.body.password, 10, (err, hash) => 
            {
                if (err) 
                {
                    return res.status(500).send({msg: err});
                } 
                else 
                {
                    // has hashed pw => add to database
                    db.query(`INSERT INTO users (firstName, lastName, address, postCode, contactNumber, email, username, password) VALUES ('${req.body.firstName}', ${db.escape(req.body.lastName)}, ${db.escape(req.body.address)}, ${db.escape(req.body.postCode)}, ${db.escape(req.body.contactNumber)}, ${db.escape(req.body.email)}, ${db.escape(req.body.username)}, ${db.escape(hash)})`,
                    (err, result) => 
                    {
                        if (err) 
                        {
                            throw err;
                            return res.status(400).send({msg: err});
                        }
                        return res.status(201).send({msg: 'Successfully User Registration'});
                    });
                }
            });
        }
    });
});


router.post('/login', loginValidation, (req, res, next) => 
{
    db.query(`SELECT * FROM users WHERE email = ${db.escape(req.body.email)} or username = ${db.escape(req.body.username)};`,
    (err, result) => 
    {
        // user does not exists
        if (err) 
        {
            throw err;
            return res.status(400).send({msg: err});
        }
        if (!result.length) 
        {
            return res.status(401).send({msg: 'Email/Username or password is incorrect!'});
        }
        // check password
        bcrypt.compare(req.body.password, result[0]['password'],
        (bErr, bResult) => 
        {
            // wrong password
            if (bErr) 
            {
                throw bErr;
                return res.status(401).send({msg: 'Email or password is incorrect!'});
            }
            if (bResult) 
            {
                const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
                // db.query(
                // `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
                // );
                return res.status(200).send({
                msg: 'Logged in!',
                token,
                user: result[0]
                });
            }
            return res.status(401).send({
            msg: 'Username or password is incorrect!'
            });
        });
        // return res.status(200).send({msg: result});
    });
});



router.post('/get-users', signupValidation, (req, res, next) => 
{
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || 
    !req.headers.authorization.split(' ')[1])
    {
        return res.status(422).json({message: "Please provide the token",});
    }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
    db.query('SELECT * FROM users', decoded.id, function (error, results, fields) 
    {
    if (error) throw error;
    return res.send({ error: false, data: results, message: 'Fetch Successfully.' });
    });
});


router.post('/update-user', signupValidation, (req, res, next) => 
{
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || 
    !req.headers.authorization.split(' ')[1])
    {
        return res.status(422).json({message: "Please provide the token",});
    }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
    db.query(`SELECT * FROM users WHERE id = ${db.escape(req.body.id)};`,
    (err, result) => 
    {
        if (result.length===0) 
        {
            return res.status(409).send({msg: 'This user is not in database!'});
        } 
            db.query(`UPDATE users SET firstName=${db.escape(req.body.firstName)}, lastName=${db.escape(req.body.lastName)}, address=${db.escape(req.body.address)}, postCode=${db.escape(req.body.postCode)}, contactNumber=${db.escape(req.body.contactNumber)} WHERE id=${db.escape(req.body.id)};`,
            (error, result) => 
            {
                if (error) throw error;
                return res.send({ error: false, data: result.message, message: 'Updated Successfully.' });
            });
    });    

});

router.post('/delete-user', signupValidation, (req, res, next) => 
{
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || 
    !req.headers.authorization.split(' ')[1])
    {
        return res.status(422).json({message: "Please provide the token",});
    }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
    db.query(`SELECT * FROM users WHERE id = ${db.escape(req.body.id)};`,
    (err, result) => 
    {
        if (result.length===0) 
        {
            return res.status(409).send({msg: 'This user is not in database!'});
        } 
            db.query(`DELETE FROM users WHERE id=${db.escape(req.body.id)};`,
            (error, result) => 
            {
                if (error) throw error;
                return res.send({ error: false, data: result.message, message: 'Deleted Successfully.' });
            });
    });    

});

router.post('/multiple-delete-user', signupValidation, (req, res, next) => 
{
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer') || 
    !req.headers.authorization.split(' ')[1])
    {
        return res.status(422).json({message: "Please provide the token",});
    }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');

    db.query('SELECT * FROM users where id IN ('+req.body.id+')',
    (err, result) => 
    {

        if (result.length==0) 
        {
            return res.status(409).send({msg: 'This user is not in database!'});
        } 
            db.query('DELETE FROM users WHERE id IN ('+req.body.id+')',
            (error, result) => 
            {
                if (error) throw error;
                return res.send({ error: false, data: result.affectedRows, message: 'Multiple Deleted Successfully.' });
            });
    });    

});



module.exports = router;