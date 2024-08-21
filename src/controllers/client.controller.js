import { ClientModel } from '../model/client.model.js';

export const registerClient = async (req, res) => {
    try {
        const { dni, first_name, last_name, email, phone1 } = req.body;

        const existingClient = await ClientModel.findOne({ dni });
        if (existingClient) {
            return res.status(400).json({ error: 'El cliente ya está registrado.' });
        }

        const newClient = new ClientModel({
            dni,
            first_name,
            last_name,
            email,
            phone1
        });

        await newClient.save();
        res.status(201).json({ message: 'Cliente registrado exitosamente', client: newClient });
    } catch (error) {
        console.error('Error al registrar el cliente:', error);
        res.status(500).json({ error: 'Error al registrar el cliente.' });
    }
};
