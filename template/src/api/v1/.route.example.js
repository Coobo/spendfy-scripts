import express from 'express';

const router = express.Router();

import Auther from './../../lib/authentication/authenticator';
import Controller from './../../app/controllers/.controller.example';

const auther = new Auther();
const controller = new AccountsController();

router.route('/list').get(controller.action);

export default router;
