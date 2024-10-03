import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';

import usersRouter from './routes/users.router.js';
import viewsRouter from './routes/views.router.js';
import config from './config.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/views', viewsRouter);
app.use('/api/users', usersRouter);
app.use('/static', express.static(`${config.DIRNAME}/public`));

const httpServer = app.listen(config.PORT, () => {
    console.log(`Server activo en puerto ${config.PORT}`);
});

const socketServer = new Server(httpServer);
const messages = [];

socketServer.on('connection', socket => {
    // Suscripción al tópico new_user_data (que envía un cliente cuando se conecta)
    socket.on('new_user_data', data => {
        // Envía a ESE cliente la lista actual de mensajes
        socket.emit('current_messages', messages);
        // y a TODOS LOS DEMÁS los datos del nuevo usuario que acaba de conectarse
        socket.broadcast.emit('new_user', data);
    });

    // Suscripción al tópico new_own_msg (que genera cualquier cliente al enviar un texto nuevo de chat)
    socket.on('new_own_msg', data => {
        messages.push(data);
        // Reenvía mensaje a TODOS los clientes conectados, INCLUYENDO el que mandó el msj original
        socketServer.emit('new_general_msg', data);
    });
});