const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const Email = Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim();

const Login = Joi.object({
    email: Email.required(),
    password: Joi.string().min(5).required()
});

const Register = Joi.object({
    email: Email.required(),
    password: Joi.string().min(5).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
});

const ProfileUpdate = Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
});


const getTransaction = client => {
    return new Promise(res => {
        client.transaction(trx => {
            res(trx);
        });
    });
};


const login = async (req, res) => {
    const trx = await getTransaction(db);
    try {
        const { error, value: data } = Login.validate(req.body);
        if (error) {
            await trx.rollback(error);
            return res.badRequest(error.message);
        }

        const {
            email,
            password
        } = data;

        const [user] = await db('users')
            .transacting(trx)
            .select(
                'id',
                'firstName',
                'lastName',
                'password',
                'email'
            )
            .where({
                email
            })
            .limit(1);

        console.log({ user });

        if (!user) {
            await trx.rollback('Invalid email');
            return res.badRequest('Invalid email');
        }

        if (
            !bcrypt.compareSync(password, user.password)
        ) {
            await trx.rollback('Password mismatch');
            return res.badRequest('Wrong password');
        }

        delete user.password;


        const token = jwt.sign({ email: user.email }, 'MaNaN-PaTeL');

        const result = {
            user,
            token
        };


        await trx.commit();

        return res.ok(result);
    } catch (error) {
        await trx.rollback(error);
        return res.internalServerError();
    }
};

const register = async (req, res) => {
    const trx = await getTransaction(db);
    try {
        const { error, value: data } = Register.validate(req.body);
        if (error) {
            await trx.rollback(error);
            return res.badRequest(error.message);
        }

        const {
            email,
            password,
            firstName,
            lastName
        } = data;

        const [userExist] = await db('users')
            .transacting(trx)
            .select(
                'email'
            )
            .where({
                email
            })
            .limit(1);


        if (userExist) {
            await trx.rollback('email exist');
            return res.badRequest('email exist');
        }

        const [user] = await db('users')
            .transacting(trx)
            .insert({
                email,
                password: bcrypt.hashSync(password, 8),
                firstName,
                lastName
            })
            .returning('*');

        delete user.password;

        const token = jwt.sign({ email: user.email }, 'MaNaN-PaTeL');

        const result = {
            user,
            token
        };

        await trx.commit();

        return res.ok(result);
    } catch (error) {
        await trx.rollback(error);
        return res.internalServerError();
    }
}
const getProfile = async (req, res) => {

    const { email } = req.user;

    const [user] = await db('users')
        .select(
            'email',
            'firstName',
            'lastName',
        )
        .where({
            email
        })
        .limit(1);


    return res.ok(user);

}
const updateProfile = async (req, res) => {

    const { email } = req.user;
    const { error, value: data } = ProfileUpdate.validate(req.body);
    const { firstName, lastName } = data;
    const [user] = await db('users')
        .update({
            firstName,
            lastName,
        })
        .where({
            email
        })
        .returning([
            'email',
            'firstName',
            'lastName',
        ]);


    return res.ok(user);

}
module.exports = { login, register, getProfile, updateProfile };